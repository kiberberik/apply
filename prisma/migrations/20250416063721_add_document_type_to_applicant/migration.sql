-- AlterTable
ALTER TABLE `Applicant` ADD COLUMN `documentType` ENUM('ID_CARD', 'PASSPORT') NULL;

-- AlterTable
ALTER TABLE `Representative` ADD COLUMN `documentType` ENUM('ID_CARD', 'PASSPORT') NULL;
