import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find DELIVERED orders that don't already have a RETURN_REQUEST
  const delivered = await prisma.orders.findMany({
    where: {
      status: 'DELIVERED',
      requests: { none: { subject: 'RETURN_REQUEST' } },
    },
    take: 3,
    orderBy: { id: 'desc' },
  });

  if (delivered.length === 0) {
    console.log('[seed] No DELIVERED orders without a return request found.');
    console.log('[seed] You may need to push a few orders through to DELIVERED first.');
    return;
  }

  const reasons = [
    'Sản phẩm bị lỗi đường may, không đúng mô tả.',
    'Kích thước không vừa, muốn hoàn tiền.',
    'Màu sắc thực tế khác xa hình ảnh trên web.',
  ];

  for (let i = 0; i < delivered.length; i++) {
    const order = delivered[i];
    const created = await prisma.requests.create({
      data: {
        userId: order.userId,
        orderId: order.id,
        subject: 'RETURN_REQUEST',
        status: 'PENDING',
        description: reasons[i % reasons.length],
        returnRequest: {
          create: {
            bankName: 'VIETCOMBANK',
            bankAccountNumber: `001100${String(order.id).padStart(6, '0')}`,
            bankAccountName: 'NGUYEN VAN TEST',
          },
        },
      },
      include: { returnRequest: true },
    });
    console.log(
      `[seed] Order #${order.id} (user ${order.userId}) → Request #${created.id} (PENDING return request)`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
