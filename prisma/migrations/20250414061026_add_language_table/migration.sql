-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('USER', 'CONSULTANT', 'MANAGER', 'LAWYER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `emailVerified` DATETIME(3) NULL,
    `emailVerificationToken` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `managerId` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_emailVerificationToken_key`(`emailVerificationToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Application` (
    `id` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `consultantId` VARCHAR(191) NULL,
    `applicantId` VARCHAR(191) NULL,
    `representativeId` VARCHAR(191) NULL,
    `detailsId` VARCHAR(191) NULL,
    `statusId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `isContractSignedOnline` BOOLEAN NULL DEFAULT false,
    `contractTerminationStatus` ENUM('NEED_SIGNATURE_TERMINATE_CONTRACT', 'REFUSED_TO_SIGN_TERMINATE_CONTRACT', 'SIGNED_TERMINATE_CONTRACT') NULL,
    `contractTerminationDate` DATETIME(3) NULL,
    `contractLanguage` ENUM('RUS', 'KAZ', 'ENG') NULL DEFAULT 'RUS',

    UNIQUE INDEX `Application_detailsId_key`(`detailsId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Details` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NULL,
    `type` ENUM('PAID', 'GRANT', 'NONE_DEGREE', 'CONDITIONAL', 'OTHER') NULL,
    `academicLevel` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NULL,
    `isDormNeeds` BOOLEAN NULL,
    `studyingLanguage` ENUM('RUS', 'KAZ', 'ENG') NULL,
    `educationalProgramId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Details_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Applicant` (
    `id` VARCHAR(191) NOT NULL,
    `givennames` VARCHAR(191) NULL,
    `patronymic` VARCHAR(191) NULL,
    `surname` VARCHAR(191) NULL,
    `birthDate` DATETIME(3) NULL,
    `birthPlace` VARCHAR(191) NULL,
    `citizenship` VARCHAR(191) NULL,
    `identificationNumber` VARCHAR(191) NULL,
    `identificationDocId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `addressResidential` VARCHAR(191) NULL,
    `addressRegistration` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Applicant_identificationDocId_key`(`identificationDocId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Representative` (
    `id` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NULL,
    `givennames` VARCHAR(191) NULL,
    `patronymic` VARCHAR(191) NULL,
    `surname` VARCHAR(191) NULL,
    `citizenship` VARCHAR(191) NULL,
    `identificationNumber` VARCHAR(191) NULL,
    `identificationDocId` VARCHAR(191) NULL,
    `relationshipDegree` ENUM('PARENT', 'GUARDIAN', 'TRUSTEE', 'OTHER') NULL DEFAULT 'PARENT',
    `representativeDocId` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `addressResidential` VARCHAR(191) NULL,
    `addressRegistration` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Representative_applicantId_key`(`applicantId`),
    UNIQUE INDEX `Representative_identificationDocId_key`(`identificationDocId`),
    UNIQUE INDEX `Representative_representativeDocId_key`(`representativeDocId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `representativeId` VARCHAR(191) NULL,
    `applicationId` VARCHAR(191) NULL,
    `uploadedById` VARCHAR(191) NULL,
    `link` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `name` VARCHAR(191) NULL,
    `number` VARCHAR(191) NULL,
    `issuingAuthority` VARCHAR(191) NULL,
    `issueDate` DATETIME(3) NULL,
    `expirationDate` DATETIME(3) NULL,
    `diplomaSerialNumber` VARCHAR(191) NULL,
    `additionalInfo1` VARCHAR(191) NULL,
    `additionalInfo2` VARCHAR(191) NULL,
    `isDelivered` BOOLEAN NULL DEFAULT false,
    `description` VARCHAR(191) NULL,
    `type` ENUM('IDENTIFICATION', 'EDUCATIONAL', 'PREFERENTIAL', 'MEDICAL', 'FINANCIAL', 'OTHER') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequiredDocument` (
    `id` VARCHAR(191) NOT NULL,
    `name_rus` VARCHAR(191) NULL,
    `name_kaz` VARCHAR(191) NULL,
    `name_eng` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `type` ENUM('IDENTIFICATION', 'EDUCATIONAL', 'PREFERENTIAL', 'MEDICAL', 'FINANCIAL', 'OTHER') NULL,
    `isNeedOriginal` BOOLEAN NULL DEFAULT true,
    `isScanRequired` BOOLEAN NULL DEFAULT true,
    `description` VARCHAR(191) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequiredDocumentCountry` (
    `id` VARCHAR(191) NOT NULL,
    `requiredDocumentId` VARCHAR(191) NOT NULL,
    `country` ENUM('KAZAKHSTAN', 'OTHER') NOT NULL,

    UNIQUE INDEX `RequiredDocumentCountry_requiredDocumentId_country_key`(`requiredDocumentId`, `country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequiredDocumentAcademicLevel` (
    `id` VARCHAR(191) NOT NULL,
    `requiredDocumentId` VARCHAR(191) NOT NULL,
    `academicLevel` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NOT NULL,

    UNIQUE INDEX `RequiredDocumentAcademicLevel_requiredDocumentId_academicLev_key`(`requiredDocumentId`, `academicLevel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequiredDocumentStudyType` (
    `id` VARCHAR(191) NOT NULL,
    `requiredDocumentId` VARCHAR(191) NOT NULL,
    `studyType` ENUM('PAID', 'GRANT', 'NONE_DEGREE', 'CONDITIONAL', 'OTHER') NOT NULL,

    UNIQUE INDEX `RequiredDocumentStudyType_requiredDocumentId_studyType_key`(`requiredDocumentId`, `studyType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequiredDocumentAgeCategory` (
    `id` VARCHAR(191) NOT NULL,
    `requiredDocumentId` VARCHAR(191) NOT NULL,
    `ageCategory` ENUM('ADULT', 'MINOR') NOT NULL,

    UNIQUE INDEX `RequiredDocumentAgeCategory_requiredDocumentId_ageCategory_key`(`requiredDocumentId`, `ageCategory`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Log` (
    `id` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `applicationId` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PROCESSING', 'NEED_SIGNATURE', 'REFUSED_TO_SIGN', 'CHECK_DOCS', 'NEED_DOCS', 'RE_PROCESSING', 'ENROLLED', 'EARLY_REFUSED_TO_ENROLL', 'REFUSED_TO_ENROLL', 'REJECTED') NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EducationalProgramGroup` (
    `id` VARCHAR(191) NOT NULL,
    `name_rus` VARCHAR(191) NULL,
    `name_kaz` VARCHAR(191) NULL,
    `name_eng` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `academic_level` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NULL,
    `visibility` BOOLEAN NULL DEFAULT true,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Language` (
    `id` VARCHAR(191) NOT NULL,
    `code` ENUM('RUS', 'KAZ', 'ENG') NOT NULL,
    `name_rus` VARCHAR(191) NULL,
    `name_kaz` VARCHAR(191) NULL,
    `name_eng` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Language_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EducationalProgram` (
    `id` VARCHAR(191) NOT NULL,
    `name_rus` VARCHAR(191) NULL,
    `name_kaz` VARCHAR(191) NULL,
    `name_eng` VARCHAR(191) NULL,
    `code` VARCHAR(191) NULL,
    `groupId` VARCHAR(191) NULL,
    `academic_level` ENUM('BACHELORS', 'MASTERS', 'DOCTORAL') NULL,
    `duration` INTEGER NULL,
    `visibility` BOOLEAN NULL DEFAULT true,
    `isDeleted` BOOLEAN NULL DEFAULT false,
    `costPerCredit` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EducationalProgramLanguage` (
    `id` VARCHAR(191) NOT NULL,
    `educationalProgramId` VARCHAR(191) NOT NULL,
    `languageId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `EducationalProgramLanguage_educationalProgramId_languageId_key`(`educationalProgramId`, `languageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Instruction` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ApplicantAccepting` (
    `id` VARCHAR(191) NOT NULL,
    `isOpen` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_consultantId_fkey` FOREIGN KEY (`consultantId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_representativeId_fkey` FOREIGN KEY (`representativeId`) REFERENCES `Representative`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_detailsId_fkey` FOREIGN KEY (`detailsId`) REFERENCES `Details`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Applicant` ADD CONSTRAINT `Applicant_identificationDocId_fkey` FOREIGN KEY (`identificationDocId`) REFERENCES `Document`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `Applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_identificationDocId_fkey` FOREIGN KEY (`identificationDocId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Representative` ADD CONSTRAINT `Representative_representativeDocId_fkey` FOREIGN KEY (`representativeDocId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Applicant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_representativeId_fkey` FOREIGN KEY (`representativeId`) REFERENCES `Representative`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequiredDocumentCountry` ADD CONSTRAINT `RequiredDocumentCountry_requiredDocumentId_fkey` FOREIGN KEY (`requiredDocumentId`) REFERENCES `RequiredDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequiredDocumentAcademicLevel` ADD CONSTRAINT `RequiredDocumentAcademicLevel_requiredDocumentId_fkey` FOREIGN KEY (`requiredDocumentId`) REFERENCES `RequiredDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequiredDocumentStudyType` ADD CONSTRAINT `RequiredDocumentStudyType_requiredDocumentId_fkey` FOREIGN KEY (`requiredDocumentId`) REFERENCES `RequiredDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequiredDocumentAgeCategory` ADD CONSTRAINT `RequiredDocumentAgeCategory_requiredDocumentId_fkey` FOREIGN KEY (`requiredDocumentId`) REFERENCES `RequiredDocument`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Log` ADD CONSTRAINT `Log_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `Application`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationalProgram` ADD CONSTRAINT `EducationalProgram_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `EducationalProgramGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationalProgramLanguage` ADD CONSTRAINT `EducationalProgramLanguage_educationalProgramId_fkey` FOREIGN KEY (`educationalProgramId`) REFERENCES `EducationalProgram`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationalProgramLanguage` ADD CONSTRAINT `EducationalProgramLanguage_languageId_fkey` FOREIGN KEY (`languageId`) REFERENCES `Language`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
