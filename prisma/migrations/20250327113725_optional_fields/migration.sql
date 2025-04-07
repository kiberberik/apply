-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_applicantId_fkey`;

-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_consultantId_fkey`;

-- DropIndex
DROP INDEX `Application_applicantId_fkey` ON `Application`;

-- DropIndex
DROP INDEX `Application_consultantId_fkey` ON `Application`;

-- AlterTable
ALTER TABLE `Application` MODIFY `consultantId` VARCHAR(191) NULL,
    MODIFY `applicantId` VARCHAR(191) NULL,
    MODIFY `statusId` VARCHAR(191) NULL,
    MODIFY `applicationDetailsId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('USER', 'CONSULTANT', 'MANAGER', 'LAWYER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
