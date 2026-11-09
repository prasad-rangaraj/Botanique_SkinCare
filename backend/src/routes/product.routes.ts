import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { body, query, validationResult } from 'express-validator';

export const productRouter = Router();

// Get all published products (public)
productRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      category, search, minPrice, maxPrice, sort = 'createdAt',
      order = 'desc', page = '1', limit = '12', featured,
    } = req.query;

    const where: Record<string, unknown> = { isPublished: true };

    if (category) where.category = { slug: category };
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice as string);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const validSortFields = ['price', 'createdAt', 'name'];
    const sortField = validSortFields.includes(sort as string) ? (sort as string) : 'createdAt';
    const orderDir = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          category: { select: { name: true, slug: true } },
          ingredients: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { reviews: { where: { isApproved: true } } } },
        },
        orderBy: { [sortField]: orderDir },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
});

// Get categories
productRouter.get('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isPublished: true } } } } },
    });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

// Get featured products
productRouter.get('/featured', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: { isPublished: true, isFeatured: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, slug: true } },
        ingredients: { orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// Get single product by slug
productRouter.get('/:slug', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const product = await prisma.product.findFirst({
      where: { slug, isPublished: true },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: true,
        ingredients: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) throw new AppError('Product not found', 404);

    // Related products
    const related = await prisma.product.findMany({
      where: {
        isPublished: true,
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      take: 4,
    });

    res.json({ success: true, product, related });
  } catch (error) {
    next(error);
  }
});

// Admin: Get all products
productRouter.get('/admin/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { name: true, slug: true } },
        ingredients: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
});

// Admin: Create product
productRouter.post(
  '/admin',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('size').trim().notEmpty(),
    body('unit').trim().notEmpty(),
    body('stock').isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

      const {
        name, description, shortDesc, categoryId, price, comparePrice,
        size, unit, stock, sku, isPublished, isFeatured, usageNotes,
        safetyNotes, ingredients = [], images = [],
      } = req.body;

      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const product = await prisma.product.create({
        data: {
          name, description, shortDesc, categoryId, price, comparePrice,
          size, unit, stock: parseInt(stock), sku, slug,
          isPublished: Boolean(isPublished), isFeatured: Boolean(isFeatured),
          usageNotes, safetyNotes,
          ingredients: { create: ingredients.map((ing: { name: string; purpose?: string }, i: number) => ({ ...ing, sortOrder: i })) },
          images: { create: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({ ...img, sortOrder: i, isPrimary: i === 0 })) },
        },
        include: { images: true, ingredients: true, category: true },
      });

      await prisma.auditLog.create({
        data: { userId: req.user!.id, action: 'CREATE', entity: 'Product', entityId: product.id, newValues: { name: product.name } },
      });

      res.status(201).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }
);

// Admin: Update product
productRouter.put('/admin/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id as string;
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new AppError('Product not found', 404);

    const { ingredients, images, ...rest } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...rest,
        ...(ingredients && {
          ingredients: {
            deleteMany: {},
            create: ingredients.map((ing: { name: string; purpose?: string }, i: number) => ({ ...ing, sortOrder: i })),
          },
        }),
        ...(images && {
          images: {
            deleteMany: {},
            create: images.map((img: { url: string; altText?: string; isPrimary?: boolean }, i: number) => ({ ...img, sortOrder: i, isPrimary: i === 0 })),
          },
        }),
      },
      include: { images: true, ingredients: true, category: true },
    });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', entity: 'Product', entityId: product.id, newValues: rest },
    });

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
});

// Admin: Delete product
productRouter.delete('/admin/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id as string;
    await prisma.product.delete({ where: { id: productId } });
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'DELETE', entity: 'Product', entityId: productId },
    });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
});

