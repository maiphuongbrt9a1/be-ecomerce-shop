/**
 * One-time backfill: translate existing English notification titles/content to Vietnamese.
 * Run: npm run backfill-notification-vi
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATUS_VI: Record<string, string> = {
  PENDING: 'đang chờ xử lý',
  IN_PROGRESS: 'đang được xử lý',
  APPROVED: 'đã được chấp thuận',
  REJECTED: 'đã bị từ chối',
};

interface Rule {
  titleMatch: string;
  newTitle: string;
  translateContent: (oldContent: string) => string | null;
}

function extractId(content: string, pattern: RegExp): string | null {
  return content.match(pattern)?.[1] ?? null;
}

const RULES: Rule[] = [
  // ── Orders ──────────────────────────────────────────────────────────────
  {
    titleMatch: 'Order placed successfully',
    newTitle: 'Đặt hàng thành công',
    translateContent: (c) => {
      const id = extractId(c, /Your order #(\d+) has been created/);
      return id ? `Đơn hàng #${id} của bạn đã được tạo và đang chờ xử lý.` : null;
    },
  },
  {
    titleMatch: 'Order is waiting for pickup',
    newTitle: 'Đơn hàng đang chờ lấy hàng',
    translateContent: (c) => {
      const id = extractId(c, /Your order #(\d+) is now prepared/);
      return id ? `Đơn hàng #${id} của bạn đã được chuẩn bị và đang chờ đơn vị vận chuyển lấy hàng.` : null;
    },
  },
  {
    titleMatch: 'Order has been shipped',
    newTitle: 'Đơn hàng đang được giao',
    translateContent: (c) => {
      const id = extractId(c, /Your order #(\d+) is on the way/);
      return id ? `Đơn hàng #${id} của bạn đang trên đường giao đến bạn.` : null;
    },
  },
  {
    titleMatch: 'Order delivered successfully',
    newTitle: 'Giao hàng thành công',
    translateContent: (c) => {
      const id = extractId(c, /Your order #(\d+) has been delivered/);
      return id ? `Đơn hàng #${id} của bạn đã được giao thành công.` : null;
    },
  },
  {
    titleMatch: 'Order delivery failed',
    newTitle: 'Giao hàng thất bại',
    translateContent: (c) => {
      const id = extractId(c, /Delivery for order #(\d+) failed/);
      return id ? `Giao hàng cho đơn hàng #${id} thất bại. Đội ngũ của chúng tôi sẽ hỗ trợ bạn các bước tiếp theo.` : null;
    },
  },
  {
    titleMatch: 'Order cancelled',
    newTitle: 'Đơn hàng đã bị hủy',
    translateContent: (c) => {
      const id = extractId(c, /Your order #(\d+) has been cancelled/);
      return id ? `Đơn hàng #${id} của bạn đã được hủy.` : null;
    },
  },
  {
    titleMatch: 'Order completed',
    newTitle: 'Đơn hàng hoàn thành',
    translateContent: (c) => {
      const id = extractId(c, /Your order #(\d+) has been auto-confirmed/);
      return id ? `Đơn hàng #${id} của bạn đã được tự động xác nhận hoàn thành.` : null;
    },
  },

  // ── Payments ─────────────────────────────────────────────────────────────
  {
    titleMatch: 'Payment confirmed',
    newTitle: 'Thanh toán thành công',
    translateContent: (c) => {
      const id = extractId(c, /Your payment for order #(\d+)/);
      return id ? `Thanh toán cho đơn hàng #${id} của bạn đã được xác nhận thành công.` : null;
    },
  },
  {
    titleMatch: 'Refund processed',
    newTitle: 'Hoàn tiền đã được xử lý',
    translateContent: (c) => {
      const id = extractId(c, /A refund request for order #(\d+)/);
      return id ? `Yêu cầu hoàn tiền cho đơn hàng #${id} đã được xử lý. Vui lòng kiểm tra trạng thái thanh toán của bạn.` : null;
    },
  },

  // ── Return requests ───────────────────────────────────────────────────────
  {
    titleMatch: 'Return request created',
    newTitle: 'Yêu cầu hoàn trả đã được tạo',
    translateContent: (c) => {
      const id = extractId(c, /Your return request #(\d+) has been created/);
      return id ? `Yêu cầu hoàn trả #${id} của bạn đã được tạo và đang chờ xem xét.` : null;
    },
  },
  {
    titleMatch: 'Return request updated',
    newTitle: 'Yêu cầu hoàn trả đã được cập nhật',
    translateContent: (c) => {
      const id = extractId(c, /Your return request #(\d+) has been updated/);
      return id ? `Yêu cầu hoàn trả #${id} của bạn đã được cập nhật.` : null;
    },
  },
  {
    titleMatch: 'Return request status updated',
    newTitle: 'Trạng thái yêu cầu hoàn trả đã thay đổi',
    translateContent: (c) => {
      const match = c.match(/Your return request #(\d+) is now (\w+)/);
      if (!match) return null;
      const [, id, rawStatus] = match;
      const statusLabel = STATUS_VI[rawStatus] ?? rawStatus;
      return `Yêu cầu hoàn trả #${id} của bạn ${statusLabel}.`;
    },
  },

  // ── Vouchers ──────────────────────────────────────────────────────────────
  {
    titleMatch: 'New voucher is available',
    newTitle: 'Voucher mới đã có sẵn',
    translateContent: (c) => {
      const code = extractId(c, /A new voucher (\S+) is now available/);
      return code ? `Voucher ${code} mới đã có sẵn. Kiểm tra chi tiết và thời hạn trong phần voucher.` : null;
    },
  },
  {
    titleMatch: 'Voucher has been updated',
    newTitle: 'Voucher đã được cập nhật',
    translateContent: (c) => {
      const code = extractId(c, /Voucher (\S+) has updated settings/);
      return code ? `Voucher ${code} đã được cập nhật. Vui lòng kiểm tra mức giảm giá và thời hạn hiện tại.` : null;
    },
  },
  {
    titleMatch: 'Voucher has ended',
    newTitle: 'Voucher đã hết hạn',
    translateContent: (c) => {
      const code = extractId(c, /Voucher (\S+) is no longer available/);
      return code ? `Voucher ${code} đã không còn hiệu lực.` : null;
    },
  },
];

async function main() {
  console.log('[backfill-notification-vi] Starting...');

  let updated = 0;
  let skipped = 0;

  for (const rule of RULES) {
    const notifications = await prisma.notification.findMany({
      where: { title: rule.titleMatch },
      select: { id: true, content: true },
    });

    if (notifications.length === 0) {
      console.log(`  [skip] "${rule.titleMatch}" — no records found`);
      continue;
    }

    console.log(`  [${rule.titleMatch}] — ${notifications.length} record(s)`);

    for (const n of notifications) {
      const newContent = rule.translateContent(n.content);
      if (!newContent) {
        console.warn(`    [warn] Could not translate content for id ${n.id}: "${n.content}"`);
        skipped++;
        continue;
      }

      await prisma.notification.update({
        where: { id: n.id },
        data: { title: rule.newTitle, content: newContent },
      });

      console.log(`    id ${n.id}: "${n.content.slice(0, 60)}..." → done`);
      updated++;
    }
  }

  console.log(`\n[backfill-notification-vi] Done. Updated: ${updated}, Skipped: ${skipped}.`);
}

main()
  .catch((err) => {
    console.error('[backfill-notification-vi] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
