-- CreateTable
CREATE TABLE "public"."CategoryMapping" (
    "id" SERIAL NOT NULL,
    "baseCategoryId" BIGINT NOT NULL,
    "suggestCategoryId" BIGINT NOT NULL,

    CONSTRAINT "CategoryMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMapping_baseCategoryId_suggestCategoryId_key" ON "public"."CategoryMapping"("baseCategoryId", "suggestCategoryId");

-- AddForeignKey
ALTER TABLE "public"."CategoryMapping" ADD CONSTRAINT "CategoryMapping_baseCategoryId_fkey" FOREIGN KEY ("baseCategoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryMapping" ADD CONSTRAINT "CategoryMapping_suggestCategoryId_fkey" FOREIGN KEY ("suggestCategoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
