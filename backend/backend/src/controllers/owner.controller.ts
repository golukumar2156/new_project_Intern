import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getOwnerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Find the store assigned to this owner
    const store = await prisma.store.findFirst({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!store) {
      return res.json({
        hasStore: false,
        store: null,
        averageRating: 0,
        totalRatings: 0,
        ratingUsers: [],
      });
    }

    const totalRatings = store.ratings.length;
    const averageRating =
      totalRatings > 0
        ? Number((store.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings).toFixed(1))
        : 0;

    const ratingUsers = store.ratings.map((r) => ({
      id: r.id,
      userId: r.user.id,
      userName: r.user.name,
      userEmail: r.user.email,
      userAddress: r.user.address,
      rating: r.rating,
      submittedAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    // Sorting rating users
    const validSortFields = ['userName', 'userEmail', 'rating', 'submittedAt'];
    const field = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'submittedAt';
    const order = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    ratingUsers.sort((a: any, b: any) => {
      let valA = a[field];
      let valB = b[field];

      if (typeof valA === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

    return res.json({
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
      },
      averageRating,
      totalRatings,
      ratingUsers,
    });
  } catch (error) {
    console.error('Get owner dashboard error:', error);
    return res.status(500).json({ error: 'Failed to retrieve owner dashboard details' });
  }
};
