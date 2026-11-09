import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

export const contactRouter = Router();

contactRouter.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

      const { name, email, phone, subject, message } = req.body;
      const msg = await prisma.contactMessage.create({
        data: { name, email, phone, subject, message },
      });
      res.status(201).json({ success: true, message: 'Message sent successfully', id: msg.id });
    } catch (error) {
      next(error);
    }
  }
);

