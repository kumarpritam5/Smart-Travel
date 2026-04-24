import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const tripSchema = z.object({
  id: z.string(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date().nullable().optional(),
  distance: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
  start_lat: z.number().nullable().optional(),
  start_lng: z.number().nullable().optional(),
  end_lat: z.number().nullable().optional(),
  end_lng: z.number().nullable().optional(),
  start_point: z.string().nullable().optional(),
  destination: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  total_expense: z.number().optional().default(0),
});

const routePointSchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.coerce.date(),
});

const expenseSchema = z.object({
  id: z.string(),
  trip_id: z.string(),
  amount: z.number(),
  category: z.string(),
  note: z.string().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  timestamp: z.coerce.date(),
  is_auto: z.boolean().optional().default(false),
});

// Use transactions to batch upsert
router.post('/trips', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user!.id;
    const trips = z.array(tripSchema).parse(req.body.trips);

    const operations = trips.map(trip => prisma.trip.upsert({
      where: { id: trip.id },
      update: {
        ...trip,
        user_id,
      },
      create: {
        ...trip,
        user_id,
      }
    }));

    await prisma.$transaction(operations);
    res.json({ message: 'Trips synced successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to sync trips' });
  }
});

router.post('/routes', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const points = z.array(routePointSchema).parse(req.body.routePoints);

    const operations = points.map(pt => prisma.routePoint.upsert({
      where: { id: pt.id },
      update: pt,
      create: pt,
    }));

    await prisma.$transaction(operations);
    res.json({ message: 'Route points synced successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to sync route points' });
  }
});

router.post('/expenses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const expenses = z.array(expenseSchema).parse(req.body.expenses);

    const operations = expenses.map(exp => prisma.expense.upsert({
      where: { id: exp.id },
      update: exp,
      create: exp,
    }));

    await prisma.$transaction(operations);
    res.json({ message: 'Expenses synced successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });

      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to sync expenses' });
  }
});

export default router;
