/*
  Warnings:

  - You are about to alter the column `citizenship` on the `Applicant` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - You are about to alter the column `citizenship` on the `Representative` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Applicant` ADD COLUMN `birthPlace` VARCHAR(191) NULL,
    ADD COLUMN `ethnicity` VARCHAR(191) NULL,
    ADD COLUMN `firstnameTranslit` VARCHAR(191) NULL,
    ADD COLUMN `gender` ENUM('MALE', 'FEMALE', 'OTHER', 'NOT_SPECIFIED') NULL,
    ADD COLUMN `lastnameTranslit` VARCHAR(191) NULL,
    ADD COLUMN `maritalStatus` VARCHAR(191) NULL,
    MODIFY `firstname` VARCHAR(191) NULL,
    MODIFY `lastname` VARCHAR(191) NULL,
    MODIFY `dob` DATETIME(3) NULL,
    MODIFY `citizenship` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL,
    MODIFY `addressResidential` VARCHAR(191) NULL,
    MODIFY `addressRegistration` VARCHAR(191) NULL,
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `EducationalProgram` MODIFY `name_rus` VARCHAR(191) NULL,
    MODIFY `name_kaz` VARCHAR(191) NULL,
    MODIFY `name_eng` VARCHAR(191) NULL,
    MODIFY `visibility` BOOLEAN NULL DEFAULT true,
    MODIFY `costPerCredit` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `EducationalProgramGroup` MODIFY `name_rus` VARCHAR(191) NULL,
    MODIFY `name_kaz` VARCHAR(191) NULL,
    MODIFY `name_eng` VARCHAR(191) NULL,
    MODIFY `visibility` BOOLEAN NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Representative` ADD COLUMN `addressResidential` VARCHAR(191) NULL,
    ADD COLUMN `firstnameTranslit` VARCHAR(191) NULL,
    ADD COLUMN `lastnameTranslit` VARCHAR(191) NULL,
    ADD COLUMN `relationshipDegree` VARCHAR(191) NULL,
    MODIFY `firstname` VARCHAR(191) NULL,
    MODIFY `lastname` VARCHAR(191) NULL,
    MODIFY `citizenship` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `phone` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `managerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
