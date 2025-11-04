/*
  Warnings:

  - You are about to drop the column `userId` on the `order_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_userId_fkey";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "PII" TEXT NOT NULL DEFAULT 'favourite color is blue';
