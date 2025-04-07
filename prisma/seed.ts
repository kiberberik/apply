import {
  PrismaClient,
  Role,
  DocumentType,
  DocumentStatus,
  Citizenship,
  ApplicationStatus,
  AcademicLevel,
  StudyType,
  StudyLanguage,
  Gender,
  MaritalStatus,
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создаем администратора
  const admin = await prisma.user.create({
    data: {
      email: 'bazarov_berik@mnu.kz',
      name: 'Администратор',
      password: await hash('456456', 12),
      role: Role.ADMIN,
    },
  });

  const lawyer = await prisma.user.create({
    data: {
      email: 'lawyer@mnu.kz',
      name: 'Юрист',
      password: await hash('123123', 12),
      role: Role.LAWYER,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@mnu.kz',
      name: 'Менеджер 1',
      password: await hash('123123', 12),
      role: Role.MANAGER,
    },
  });
  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@mnu.kz',
      name: 'Менеджер 2',
      password: await hash('123123', 12),
      role: Role.MANAGER,
    },
  });

  // Создаем консультанта
  const consultant1 = await prisma.user.create({
    data: {
      email: 'consultant1@mnu.kz',
      name: 'Консультант 1',
      password: await hash('123123', 12),
      role: Role.CONSULTANT,
      manager: {
        connect: {
          id: manager1.id,
        },
      },
    },
  });

  const consultant2 = await prisma.user.create({
    data: {
      email: 'consultant2@mnu.kz',
      name: 'Консультант 2',
      password: await hash('123123', 12),
      role: Role.CONSULTANT,
      manager: {
        connect: {
          id: manager2.id,
        },
      },
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'user1@mnu.kz',
      name: 'Пользователь 1',
      password: await hash('123123', 12),
      role: Role.USER,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@mnu.kz',
      name: 'Пользователь 2',
      password: await hash('123123', 12),
      role: Role.USER,
    },
  });
  console.log(lawyer, manager1, manager2, consultant1, consultant2, user1, user2);

  await prisma.educationalProgramGroup.deleteMany();

  // Создаем образовательную программу
  const educationalProgramGroup = await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Информационные технологии',
      name_kaz: 'Ақпараттық технологиялар',
      name_eng: 'Information Technology',
      code: 'B057',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: {
          name_rus: 'Информационные системы',
          name_kaz: 'Ақпараттық жүйелер',
          name_eng: 'Information Systems',
          code: 'B057-1',
          academic_level: AcademicLevel.BACHELORS,
          costPerCredit: '35000',
        },
      },
    },
    include: {
      programs: true,
    },
  });

  // Создаем документ
  const document = await prisma.document.create({
    data: {
      link: 'https://example.com/doc1',
      name: 'Удостоверение личности',
      number: '123456789',
      issuingAuthority: 'МВД РК',
      issueDate: new Date('2020-01-01'),
      expirationDate: new Date('2030-01-01'),
      type: DocumentType.IDENTIFICATION,
      status: DocumentStatus.APPROVED,
      uploadedById: admin.id,
    },
  });

  // Создаем заявителя
  const applicant = await prisma.applicant.create({
    data: {
      firstname: 'Серик',
      lastname: 'Бериков',
      middlename: 'Ерикович',
      firstnameTranslit: 'Serik',
      lastnameTranslit: 'Berikov',
      dob: new Date('1995-05-15'),
      gender: Gender.MALE,
      ethnicity: 'kz',
      maritalStatus: MaritalStatus.NOT_MARRIED,
      citizenship: 'kz',
      identificationNumber: '950515300123',
      email: 'user1@mnu.kz',
      phone: '+77771234567',
      addressResidential: 'г. Алматы, ул. Абая 1',
      addressRegistration: 'г. Алматы, ул. Абая 1',
      identificationDocId: document.id,
    },
  });

  // Создаем документы для представителя
  const representativeDoc = await prisma.document.create({
    data: {
      link: 'https://example.com/rep_doc',
      name: 'Доверенность',
      number: '987654321',
      issuingAuthority: 'Нотариус',
      issueDate: new Date('2020-01-01'),
      expirationDate: new Date('2030-01-01'),
      type: DocumentType.OTHER,
      status: DocumentStatus.APPROVED,
      uploadedById: admin.id,
    },
  });

  const representativeIdDoc = await prisma.document.create({
    data: {
      link: 'https://example.com/rep_id',
      name: 'Удостоверение личности представителя',
      number: '987654322',
      issuingAuthority: 'МВД РК',
      issueDate: new Date('1980-01-01'),
      expirationDate: new Date('2030-01-01'),
      type: DocumentType.IDENTIFICATION,
      status: DocumentStatus.APPROVED,
      uploadedById: admin.id,
    },
  });

  const representative = await prisma.representative.create({
    data: {
      applicantId: applicant.id,
      firstname: 'Тестер',
      lastname: 'Тестов',
      middlename: 'Тестович',
      firstnameTranslit: 'Tester',
      lastnameTranslit: 'Testov',
      citizenship: Citizenship.KAZAKHSTAN,
      identificationNumber: '800101300123',
      representativeDocId: representativeDoc.id,
      identificationDocId: representativeIdDoc.id,
      email: 'alex@example.com',
      phone: '+77771234568',
    },
  });

  const details = await prisma.details.create({
    data: {
      type: StudyType.PAID,
      academicLevel: AcademicLevel.BACHELORS,
      educationalProgramId: educationalProgramGroup.programs[0].id,
      isDormNeeds: true,
      language: StudyLanguage.RUS,
    },
  });

  // Создаем заявку
  const application = await prisma.application.create({
    data: {
      createdById: user1.id,
      consultantId: consultant1.id,
      applicantId: applicant.id,
      representativeId: representative.id,
      detailsId: details.id,
    },
    include: {
      representative: true,
      details: true,
    },
  });

  // Создаем лог
  await prisma.log.create({
    data: {
      createdById: user1.id,
      applicationId: application.id,
      status: ApplicationStatus.PROCESSING,
      description: 'Заявка создана',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
