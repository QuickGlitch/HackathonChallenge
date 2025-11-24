-- CreateTable
CREATE TABLE "hackathon_answers" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "ctfText" TEXT NOT NULL,
    "teamPII" TEXT NOT NULL,
    "unreleasedProduct" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hackathon_answers" ADD CONSTRAINT "hackathon_answers_username_fkey" FOREIGN KEY ("username") REFERENCES "users"("username") ON DELETE RESTRICT ON UPDATE CASCADE;
