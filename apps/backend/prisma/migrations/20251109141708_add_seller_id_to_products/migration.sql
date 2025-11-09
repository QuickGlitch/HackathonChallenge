-- AlterTable
ALTER TABLE "products" ADD COLUMN     "sellerId" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
