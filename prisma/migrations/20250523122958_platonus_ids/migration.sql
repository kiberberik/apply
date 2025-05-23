-- AlterTable
ALTER TABLE `EducationalProgram` ADD COLUMN `platonusId` VARCHAR(191) NULL,
    ADD COLUMN `platonusStudyFormId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `EducationalProgramGroup` ADD COLUMN `platonusId` VARCHAR(191) NULL;
