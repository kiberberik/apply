/*
  Warnings:

  - You are about to drop the `RequiredDocumentAcademicLevel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequiredDocumentAgeCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequiredDocumentCountry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequiredDocumentStudyType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `academicLevels` to the `RequiredDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ageCategories` to the `RequiredDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countries` to the `RequiredDocument` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studyTypes` to the `RequiredDocument` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `RequiredDocumentAcademicLevel` DROP FOREIGN KEY `RequiredDocumentAcademicLevel_requiredDocumentId_fkey`;

-- DropForeignKey
ALTER TABLE `RequiredDocumentAgeCategory` DROP FOREIGN KEY `RequiredDocumentAgeCategory_requiredDocumentId_fkey`;

-- DropForeignKey
ALTER TABLE `RequiredDocumentCountry` DROP FOREIGN KEY `RequiredDocumentCountry_requiredDocumentId_fkey`;

-- DropForeignKey
ALTER TABLE `RequiredDocumentStudyType` DROP FOREIGN KEY `RequiredDocumentStudyType_requiredDocumentId_fkey`;

-- AlterTable
ALTER TABLE `RequiredDocument` ADD COLUMN `academicLevels` TEXT NOT NULL,
    ADD COLUMN `ageCategories` TEXT NOT NULL,
    ADD COLUMN `countries` TEXT NOT NULL,
    ADD COLUMN `studyTypes` TEXT NOT NULL;

-- DropTable
DROP TABLE `RequiredDocumentAcademicLevel`;

-- DropTable
DROP TABLE `RequiredDocumentAgeCategory`;

-- DropTable
DROP TABLE `RequiredDocumentCountry`;

-- DropTable
DROP TABLE `RequiredDocumentStudyType`;
