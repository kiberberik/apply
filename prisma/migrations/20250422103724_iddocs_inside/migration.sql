/*
  Warnings:

  - You are about to drop the column `identificationDocId` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `representativeId` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `identificationDocId` on the `Representative` table. All the data in the column will be lost.
  - You are about to drop the column `representativeDocId` on the `Representative` table. All the data in the column will be lost.
  - The values [OTHER] on the enum `Representative_relationshipDegree` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Applicant` DROP FOREIGN KEY `Applicant_identificationDocId_fkey`;

-- DropForeignKey
ALTER TABLE `Document` DROP FOREIGN KEY `Document_representativeId_fkey`;

-- DropForeignKey
ALTER TABLE `Representative` DROP FOREIGN KEY `Representative_identificationDocId_fkey`;

-- DropForeignKey
ALTER TABLE `Representative` DROP FOREIGN KEY `Representative_representativeDocId_fkey`;

-- DropIndex
DROP INDEX `Applicant_identificationDocId_key` ON `Applicant`;

-- DropIndex
DROP INDEX `Document_representativeId_fkey` ON `Document`;

-- DropIndex
DROP INDEX `Representative_identificationDocId_key` ON `Representative`;

-- DropIndex
DROP INDEX `Representative_representativeDocId_key` ON `Representative`;

-- AlterTable
ALTER TABLE `Applicant` DROP COLUMN `identificationDocId`,
    ADD COLUMN `documentExpiryDate` DATETIME(3) NULL,
    ADD COLUMN `documentFileLinks` TEXT NULL,
    ADD COLUMN `documentIssueDate` DATETIME(3) NULL,
    ADD COLUMN `documentIssuingAuthority` VARCHAR(191) NULL,
    ADD COLUMN `documentNumber` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Document` DROP COLUMN `representativeId`;

-- AlterTable
ALTER TABLE `Representative` DROP COLUMN `identificationDocId`,
    DROP COLUMN `representativeDocId`,
    ADD COLUMN `documentExpiryDate` DATETIME(3) NULL,
    ADD COLUMN `documentFileLinks` TEXT NULL,
    ADD COLUMN `documentIssueDate` DATETIME(3) NULL,
    ADD COLUMN `documentIssuingAuthority` VARCHAR(191) NULL,
    ADD COLUMN `documentNumber` VARCHAR(191) NULL,
    ADD COLUMN `representativeDocumentExpiryDate` DATETIME(3) NULL,
    ADD COLUMN `representativeDocumentFileLinks` TEXT NULL,
    ADD COLUMN `representativeDocumentIssueDate` DATETIME(3) NULL,
    ADD COLUMN `representativeDocumentIssuingAuthority` VARCHAR(191) NULL,
    ADD COLUMN `representativeDocumentNumber` VARCHAR(191) NULL,
    MODIFY `relationshipDegree` ENUM('PARENT', 'GUARDIAN', 'TRUSTEE') NULL DEFAULT 'PARENT';
