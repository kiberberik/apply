-- AddForeignKey
ALTER TABLE `Details` ADD CONSTRAINT `Details_educationalProgramId_fkey` FOREIGN KEY (`educationalProgramId`) REFERENCES `EducationalProgram`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
