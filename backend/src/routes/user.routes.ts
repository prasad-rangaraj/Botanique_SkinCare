import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

export const userRouter = Router();

// Get user profile
userRouter.get('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, createdAt: true,
        addresses: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Update profile
userRouter.put(
  '/profile',
  authenticate,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().isMobilePhone('any'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { firstName, lastName, phone } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { firstName, lastName, phone },
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      });
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  }
);

// Addresses
userRouter.get('/addresses', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
});

userRouter.post(
  '/addresses',
  authenticate,
  [
    body('fullName').trim().notEmpty(),
    body('phone').notEmpty(),
    body('line1').trim().notEmpty(),
    body('city').trim().notEmpty(),
    body('state').trim().notEmpty(),
    body('pincode').matches(/^[1-9][0-9]{5}$/).withMessage('Invalid PIN code'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

      const { fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;

      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: req.user!.id },
          data: { isDefault: false },
        });
      }

      const address = await prisma.address.create({
        data: { userId: req.user!.id, fullName, phone, line1, line2, city, state, pincode, isDefault: isDefault || false },
      });
      res.status(201).json({ success: true, address });
    } catch (error) {
      next(error);
    }
  }
);

userRouter.put('/addresses/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const addressId = req.params.id as string;
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id },
    });
    if (!address) throw new AppError('Address not found', 404);

    if (req.body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: req.body,
    });
    res.json({ success: true, address: updated });
  } catch (error) {
    next(error);
  }
});

userRouter.delete('/addresses/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const addressId = req.params.id as string;
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: req.user!.id },
    });
    if (!address) throw new AppError('Address not found', 404);

    await prisma.address.delete({ where: { id: addressId } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
});

// Order history
userRouter.get('/orders', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } },
        payment: { select: { status: true, method: true } },
        shipment: true,
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

userRouter.get('/orders/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
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

