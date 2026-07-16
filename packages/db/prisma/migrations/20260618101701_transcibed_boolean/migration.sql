/*
  Warnings:

  - You are about to drop the column `chapters` on the `Video` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `Video` table. All the data in the column will be lost.
  - Added the required column `transcribed` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" DROP COLUMN "chapters",
DROP COLUMN "summary",
ADD COLUMN     "transcribed" BOOLEAN NOT NULL;
