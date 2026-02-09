-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeHash" TEXT,
ADD COLUMN     "expiry" TIMESTAMP(3);
