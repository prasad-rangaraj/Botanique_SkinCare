import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const wishlistRouter = Router();

wishlistRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        product: { include: { images: { where: { isPrimary: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.post('/:productId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId as string;
    const product = await prisma.product.findFirst({
      where: { id: productId, isPublished: true },
    });
    if (!product) throw new AppError('Product not found', 404);

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from wishlist', inWishlist: false });
    }

    await prisma.wishlist.create({
      data: { userId: req.user!.id, productId },
    });
    res.json({ success: true, message: 'Added to wishlist', inWishlist: true });
  } catch (error) {
    next(error);
  }
});

wishlistRouter.delete('/:productId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId as string;
    await prisma.wishlist.deleteMany({
      where: { userId: req.user!.id, productId },
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    next(error);
  }
});

