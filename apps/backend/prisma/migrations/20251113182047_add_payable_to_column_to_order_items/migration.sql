-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "payableTo" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_payableTo_fkey" FOREIGN KEY ("payableTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
