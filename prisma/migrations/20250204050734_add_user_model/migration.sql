/*
  Warnings:

  - You are about to drop the `Word` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Word";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordYonsei" (
    "id" SERIAL NOT NULL,
    "korean" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "phrase" TEXT,
    "phraseCn" TEXT,
    "example" TEXT,
    "exampleCn" TEXT,
    "chinese" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "bookSeries" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "chapter" INTEGER NOT NULL DEFAULT 0,
    "dictationStatus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WordYonsei_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "WordYonsei" ADD CONSTRAINT "WordYonsei_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
