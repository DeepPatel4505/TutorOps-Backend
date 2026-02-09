/*
  Warnings:

  - You are about to drop the column `codeHash` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "codeHash",
ADD COLUMN     "codehash" TEXT;
