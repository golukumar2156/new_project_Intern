import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { addUserSchema, addStoreSchema } from '../utils/validators.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();
    const pendingVendors = await prisma.user.count({
      where: { role: 'STORE_OWNER', status: 'PENDING' },
    });

    return res.json({
      totalUsers,
      totalStores,
      totalRatings,
      pendingVendors,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};

export const addUser = async (req: Request, res: Response) => {
  try {
    const parseResult = addUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, address, password, role } = parseResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        password: hashedPassword,
        role,
        status: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Add user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { name, email, address, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};
    if (name) where.name = { contains: String(name) };
    if (email) where.email = { contains: String(email) };
    if (address) where.address = { contains: String(address) };
    if (role) where.role = String(role);
    if (status) where.status = String(status);

    const validSortFields = ['name', 'email', 'address', 'role', 'status', 'createdAt'];
    const field = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    const order = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [field]: order },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    // Format response to include average rating for store owners
    const formattedUsers = users.map((u) => {
      let rating: number | null = null;
      if (u.role === 'STORE_OWNER' && u.stores.length > 0) {
        const allRatings = u.stores.flatMap((s) => s.ratings.map((r) => r.rating));
        if (allRatings.length > 0) {
          const sum = allRatings.reduce((acc, r) => acc + r, 0);
          rating = Number((sum / allRatings.length).toFixed(1));
        } else {
          rating = 0;
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        status: u.status || 'APPROVED',
        rating,
        storeName: u.stores[0]?.name || null,
        createdAt: u.createdAt,
      };
    });

    // If sorting by rating
    if (sortBy === 'rating') {
      formattedUsers.sort((a, b) => {
        const rA = a.rating ?? -1;
        const rB = b.rating ?? -1;
        return order === 'asc' ? rA - rB : rB - rA;
      });
    }

    return res.json({ users: formattedUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        status: true,
        createdAt: true,
        stores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: {
              select: { rating: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let rating: number | null = null;
    if (user.role === 'STORE_OWNER' && user.stores.length > 0) {
      const allRatings = user.stores.flatMap((s) => s.ratings.map((r) => r.rating));
      if (allRatings.length > 0) {
        const sum = allRatings.reduce((acc, r) => acc + r, 0);
        rating = Number((sum / allRatings.length).toFixed(1));
      } else {
        rating = 0;
      }
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        status: user.status || 'APPROVED',
        rating,
        stores: user.stores,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    return res.status(500).json({ error: 'Failed to retrieve user details' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED, PENDING, or REJECTED' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    return res.json({
      message: `User status updated to ${status}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const addStore = async (req: Request, res: Response) => {
  try {
    const parseResult = addStoreSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, address, ownerId } = parseResult.data;

    // Validate owner exists and is a store owner if provided
    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({ error: 'Specified store owner not found' });
      }
      if (owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ error: 'User is not a STORE_OWNER' });
      }
    }

    const store = await prisma.store.create({
      data: {
        name,
        email,
        address,
        ownerId: ownerId || null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      message: 'Store added successfully',
      store,
    });
  } catch (error) {
    console.error('Add store error:', error);
    return res.status(500).json({ error: 'Failed to create store' });
  }
};

export const getStores = async (req: Request, res: Response) => {
  try {
    const { name, email, address, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where: any = {};
    if (name) where.name = { contains: String(name) };
    if (email) where.email = { contains: String(email) };
    if (address) where.address = { contains: String(address) };

    const validSortFields = ['name', 'email', 'address', 'createdAt'];
    const field = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'createdAt';
    const order = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const stores = await prisma.store.findMany({
      where,
      orderBy: { [field]: order },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { rating: true },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      const ratingCount = s.ratings.length;
      const overallRating =
        ratingCount > 0
          ? Number((s.ratings.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(1))
          : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: overallRating,
        ratingCount,
        owner: s.owner,
        createdAt: s.createdAt,
      };
    });

    // If sorting by rating
    if (sortBy === 'rating') {
      formattedStores.sort((a, b) => {
        return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      });
    }

    return res.json({ stores: formattedStores });
  } catch (error) {
    console.error('Get stores error:', error);
    return res.status(500).json({ error: 'Failed to retrieve stores' });
  }
};
