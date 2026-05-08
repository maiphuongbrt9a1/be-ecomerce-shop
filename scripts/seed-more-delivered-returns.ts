import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const completed = await prisma.orders.findMany({
    where: {
      status: 'COMPLETED',
      requests: { none: { subject: 'RETURN_REQUEST' } },
    },
    take: 2,
    orderBy: { id: 'desc' },
  });

  if (completed.length === 0) {
    console.log('[seed] No suitable COMPLETED orders to convert.');
    return;
  }

  const reasons = [
    'Sản phẩm khác mô tả, vải bị lỗi.',
    'Size không vừa, yêu cầu hoàn tiền.',
  ];

  for (let i = 0; i < completed.length; i++) {
    const order = completed[i];
    await prisma.orders.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' },
    });
    const req = await prisma.requests.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        subject: 'RETURN_REQUEST',
        status: 'PENDING',
        description: reasons[i],
        returnRequest: {
          create: {
            bankName: 'TECHCOMBANK',
            bankAccountNumber: `199${String(order.id).padStart(8, '0')}`,
            bankAccountName: 'TRAN THI TEST',
          },
        },
      },
    });
    console.log(
      `[seed] Order #${order.id} → DELIVERED + Request #${req.id} (PENDING return)`
    );
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
