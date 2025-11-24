/*
  Warnings:

  - You are about to drop the column `ctfText` on the `hackathon_answers` table. All the data in the column will be lost.
  - You are about to drop the column `teamPII` on the `hackathon_answers` table. All the data in the column will be lost.
  - You are about to drop the column `unreleasedProduct` on the `hackathon_answers` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `hackathon_answers` table. All the data in the column will be lost.
  - Added the required column `answers` to the `hackathon_answers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `hackathon_answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "hackathon_answers" DROP CONSTRAINT "hackathon_answers_username_fkey";

-- AlterTable
ALTER TABLE "hackathon_answers" DROP COLUMN "ctfText",
DROP COLUMN "teamPII",
DROP COLUMN "unreleasedProduct",
DROP COLUMN "username",
ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "hackathon_answers" ADD CONSTRAINT "hackathon_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
