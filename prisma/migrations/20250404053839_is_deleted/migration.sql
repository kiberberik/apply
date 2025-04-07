-- AlterTable
ALTER TABLE `EducationalProgram` ADD COLUMN `duration` INTEGER NULL,
    ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `EducationalProgramGroup` ADD COLUMN `isDeleted` BOOLEAN NULL DEFAULT false;

-- CreateTable
CREATE TABLE `EducationalProgramLanguage` (
    `id` VARCHAR(191) NOT NULL,
    `programId` VARCHAR(191) NOT NULL,
    `language` ENUM('RUS', 'KAZ', 'ENG') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EducationalProgramLanguage` ADD CONSTRAINT `EducationalProgramLanguage_programId_fkey` FOREIGN KEY (`programId`) REFERENCES `EducationalProgram`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
