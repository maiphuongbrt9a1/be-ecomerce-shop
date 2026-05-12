/**
 * Seed two fresh demo accounts (active, no cart) for testing the
 * "first add-to-cart auto-creates a cart" path on the frontend.
 *
 * Run: npx ts-node -r tsconfig-paths/register scripts/seed-demo-users.ts
 */

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

interface DemoUser {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

const demos: DemoUser[] = [
  {
    email: 'demo-add-one@pap.le',
    username: 'demo_add_one',
    password: 'demo12345',
    firstName: 'Demo',
    lastName: 'AddOne',
    phone: '0900000001',
  },
  {
    email: 'demo-add-all@pap.le',
    username: 'demo_add_all',
    password: 'demo12345',
    firstName: 'Demo',
    lastName: 'AddAll',
    phone: '0900000002',
  },
];

async function ensureNoCart(userId: bigint) {
  const cart = await prisma.cart.findFirst({ where: { userId } });
  if (cart) {
    console.log(`  - existing cart ${cart.id} found, deleting cart items + cart`);
    await prisma.cartItems.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.delete({ where: { id: cart.id } });
  }
}

async function upsertDemo(d: DemoUser) {
  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  const hashed = await bcrypt.hash(d.password, SALT_ROUNDS);

  if (existing) {
    console.log(`[seed] Resetting existing user ${d.email} (id=${existing.id})`);
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        password: hashed,
        isActive: true,
        firstName: d.firstName,
        lastName: d.lastName,
        phone: d.phone,
      },
    });
    await ensureNoCart(existing.id);
    return existing.id;
  }

  console.log(`[seed] Creating new user ${d.email}`);
  const user = await prisma.user.create({
    data: {
      email: d.email,
      username: d.username,
      password: hashed,
      firstName: d.firstName,
      lastName: d.lastName,
      phone: d.phone,
      role: Role.USER,
      isActive: true,
      codeActive: uuidv4(),
      codeActiveExpire: new Date(Date.now() + 5 * 60 * 1000),
    },
  });
  return user.id;
}

async function main() {
  console.log('Seeding demo accounts (active, no cart)...\n');
  for (const d of demos) {
    const id = await upsertDemo(d);
    console.log(`  ✓ ${d.email} | password: ${d.password} | id=${id}`);
  }
  console.log('\nDone. Both accounts are active and have NO cart.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
