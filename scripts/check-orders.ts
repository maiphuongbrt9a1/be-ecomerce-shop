import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const byStatus = await prisma.orders.groupBy({ by: ['status'], _count: true });
  console.log(byStatus);
  await prisma.$disconnect();
})();
