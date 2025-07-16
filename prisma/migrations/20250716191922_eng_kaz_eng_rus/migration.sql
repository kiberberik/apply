-- AlterTable
ALTER TABLE `Application` MODIFY `contractLanguage` ENUM('RUS', 'KAZ', 'ENG', 'POLY', 'ENG_KAZ', 'ENG_RUS') NULL DEFAULT 'RUS';

-- AlterTable
ALTER TABLE `Details` MODIFY `studyingLanguage` ENUM('RUS', 'KAZ', 'ENG', 'POLY', 'ENG_KAZ', 'ENG_RUS') NULL;

-- AlterTable
ALTER TABLE `Language` MODIFY `code` ENUM('RUS', 'KAZ', 'ENG', 'POLY', 'ENG_KAZ', 'ENG_RUS') NOT NULL;
