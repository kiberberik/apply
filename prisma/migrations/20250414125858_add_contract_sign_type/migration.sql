/*
  Warnings:

  - You are about to drop the column `isContractSignedOnline` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Application` DROP COLUMN `isContractSignedOnline`,
    ADD COLUMN `contractSignType` ENUM('TRUSTME', 'OFFLINE', 'NOT_SIGNED') NULL DEFAULT 'NOT_SIGNED';

-- AlterTable
ALTER TABLE `Log` DROP COLUMN `status`,
    ADD COLUMN `statusId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `statuses` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `statuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_statusId_fkey` FOREIGN KEY (`statusId`) REFERENCES `statuses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
