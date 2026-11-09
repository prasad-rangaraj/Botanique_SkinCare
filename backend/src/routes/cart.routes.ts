import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';

export const cartRouter = Router();

// Get cart
cartRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true } } },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
      });
    }

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
});

// Add to cart
cartRouter.post('/add', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) throw new AppError('Product ID is required', 400);

    const product = await prisma.product.findFirst({
      where: { id: productId, isPublished: true },
    });
    if (!product) throw new AppError('Product not found', 404);
    if (product.stock < quantity) throw new AppError('Insufficient stock', 400);

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (product.stock < newQty) throw new AppError('Insufficient stock', 400);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { include: { images: { where: { isPrimary: true } } } } },
        },
      },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// Update cart item
cartRouter.put('/items/:itemId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.itemId as string;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) throw new AppError('Invalid quantity', 400);

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) throw new AppError('Cart not found', 404);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });
    if (!item) throw new AppError('Item not found in cart', 404);

    if (item.product.stock < quantity) throw new AppError('Insufficient stock', 400);

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// Remove from cart
cartRouter.delete('/items/:itemId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const itemId = req.params.itemId as string;
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) throw new AppError('Cart not found', 404);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new AppError('Item not found', 404);

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: { include: { images: { where: { isPrimary: true } } } } } } },
    });

    res.json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
});

// Clear cart
cartRouter.delete('/clear', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) return res.json({ success: true, message: 'Cart already empty' });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
});

