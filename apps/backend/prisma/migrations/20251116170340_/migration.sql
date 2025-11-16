/*
  Warnings:

  - You are about to drop the column `sellerId` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_sellerId_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "sellerId",
ADD COLUMN     "payableTo" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_payableTo_fkey" FOREIGN KEY ("payableTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
