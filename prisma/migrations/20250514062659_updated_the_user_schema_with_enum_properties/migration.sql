/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "roleSelector" AS ENUM ('Admin', 'Vendor', 'Customer');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "roleSelector" NOT NULL DEFAULT 'Customer';
