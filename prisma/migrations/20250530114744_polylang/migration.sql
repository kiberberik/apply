-- AlterTable
ALTER TABLE `Application` MODIFY `contractLanguage` ENUM('RUS', 'KAZ', 'ENG', 'POLY') NULL DEFAULT 'RUS';

-- AlterTable
ALTER TABLE `Details` MODIFY `studyingLanguage` ENUM('RUS', 'KAZ', 'ENG', 'POLY') NULL;

-- AlterTable
ALTER TABLE `Language` MODIFY `code` ENUM('RUS', 'KAZ', 'ENG', 'POLY') NOT NULL;
