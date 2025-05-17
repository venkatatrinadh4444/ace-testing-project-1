-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "expiresIn" INTEGER,
ADD COLUMN     "otp" INTEGER;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "expiresIn" INTEGER,
ADD COLUMN     "otp" INTEGER;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "expiresIn" INTEGER,
ADD COLUMN     "otp" INTEGER;
