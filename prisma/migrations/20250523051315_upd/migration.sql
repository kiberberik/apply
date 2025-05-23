/*
  Warnings:

  - You are about to drop the column `contractTerminationDate` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `contractTerminationStatus` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `Instruction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_applicantId_fkey`;

-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_detailsId_fkey`;

-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_representativeId_fkey`;

-- DropIndex
DROP INDEX `Application_applicantId_fkey` ON `Application`;

-- DropIndex
DROP INDEX `Application_representativeId_fkey` ON `Application`;

-- AlterTable
ALTER TABLE `Application` DROP COLUMN `contractTerminationDate`,
    DROP COLUMN `contractTerminationStatus`,
    ADD COLUMN `terminatedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Log` MODIFY `statusId` ENUM('DRAFT', 'PROCESSING', 'NEED_SIGNATURE', 'REFUSED_TO_SIGN', 'CHECK_DOCS', 'NEED_DOCS', 'RE_PROCESSING', 'ENROLLED', 'EARLY_REFUSED_TO_ENROLL', 'REFUSED_TO_ENROLL', 'REJECTED', 'NEED_SIGNATURE_TERMINATE_CONTRACT', 'REFUSED_TO_SIGN_TERMINATE_CONTRACT', 'SIGNED_TERMINATE_CONTRACT') NULL;

-- DropTable
DROP TABLE `Instruction`;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_representativeId_fkey` FOREIGN KEY (`representativeId`) REFERENCES `Representative`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_detailsId_fkey` FOREIGN KEY (`detailsId`) REFERENCES `Details`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
