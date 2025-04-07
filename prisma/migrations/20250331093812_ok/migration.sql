/*
  Warnings:

  - You are about to drop the `ApplicationDetails` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[detailsId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `ApplicationDetails` DROP FOREIGN KEY `ApplicationDetails_applicationId_fkey`;

-- DropForeignKey
ALTER TABLE `ApplicationDetails` DROP FOREIGN KEY `ApplicationDetails_educationalProgramId_fkey`;

-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_uploadedById_fkey`;

-- DropForeignKey
ALTER TABLE `EducationalProgram` DROP FOREIGN KEY `EducationalProgram_groupId_fkey`;

-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_applicationId_fkey`;

-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `Representative` DROP FOREIGN KEY `Representative_applicantId_fkey`;

-- DropForeignKey
ALTER TABLE `Representative` DROP FOREIGN KEY `Representative_identificationDocId_fkey`;

-- DropForeignKey
ALTER TABLE `Representative` DROP FOREIGN KEY `Representative_representativeDocId_fkey`;

-- DropIndex
DROP INDEX `Document_uploadedById_fkey` ON `Document`;

-- DropIndex
DROP INDEX `EducationalProgram_groupId_fkey` ON `EducationalProgram`;

-- DropIndex
DROP INDEX `Log_applicationId_fkey` ON `Log`;

-- DropIndex
DROP INDEX `Log_createdById_fkey` ON `Log`;

-- AlterTable
ALTER TABLE `Application` ADD COLUMN `userId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Document` MODIFY `uploadedById` VARCHAR(191) NULL,
    MODIFY `link` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `number` VARCHAR(191) NULL,
    MODIFY `issuingAuthority` VARCHAR(191) NULL,
    MODIFY `issueDate` DATETIME(3) NULL,
    MODIFY `isDelivered` BOOLEAN NULL DEFAULT false,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'REVISION', 'REJECTED') NULL DEFAULT 'PENDING',
    MODIFY `type` ENUM('IDENTIFICATION', 'EDUCATIONAL', 'PREFERENTIAL', 'MEDICAL', 'FINANCIAL', 'OTHER') NULL;

-- AlterTable
ALTER TABLE `EducationalProgram` MODIFY `code` VARCHAR(191) NULL,
    MODIFY `groupId` VARCHAR(191) NULL,
    MODIFY `academic_level` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NULL;

-- AlterTable
ALTER TABLE `EducationalProgramGroup` MODIFY `academic_level` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NULL;

-- AlterTable
ALTER TABLE `Log` MODIFY `createdById` VARCHAR(191) NULL,
    MODIFY `applicationId` VARCHAR(191) NULL,
    MODIFY `status` ENUM('DRAFT', 'PROCESSING', 'REVISION', 'TECH_CONFIRMATION', 'TECH_REVISION', 'NEED_SIGNATURE', 'ENROLLED', 'REFUSED_TO_SIGN', 'REFUSED_TO_ENROLL', 'REJECTED', 'REPROCESSING') NULL;

-- AlterTable
ALTER TABLE `Representative` MODIFY `applicantId` VARCHAR(191) NULL,
    MODIFY `representativeDocId` VARCHAR(191) NULL,
    MODIFY `identificationDocId` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `ApplicationDetails`;

-- CreateTable
CREATE TABLE `Details` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NULL,
    `type` ENUM('PAID', 'GRANT', 'NONE_DEGREE', 'CONDITIONAL') NULL,
    `academicLevel` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NULL,
    `isDormNeeds` BOOLEAN NULL,
    `language` ENUM('RUS', 'KAZ', 'ENG') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Details_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Application_detailsId_key` ON `Application`(`detailsId`);

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_detailsId_fkey` FOREIGN KEY (`detailsId`) REFERENCES `Details`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_identificationDocId_fkey` FOREIGN KEY (`identificationDocId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_representativeDocId_fkey` FOREIGN KEY (`representativeDocId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationalProgram` ADD CONSTRAINT `EducationalProgram_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `EducationalProgramGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
