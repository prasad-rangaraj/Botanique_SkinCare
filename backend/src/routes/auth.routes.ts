import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';

export const authRouter = Router();

const generateToken = (id: string, email: string, role: string): string => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET as string, {
    expiresIn: '7d',
  });
};

// Register
authRouter.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
      }

      const { email, password, firstName, lastName, phone } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError('An account with this email already exists', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, firstName, lastName, phone },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });

      const token = generateToken(user.id, user.email, user.role);
      res.status(201).json({ success: true, token, user });
    } catch (error) {
      next(error);
    }
  }
);

// Login
authRouter.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Invalid email or password', 400);
      }

      const { email, password } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || !user.isActive) {
        throw new AppError('Invalid email or password', 401);
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      const token = generateToken(user.id, user.email, user.role);
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get current user
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, createdAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Change password
authRouter.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) throw new AppError('User not found', 404);

      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) throw new AppError('Current password is incorrect', 400);

      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

