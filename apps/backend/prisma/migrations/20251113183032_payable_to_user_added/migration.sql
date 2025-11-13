/*
  Warnings:

  - You are about to drop the column `payableTo` on the `products` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_payableTo_fkey";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "payableTo";
