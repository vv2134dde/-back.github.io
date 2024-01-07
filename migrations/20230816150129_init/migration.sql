/*
  Warnings:

  - You are about to alter the column `bio` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1024)`.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_currencyId_fkey";

-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "birth" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Book" ALTER COLUMN "language" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "currencyId" DROP NOT NULL,
ALTER COLUMN "year" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(1024),
ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(1024),
ALTER COLUMN "image" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("short_name") ON DELETE SET NULL ON UPDATE CASCADE;
