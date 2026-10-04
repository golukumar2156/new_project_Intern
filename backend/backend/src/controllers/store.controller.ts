import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { rateStoreSchema } from '../utils/validators.js';

export const getStoresForUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: any = {};

    // Support flexible searching by name and/or address
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { address: { contains: String(search) } },
      ];
    } else {
      if (name) where.name = { contains: String(name) };
      if (address) where.address = { contains: String(address) };
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: {
          select: {
            id: true,
            rating: true,
            userId: true,
          },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      const totalCount = s.ratings.length;
      const overallRating =
        totalCount > 0
          ? Number((s.ratings.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
          : 0;

      const userRatingObj = userId ? s.ratings.find((r) => r.userId === userId) : null;
      const userRating = userRatingObj ? userRatingObj.rating : null;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating,
        totalRatings: totalCount,
        userRating,
      };
    });

    // Sorting
    const validSortFields = ['name', 'address', 'overallRating', 'userRating'];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'name';
    const order = String(sortOrder).toLowerCase() === 'desc' ? 'desc' : 'asc';

    formattedStores.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === null || valA === undefined) valA = order === 'asc' ? Infinity : -Infinity;
      if (valB === null || valB === undefined) valB = order === 'asc' ? Infinity : -Infinity;

      if (typeof valA === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });

    return res.json({ stores: formattedStores });
  } catch (error) {
    console.error('Get stores for user error:', error);
    return res.status(500).json({ error: 'Failed to retrieve store listings' });
  }
};

export const submitRating = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { storeId } = req.params;

    const parseResult = rateStoreSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { rating } = parseResult.data;

    // Check if store exists
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Upsert rating (create or modify existing rating)
    const ratingRecord = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        rating,
      },
      create: {
        userId,
        storeId,
        rating,
      },
    });

    return res.json({
      message: 'Rating submitted successfully',
      rating: ratingRecord,
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    return res.status(500).json({ error: 'Failed to submit rating' });
  }
};
