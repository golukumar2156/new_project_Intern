import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing records
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. Create System Admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator Account', // 28 chars
      email: 'admin@storerating.com',
      password: defaultPassword,
      address: '742 Evergreen Terrace, Suite 100, Springfield, OR 97477',
      role: 'SYSTEM_ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // 2. Create Store Owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Elizabeth Charlotte Montgomery', // 31 chars
      email: 'owner1@storerating.com',
      password: defaultPassword,
      address: '100 Market Street, Financial District, San Francisco, CA 94105',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Bartholomew Christopher Vance', // 30 chars
      email: 'owner2@storerating.com',
      password: defaultPassword,
      address: '500 Fifth Avenue, Midtown, New York, NY 10110',
      role: 'STORE_OWNER',
    },
  });
  console.log('✅ Store owners created');

  // 3. Create Normal Users
  const user1 = await prisma.user.create({
    data: {
      name: 'Jonathan Edward Starling Smith', // 31 chars
      email: 'user1@storerating.com',
      password: defaultPassword,
      address: '123 Maple Street, Apt 4B, Seattle, WA 98101',
      role: 'NORMAL_USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Samantha Victoria Abernathy', // 28 chars
      email: 'user2@storerating.com',
      password: defaultPassword,
      address: '456 Oak Avenue, Austin, TX 78701',
      role: 'NORMAL_USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Alexander Harrison Wellington', // 30 chars
      email: 'user3@storerating.com',
      password: defaultPassword,
      address: '789 Pine Road, Chicago, IL 60601',
      role: 'NORMAL_USER',
    },
  });
  console.log('✅ Normal users created');

  // 4. Create Stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Apex Supermarket & Electronics',
      email: 'contact@apexsupermarket.com',
      address: '100 Market Street, San Francisco, CA 94105',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Urban Gourmet Organic Bakery',
      email: 'hello@urbangourmet.com',
      address: '500 Fifth Avenue, New York, NY 10110',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Horizon Books & Artisan Coffee',
      email: 'info@horizonbooks.com',
      address: '221B Baker Street, London, NW1 6XE',
      ownerId: null,
    },
  });
  console.log('✅ Stores created');

  // 5. Create Ratings
  await prisma.rating.createMany({
    data: [
      { userId: user1.id, storeId: store1.id, rating: 5 },
      { userId: user2.id, storeId: store1.id, rating: 4 },
      { userId: user3.id, storeId: store1.id, rating: 5 },
      { userId: user1.id, storeId: store2.id, rating: 3 },
      { userId: user2.id, storeId: store2.id, rating: 4 },
      { userId: user3.id, storeId: store3.id, rating: 5 },
    ],
  });
  console.log('✅ Ratings created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
