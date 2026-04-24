import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';

const router = Router();
router.use(authenticate);

router.get('/monthly-expenses', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user_id = req.user!.id;
    
    const now = new Date();
    // Get start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenseSum = await prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        timestamp: { gte: startOfMonth },
        trip: { user_id }
      }
    });

    res.json({ total: expenseSum._sum.amount || 0 });
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
    res.status(500).json({ error: 'Failed to fetch monthly expenses' });
  }
});

export default router;
