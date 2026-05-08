import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.user.findMany({
    where: { role: 'USER' },
    take: 5,
    orderBy: { id: 'asc' },
  });

  if (customers.length === 0) {
    console.log('[seed] No USER-role users found. Aborting.');
    return;
  }

  for (const c of customers) {
    const roomName = `support-${c.id}`;
    const existing = await prisma.roomChat.findFirst({ where: { name: roomName } });
    if (existing) {
      console.log(`[seed] ${roomName} already exists (id=${existing.id}), skipping`);
      continue;
    }

    const label =
      [c.lastName, c.firstName].filter(Boolean).join(' ') ||
      c.username ||
      c.email ||
      `Khách hàng #${c.id}`;

    const room = await prisma.roomChat.create({
      data: {
        name: roomName,
        description: label,
        isPrivate: false,
        members: { create: { userId: c.id } },
        messages: {
          create: {
            senderId: c.id,
            content: `Xin chào, tôi cần hỗ trợ về đơn hàng. (seed) — ${label}`,
          },
        },
      },
    });
    console.log(`[seed] Created ${roomName} (id=${room.id}) for ${label}`);
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
