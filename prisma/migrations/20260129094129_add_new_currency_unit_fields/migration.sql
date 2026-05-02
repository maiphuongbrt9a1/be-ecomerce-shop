-- AlterTable
ALTER TABLE "public"."OrderItems" ADD COLUMN     "currencyUnit" VARCHAR(10) NOT NULL DEFAULT 'VND';

-- AlterTable
ALTER TABLE "public"."Orders" ADD COLUMN     "currencyUnit" VARCHAR(10) NOT NULL DEFAULT 'VND';

-- AlterTable
ALTER TABLE "public"."Payments" ADD COLUMN     "currencyUnit" VARCHAR(10) NOT NULL DEFAULT 'VND';

-- AlterTable
ALTER TABLE "public"."ProductVariants" ADD COLUMN     "currencyUnit" VARCHAR(10) NOT NULL DEFAULT 'VND';

-- AlterTable
ALTER TABLE "public"."Products" ADD COLUMN     "currencyUnit" VARCHAR(10) NOT NULL DEFAULT 'VND';
