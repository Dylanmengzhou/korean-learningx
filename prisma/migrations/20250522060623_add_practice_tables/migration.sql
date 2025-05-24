/*
  Warnings:

  - You are about to drop the column `dictationStatus` on the `WordYonsei` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `WordYonsei` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WordYonsei` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "WordYonsei" DROP CONSTRAINT "WordYonsei_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "image" TEXT NOT NULL DEFAULT 'https://robohash.org/c143b89fb9077cdd6fd77269a7bfefb5?set=set4&bgset=&size=400x400',
ADD COLUMN     "membershipEnd" TIMESTAMP(3),
ADD COLUMN     "membershipType" TEXT NOT NULL DEFAULT 'free',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WordYonsei" DROP COLUMN "dictationStatus",
DROP COLUMN "status",
DROP COLUMN "userId",
ALTER COLUMN "chapter" DROP NOT NULL,
ALTER COLUMN "chapter" DROP DEFAULT;

-- CreateTable
CREATE TABLE "UserDictationRecord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDictationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "dictationStatus" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWordProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeYonsei" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeYonsei_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPracticeProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "practiceId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "isSave" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPracticeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserWordProgress_userId_wordId_key" ON "UserWordProgress"("userId", "wordId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPracticeProgress_userId_practiceId_key" ON "UserPracticeProgress"("userId", "practiceId");

-- AddForeignKey
ALTER TABLE "UserDictationRecord" ADD CONSTRAINT "UserDictationRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordProgress" ADD CONSTRAINT "UserWordProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordProgress" ADD CONSTRAINT "UserWordProgress_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "WordYonsei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeProgress" ADD CONSTRAINT "UserPracticeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeProgress" ADD CONSTRAINT "UserPracticeProgress_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "PracticeYonsei"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
