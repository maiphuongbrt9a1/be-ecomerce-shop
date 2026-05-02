-- AlterTable
ALTER TABLE "public"."Media" ADD COLUMN     "requestId" BIGINT;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "public"."Requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
