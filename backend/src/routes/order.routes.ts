import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const orderRouter = Router();

// Create order
orderRouter.post('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { addressId, notes } = req.body;

    // Get cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Validate address
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id },
    });
    if (!address) throw new AppError('Delivery address not found', 400);

    // Calculate totals
    let subtotal = 0;
    for (const item of cart.items) {
      if (!item.product.isPublished) throw new AppError(`Product ${item.product.name} is no longer available`, 400);
      if (item.product.stock < item.quantity) throw new AppError(`Insufficient stock for ${item.product.name}`, 400);
      subtotal += Number(item.product.price) * item.quantity;
    }

    // Calculate delivery charge
    const zone = await prisma.shippingZone.findFirst({
      where: { pincodes: { has: address.pincode }, isActive: true },
    });

    const deliveryCharge = zone ? Number(zone.deliveryCharge) : 0;
    const total = subtotal + deliveryCharge;
    const orderRef = `BOT-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderRef,
          userId: req.user!.id,
          addressId,
          subtotal,
          deliveryCharge,
          total,
          notes,
          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              productSize: item.product.size,
              quantity: item.quantity,
              unitPrice: item.product.price,
              totalPrice: Number(item.product.price) * item.quantity,
            })),
          },
        },
        include: { items: true, address: true },
      });

      // Create payment record
      await tx.payment.create({
        data: { orderId: newOrder.id, amount: total, status: 'PENDING' },
      });

      // Decrement stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Get order by ID (customer)
orderRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(req.user!.role === 'CUSTOMER' && { userId: req.user!.id }),
      },
      include: {
        items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } },
        payment: true,
        shipment: true,
        address: true,
        returnRequests: true,
        refundRequests: true,
        replacementRequests: true,
      },
    });
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Request cancellation
orderRouter.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
    });
    if (!order) throw new AppError('Order not found', 404);

    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('This order cannot be cancelled at this stage', 400);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    });

    res.json({ success: true, message: 'Cancellation request submitted for review' });
  } catch (error) {
    next(error);
  }
});

// Request return
orderRouter.post('/:id/return', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { reason } = req.body;
    if (!reason) throw new AppError('Reason is required', 400);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id, status: 'DELIVERED' },
    });
    if (!order) throw new AppError('Order not found or not eligible for return', 404);

    const returnReq = await prisma.returnRequest.create({
      data: { orderId: order.id, reason },
    });
    res.status(201).json({ success: true, returnRequest: returnReq });
  } catch (error) {
    next(error);
  }
});

// Request refund
orderRouter.post('/:id/refund', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { reason } = req.body;
    if (!reason) throw new AppError('Reason is required', 400);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
      include: { payment: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    if (!['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new AppError('Refund not available for this order status', 400);
    }

    const refundReq = await prisma.refundRequest.create({
      data: { orderId: order.id, reason, amount: order.total },
    });
    res.status(201).json({ success: true, refundRequest: refundReq });
  } catch (error) {
    next(error);
  }
});

// Request replacement
orderRouter.post('/:id/replacement', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { reason } = req.body;
    if (!reason) throw new AppError('Reason is required', 400);

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id, status: 'DELIVERED' },
    });
    if (!order) throw new AppError('Order not found or not eligible for replacement', 404);

    const replReq = await prisma.replacementRequest.create({
      data: { orderId: order.id, reason },
    });
    res.status(201).json({ success: true, replacementRequest: replReq });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all orders
orderRouter.get('/admin/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          items: true,
          payment: { select: { status: true, method: true } },
          address: true,
          shipment: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ success: true, orders, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
});

// Admin: Update order status
orderRouter.patch('/admin/:id/status', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { status } = req.body;
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUND_REQUESTED', 'REFUNDED'];
    if (!validStatuses.includes(status)) throw new AppError('Invalid status', 400);

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE_STATUS', entity: 'Order', entityId: order.id, newValues: { status } },
    });

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

// Admin: Add shipment info
orderRouter.put('/admin/:id/shipment', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { courierName, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const shipment = await prisma.shipment.upsert({
      where: { orderId },
      update: { courierName, trackingNumber, trackingUrl, estimatedDelivery, shippedAt: new Date() },
      create: { orderId, courierName, trackingNumber, trackingUrl, estimatedDelivery, shippedAt: new Date() },
    });
    await prisma.order.update({ where: { id: orderId }, data: { status: 'SHIPPED' } });
    res.json({ success: true, shipment });
  } catch (error) {
    next(error);
  }
});

