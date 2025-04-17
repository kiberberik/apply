-- DropForeignKey
ALTER TABLE `Applicant` DROP FOREIGN KEY `Applicant_identificationDocId_fkey`;

-- AlterTable
ALTER TABLE `Applicant` ADD COLUMN `isCitizenshipKz` BOOLEAN NULL DEFAULT true,
    MODIFY `identificationDocId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Representative` ADD COLUMN `isCitizenshipKz` BOOLEAN NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `Applicant` ADD CONSTRAINT `Applicant_identificationDocId_fkey` FOREIGN KEY (`identificationDocId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
