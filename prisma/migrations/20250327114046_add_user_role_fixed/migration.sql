-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_createdById_fkey`;

-- DropIndex
DROP INDEX `Application_createdById_fkey` ON `Application`;

-- AlterTable
ALTER TABLE `Application` MODIFY `createdById` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
