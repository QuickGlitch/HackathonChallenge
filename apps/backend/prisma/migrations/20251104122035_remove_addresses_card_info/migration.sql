/*
  Warnings:

  - You are about to drop the column `clientIpAddress` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "clientIpAddress",
DROP COLUMN "customerEmail",
DROP COLUMN "shippingAddress";
