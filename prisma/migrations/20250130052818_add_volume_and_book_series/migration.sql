/*
  Warnings:

  - Added the required column `bookSeries` to the `Word` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "bookSeries" TEXT NOT NULL,
ADD COLUMN     "volume" INTEGER NOT NULL;
