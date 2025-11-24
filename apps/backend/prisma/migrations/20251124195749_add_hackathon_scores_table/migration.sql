-- CreateTable
CREATE TABLE "hackathon_scores" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "ctfFlagPoints" INTEGER NOT NULL DEFAULT 0,
    "piiPoints" INTEGER NOT NULL DEFAULT 0,
    "unreleasedProductPoints" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_scores_userId_key" ON "hackathon_scores"("userId");

-- AddForeignKey
ALTER TABLE "hackathon_scores" ADD CONSTRAINT "hackathon_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
