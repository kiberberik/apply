/*
  Warnings:

  - You are about to drop the column `statusId` on the `Application` table. All the data in the column will be lost.
  - You are about to alter the column `statusId` on the `Log` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(12))`.
  - You are about to drop the `statuses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Application` DROP FOREIGN KEY `Application_statusId_fkey`;

-- DropForeignKey
ALTER TABLE `Log` DROP FOREIGN KEY `Log_statusId_fkey`;

-- DropIndex
DROP INDEX `Application_statusId_fkey` ON `Application`;

-- DropIndex
DROP INDEX `Log_statusId_fkey` ON `Log`;

-- AlterTable
ALTER TABLE `Application` DROP COLUMN `statusId`;

-- AlterTable
ALTER TABLE `Log` MODIFY `statusId` ENUM('DRAFT', 'PROCESSING', 'NEED_SIGNATURE', 'REFUSED_TO_SIGN', 'CHECK_DOCS', 'NEED_DOCS', 'RE_PROCESSING', 'ENROLLED', 'EARLY_REFUSED_TO_ENROLL', 'REFUSED_TO_ENROLL', 'REJECTED') NULL;

-- DropTable
DROP TABLE `statuses`;
