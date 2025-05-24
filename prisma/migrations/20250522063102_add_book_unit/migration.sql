/*
  Warnings:

  - Added the required column `bookSeries` to the `PracticeYonsei` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PracticeYonsei" ADD COLUMN     "bookSeries" TEXT NOT NULL,
ADD COLUMN     "chapter" INTEGER;
