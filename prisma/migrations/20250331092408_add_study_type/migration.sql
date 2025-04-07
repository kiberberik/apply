/*
  Warnings:

  - You are about to drop the column `applicationDetailsId` on the `Application` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Application_applicationDetailsId_key` ON `Application`;

-- AlterTable
ALTER TABLE `Application` DROP COLUMN `applicationDetailsId`,
    ADD COLUMN `detailsId` VARCHAR(191) NULL;
