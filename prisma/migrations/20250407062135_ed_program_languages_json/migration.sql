/*
  Warnings:

  - You are about to drop the `EducationalProgramLanguage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `EducationalProgramLanguage` DROP FOREIGN KEY `EducationalProgramLanguage_programId_fkey`;

-- AlterTable
ALTER TABLE `EducationalProgram` ADD COLUMN `languages` JSON NULL;

-- DropTable
DROP TABLE `EducationalProgramLanguage`;
