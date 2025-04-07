/*
  Warnings:

  - A unique constraint covering the columns `[emailVerificationToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `EducationalProgramGroup` MODIFY `code` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerificationToken_key` ON `User`(`emailVerificationToken`);
