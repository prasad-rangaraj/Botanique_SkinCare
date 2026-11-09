import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

export const newsletterRouter = Router();

newsletterRouter.post(
  '/subscribe',
  [body('email').isEmail().normalizeEmail()],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError('Valid email is required', 400);

      const { email } = req.body;
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: { isActive: true },
        create: { email },
      });
      res.json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

newsletterRouter.post('/unsubscribe', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    await prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    next(error);
  }
});

