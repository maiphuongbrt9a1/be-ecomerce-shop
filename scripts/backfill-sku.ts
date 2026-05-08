/**
 * One-time SKU backfill script.
 *
 * Rules:
 *   Product  : SKU-XXXX            (4-digit code, 1000-9999, unique)
 *   Variant  : SKU-XXXX-{SIZE}-C{colorId}   (inherits product code)
 *
 * Run: npx ts-node -r tsconfig-paths/register scripts/backfill-sku.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SKU_PATTERN = /^SKU-(\d{4})$/;

function generateCode(usedCodes: Set<string>): string {
  let code: number;
  do {
    code = Math.floor(1000 + Math.random() * 9000);
  } while (usedCodes.has(String(code)));
  return String(code);
}

function makeProductSku(code: string): string {
  return `SKU-${code}`;
}

function makeVariantSku(code: string, size: string, colorId: bigint): string {
  const sizeSegment = size.toUpperCase().replace(/\s+/g, '-');
  return `SKU-${code}-${sizeSegment}-C${colorId}`;
}

async function main() {
  console.log('[backfill-sku] Loading products and variants...');

  const products = await prisma.products.findMany({
    select: {
      id: true,
      stockKeepingUnit: true,
      productVariants: {
        select: {
          id: true,
          stockKeepingUnit: true,
          variantSize: true,
          colorId: true,
        },
      },
    },
  });

  console.log(`[backfill-sku] Found ${products.length} products.`);

  // Collect all codes already in use (from conforming SKUs) so we don't collide
  const usedCodes = new Set<string>();
  for (const p of products) {
    const m = p.stockKeepingUnit.match(SKU_PATTERN);
    if (m) usedCodes.add(m[1]);
  }

  let productsUpdated = 0;
  let variantsUpdated = 0;

  for (const product of products) {
    let code: string;
    const existingMatch = product.stockKeepingUnit.match(SKU_PATTERN);

    if (existingMatch) {
      // Already conforms — keep its code, just rewrite variants
      code = existingMatch[1];
    } else {
      // Needs a new code
      code = generateCode(usedCodes);
      usedCodes.add(code);
      const newSku = makeProductSku(code);
      await prisma.products.update({
        where: { id: product.id },
        data: { stockKeepingUnit: newSku },
      });
      console.log(`  Product ${product.id}: "${product.stockKeepingUnit}" → "${newSku}"`);
      productsUpdated++;
    }

    // Rewrite all variants for this product regardless, so they're consistent
    for (const variant of product.productVariants) {
      const expectedSku = makeVariantSku(code, variant.variantSize, variant.colorId);
      if (variant.stockKeepingUnit === expectedSku) continue;

      await prisma.productVariants.update({
        where: { id: variant.id },
        data: { stockKeepingUnit: expectedSku },
      });
      console.log(`    Variant ${variant.id}: "${variant.stockKeepingUnit}" → "${expectedSku}"`);
      variantsUpdated++;
    }
  }

  console.log(
    `[backfill-sku] Done. Products updated: ${productsUpdated}, Variants updated: ${variantsUpdated}.`,
  );
}

main()
  .catch((err) => {
    console.error('[backfill-sku] Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
