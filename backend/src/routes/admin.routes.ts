import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, requireAdmin, requireStaffOrAdmin, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

export const adminRouter = Router();

// Allow STAFF, ADMIN, and SUPER_ADMIN to access admin workspace
adminRouter.use(authenticate, requireStaffOrAdmin);

// Dashboard stats
adminRouter.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalOrders, totalCustomers, pendingOrders, revenue,
      recentOrders, topProducts, pendingReturns, pendingRefunds,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          payment: { select: { status: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      prisma.returnRequest.count({ where: { status: 'PENDING' } }),
      prisma.refundRequest.count({ where: { status: 'PENDING' } }),
    ]);

    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          include: { images: { where: { isPrimary: true } } },
        });
        return { product, totalSold: tp._sum.quantity };
      })
    );

    res.json({
      success: true,
      stats: {
        totalOrders, totalCustomers, pendingOrders,
        totalRevenue: revenue._sum.amount || 0,
        pendingReturns, pendingRefunds,
      },
      recentOrders,
      topProducts: topProductDetails,
    });
  } catch (error) {
    next(error);
  }
});

// Customer management
adminRouter.get('/customers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const where: Record<string, unknown> = { role: 'CUSTOMER' };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, firstName: true, lastName: true,
          phone: true, isActive: true, createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, customers, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/customers/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.id as string;
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      include: {
        addresses: true,
        orders: {
          include: { payment: { select: { status: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { orders: true } },
      },
    });
    if (!customer) throw new AppError('Customer not found', 404);
    const { password: _, ...safeCustomer } = customer;
    res.json({ success: true, customer: safeCustomer });
  } catch (error) {
    next(error);
  }
});

// Site settings
adminRouter.get('/settings', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.siteSettings.findMany();
    const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {} as Record<string, string>);
    res.json({ success: true, settings: settingsMap });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/settings', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updates = req.body as Record<string, string>;
    for (const [key, value] of Object.entries(updates)) {
      await prisma.siteSettings.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    await prisma.auditLog.create({
      data: { userId: req.user!.id, action: 'UPDATE', entity: 'SiteSettings', newValues: updates },
    });
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    next(error);
  }
});

// FAQs
adminRouter.get('/faqs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, faqs });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/faqs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const faq = await prisma.fAQ.create({ data: req.body });
    res.status(201).json({ success: true, faq });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/faqs/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const faqId = req.params.id as string;
    const faq = await prisma.fAQ.update({ where: { id: faqId }, data: req.body });
    res.json({ success: true, faq });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/faqs/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const faqId = req.params.id as string;
    await prisma.fAQ.delete({ where: { id: faqId } });
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    next(error);
  }
});

// Return/Refund/Replacement request management
adminRouter.get('/requests', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [returns, refunds, replacements] = await Promise.all([
      prisma.returnRequest.findMany({ include: { order: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } }, orderBy: { createdAt: 'desc' } }),
      prisma.refundRequest.findMany({ include: { order: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } }, orderBy: { createdAt: 'desc' } }),
      prisma.replacementRequest.findMany({ include: { order: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } }, orderBy: { createdAt: 'desc' } }),
    ]);
    res.json({ success: true, returns, refunds, replacements });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/requests/return/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reqId = req.params.id as string;
    const { status, adminNote } = req.body;
    const updated = await prisma.returnRequest.update({
      where: { id: reqId },
      data: { status, adminNote },
    });
    res.json({ success: true, request: updated });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/requests/refund/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reqId = req.params.id as string;
    const { status, adminNote } = req.body;
    const updated = await prisma.refundRequest.update({
      where: { id: reqId },
      data: { status, adminNote },
    });
    if (status === 'APPROVED') {
      await prisma.order.update({ where: { id: updated.orderId }, data: { status: 'REFUNDED' } });
      await prisma.payment.update({ where: { orderId: updated.orderId }, data: { status: 'REFUNDED' } });
    }
    res.json({ success: true, request: updated });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/requests/replacement/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const reqId = req.params.id as string;
    const { status, adminNote } = req.body;
    const updated = await prisma.replacementRequest.update({
      where: { id: reqId },
      data: { status, adminNote },
    });
    res.json({ success: true, request: updated });
  } catch (error) {
    next(error);
  }
});

// Audit logs
adminRouter.get('/audit-logs', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, logs });
  } catch (error) {
    next(error);
  }
});

// Contact messages
adminRouter.get('/messages', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
});

adminRouter.patch('/messages/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const msgId = req.params.id as string;
    const msg = await prisma.contactMessage.update({
      where: { id: msgId },
      data: { isRead: true, adminNote: req.body.adminNote },
    });
    res.json({ success: true, message: msg });
  } catch (error) {
    next(error);
  }
});

// Shipping zones
adminRouter.get('/shipping-zones', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zones = await prisma.shippingZone.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, zones });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/shipping-zones', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zone = await prisma.shippingZone.create({ data: req.body });
    res.status(201).json({ success: true, zone });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/shipping-zones/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zoneId = req.params.id as string;
    const zone = await prisma.shippingZone.update({ where: { id: zoneId }, data: req.body });
    res.json({ success: true, zone });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/shipping-zones/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zoneId = req.params.id as string;
    await prisma.shippingZone.delete({ where: { id: zoneId } });
    res.json({ success: true, message: 'Zone deleted' });
  } catch (error) {
    next(error);
  }
});

// Categories
adminRouter.get('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, categories });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/categories', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, imageUrl } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cat = await prisma.category.create({ data: { name, slug, description, imageUrl } });
    res.status(201).json({ success: true, category: cat });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/categories/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const catId = req.params.id as string;
    const cat = await prisma.category.update({ where: { id: catId }, data: req.body });
    res.json({ success: true, category: cat });
  } catch (error) {
    next(error);
  }
});

// Newsletter subscribers
adminRouter.get('/newsletter-subscribers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({ where: { isActive: true }, orderBy: { subscribedAt: 'desc' } });
    res.json({ success: true, subscribers });
  } catch (error) {
    next(error);
  }
});

