-- AlterTable
ALTER TABLE "products" ADD COLUMN     "payableTo" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_payableTo_fkey" FOREIGN KEY ("payableTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
