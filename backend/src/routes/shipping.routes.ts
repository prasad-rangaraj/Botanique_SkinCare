import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

export const shippingRouter = Router();

shippingRouter.post('/check-pincode', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { pincode } = req.body;
    const zone = await prisma.shippingZone.findFirst({
      where: { pincodes: { has: pincode }, isActive: true },
    });

    if (!zone) {
      return res.json({
        success: true,
        serviceable: false,
        message: 'Delivery not available to this PIN code currently.',
      });
    }

    res.json({
      success: true,
      serviceable: true,
      deliveryCharge: zone.deliveryCharge,
      estimatedDays: zone.estimatedDays,
      zoneName: zone.name,
    });
  } catch (error) {
    next(error);
  }
});

shippingRouter.get('/zones', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { isActive: true },
      select: { name: true, estimatedDays: true, deliveryCharge: true },
    });
    res.json({ success: true, zones });
  } catch (error) {
    next(error);
  }
});

