import { Router, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const paymentRouter = Router();

const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
    throw new AppError('Payment gateway not configured. Please contact support.', 503);
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// Create Razorpay order
paymentRouter.post('/create-order', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
      include: { payment: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (order.payment?.status === 'PAID') throw new AppError('Order already paid', 400);

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(Number(order.total) * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderRef,
    });

    await prisma.payment.update({
      where: { orderId },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment
paymentRouter.post('/verify', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === 'placeholder_secret') {
      throw new AppError('Payment gateway not configured', 503);
    }

    // Verify signature server-side (critical security step)
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      await prisma.payment.update({
        where: { orderId },
        data: { status: 'FAILED', failureReason: 'Invalid payment signature' },
      });
      throw new AppError('Payment verification failed', 400);
    }

    // Mark payment as paid
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: 'PAID',
          paidAt: new Date(),
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CONFIRMED' },
      });
    });

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    next(error);
  }
});

// Payment failure
paymentRouter.post('/failure', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, reason } = req.body;
    await prisma.payment.update({
      where: { orderId },
      data: { status: 'FAILED', failureReason: reason },
    });
    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    next(error);
  }
});

