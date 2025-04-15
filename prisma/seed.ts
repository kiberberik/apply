import {
  PrismaClient,
  Role,
  DocumentType,
  Citizenship,
  ApplicationStatus,
  AcademicLevel,
  StudyType,
  SupportLanguages,
  Country,
  AgeCategory,
} from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Очищаем таблицы в правильном порядке
  await prisma.log.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.application.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.representative.deleteMany();
  await prisma.details.deleteMany();
  await prisma.status.deleteMany();
  await prisma.requiredDocument.deleteMany();
  await prisma.educationalProgramLanguage.deleteMany();
  await prisma.educationalProgram.deleteMany();
  await prisma.educationalProgramGroup.deleteMany();
  await prisma.language.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // Создаем языки
  const russian = await prisma.language.create({
    data: {
      code: SupportLanguages.RUS,
      name_rus: 'Русский',
      name_kaz: 'Орыс',
      name_eng: 'Russian',
    },
  });

  const kazakh = await prisma.language.create({
    data: {
      code: SupportLanguages.KAZ,
      name_rus: 'Казахский',
      name_kaz: 'Қазақ',
      name_eng: 'Kazakh',
    },
  });

  const english = await prisma.language.create({
    data: {
      code: SupportLanguages.ENG,
      name_rus: 'Английский',
      name_kaz: 'Ағылшын',
      name_eng: 'English',
    },
  });

  // Создаем администратора
  const admin = await prisma.user.create({
    data: {
      email: 'bazarov_berik@mnu.kz',
      name: 'Администратор',
      password: await hash('456456', 12),
      role: Role.ADMIN,
      emailVerified: new Date(),
      emailVerificationToken: 'admin-verified',
    },
  });

  await prisma.user.create({
    data: {
      email: 's_kurmangaliuly@kazguu.kz',
      name: 'Санжар',
      password: await hash('123123', 12),
      role: Role.ADMIN,
      emailVerified: new Date(),
      emailVerificationToken: 'admin2-verified',
    },
  });

  const lawyer = await prisma.user.create({
    data: {
      email: 'lawyer@mnu.kz',
      name: 'Юрист',
      password: await hash('123123', 12),
      role: Role.LAWYER,
      emailVerified: new Date(),
      emailVerificationToken: 'lawyer-verified',
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@mnu.kz',
      name: 'Менеджер 1',
      password: await hash('123123', 12),
      role: Role.MANAGER,
      emailVerified: new Date(),
      emailVerificationToken: 'manager1-verified',
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@mnu.kz',
      name: 'Менеджер 2',
      password: await hash('123123', 12),
      role: Role.MANAGER,
      emailVerified: new Date(),
      emailVerificationToken: 'manager2-verified',
    },
  });

  // Создаем консультанта
  const consultant1 = await prisma.user.create({
    data: {
      email: 'consultant1@mnu.kz',
      name: 'Консультант 1',
      password: await hash('123123', 12),
      role: Role.CONSULTANT,
      emailVerified: new Date(),
      emailVerificationToken: 'consultant1-verified',
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
      emailVerified: new Date(),
      emailVerificationToken: 'consultant2-verified',
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
      emailVerified: new Date(),
      emailVerificationToken: 'user1-verified',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@mnu.kz',
      name: 'Пользователь 2',
      password: await hash('123123', 12),
      role: Role.USER,
      emailVerified: new Date(),
      emailVerificationToken: 'user2-verified',
    },
  });

  // Создаем сессии для пользователей
  await prisma.session.create({
    data: {
      sessionToken: 'admin-session',
      userId: admin.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 дней
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'lawyer-session',
      userId: lawyer.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'manager1-session',
      userId: manager1.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'manager2-session',
      userId: manager2.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'consultant1-session',
      userId: consultant1.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'consultant2-session',
      userId: consultant2.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'user1-session',
      userId: user1.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.session.create({
    data: {
      sessionToken: 'user2-session',
      userId: user2.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(lawyer, manager1, manager2, consultant1, consultant2, user1, user2, admin);

  await prisma.educationalProgramGroup.deleteMany();

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
          languages: {
            create: [
              { language: { connect: { id: russian.id } } },
              { language: { connect: { id: kazakh.id } } },
              { language: { connect: { id: english.id } } },
            ],
          },
        },
      },
    },
    include: {
      programs: {
        include: {
          languages: true,
        },
      },
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Переводческое дело',
      name_kaz: 'Аударма ісі',
      name_eng: 'Translation Studies',
      code: 'B036',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: [
          {
            name_rus: 'Переводческое дело',
            name_kaz: 'Аударма ісі',
            name_eng: 'Translation Studies',
            code: '6B02301',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
              ],
            },
          },
          {
            name_rus: 'Переводческое дело',
            name_kaz: 'Аударма ісі',
            name_eng: 'Translation Studies',
            code: '6B02301',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Прикладная лингвистика',
            name_kaz: 'Қолданбалы лингвистика',
            name_eng: 'Applied Linguistics',
            code: '6B02302',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Международные отношения и дипломатия',
      name_kaz: 'Халықаралық қатынастар және дипломатия',
      name_eng: 'International Relations and Diplomacy',
      code: 'B140',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: {
          name_rus: 'Международные отношения',
          name_kaz: 'Халықаралық қатынастар',
          name_eng: 'International Relations',
          code: '6B03103',
          academic_level: AcademicLevel.BACHELORS,
          costPerCredit: '50000',
          duration: 4,
        },
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Психология',
      name_kaz: 'Психология',
      name_eng: 'Psychology',
      code: 'B041',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: [
          {
            name_rus: 'Психология',
            name_kaz: 'Психология',
            name_eng: 'Psychology',
            code: '6B03101',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Психология',
            name_kaz: 'Психология',
            name_eng: 'Psychology',
            code: '6B03101',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Психология',
            name_kaz: 'Психология',
            name_eng: 'Psychology',
            code: '6B03101',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Психология',
            name_kaz: 'Психология',
            name_eng: 'Psychology',
            code: '6B03101',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
        ],
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Журналистика и репортерское дело',
      name_kaz: 'Журналистика және репортерлік іс',
      name_eng: 'Journalism and Reporting',
      code: 'B042',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: {
          name_rus: 'Журналистика: аналитика и расследования',
          name_kaz: 'Журналистика: аналитика және тергеу',
          name_eng: 'Journalism: Analytics and Investigations',
          code: '6B03201',
          academic_level: AcademicLevel.BACHELORS,
          costPerCredit: '45000',
          duration: 3,
        },
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Право',
      name_kaz: 'Құқық',
      name_eng: 'Law',
      code: 'B049',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: [
          {
            name_rus: 'Юриспруденция',
            name_kaz: 'Заңгерлік',
            name_eng: 'Jurisprudence',
            code: '6B04201',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Юриспруденция',
            name_kaz: 'Заңгерлік',
            name_eng: 'Jurisprudence',
            code: '6B04201',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Юриспруденция',
            name_kaz: 'Заңгерлік',
            name_eng: 'Jurisprudence',
            code: '6B04201',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Юриспруденция',
            name_kaz: 'Заңгерлік',
            name_eng: 'Jurisprudence',
            code: '6B04201',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Международное право',
            name_kaz: 'Халықаралық құқық',
            name_eng: 'International Law',
            code: '6B04202',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
          {
            name_rus: 'Международное право',
            name_kaz: 'Халықаралық құқық',
            name_eng: 'International Law',
            code: '6B04202',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
            languages: {
              create: [
                { language: { connect: { id: russian.id } } },
                { language: { connect: { id: kazakh.id } } },
                { language: { connect: { id: english.id } } },
              ],
            },
          },
        ],
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Менеджмент и управление',
      name_kaz: 'Менеджмент және басқару',
      name_eng: 'Management and Administration',
      code: 'B044',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: [
          {
            name_rus: 'Бизнес администрирование в области Менеджмента',
            name_kaz: 'Менеджмент саласындағы бизнес әкімшілігі',
            name_eng: 'Business Administration in Management',
            code: '6B04115',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
          },
          {
            name_rus: 'Бизнес администрирование в области Информационных Технологий',
            name_kaz: 'Ақпараттық технологиялар саласындағы бизнес әкімшілігі',
            name_eng: 'Business Administration in Information Technology',
            code: '6B04116',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
          },
        ],
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Аудит и налогообложение',
      name_kaz: 'Аудит және салық салу',
      name_eng: 'Audit and Taxation',
      code: 'B045',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: {
          name_rus: 'Бизнес администрирование в области Бухгалтерского учета',
          name_kaz: 'Бухгалтерлік есеп саласындағы бизнес әкімшілігі',
          name_eng: 'Business Administration in Accounting',
          code: '6B04111',
          academic_level: AcademicLevel.BACHELORS,
          costPerCredit: '45000',
          duration: 4,
        },
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Финансы, экономика, банковское и страховое дело',
      name_kaz: 'Қаржы, экономика, банк ісі және сақтандыру ісі',
      name_eng: 'Finance, Economics, Banking and Insurance',
      code: 'B046',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: [
          {
            name_rus: 'Бизнес администрирование в области Экономики и науки о данных',
            name_kaz: 'Экономика және деректер туралы ғылым саласындағы бизнес әкімшілігі',
            name_eng: 'Business Administration in Economics and Data Science',
            code: '6B04112',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
          },
          {
            name_rus: 'Бизнес администрирование в области Финансов',
            name_kaz: 'Қаржы саласындағы бизнес әкімшілігі',
            name_eng: 'Business Administration in Finance',
            code: '6B04114',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
          },
        ],
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Маркетинг и реклама',
      name_kaz: 'Маркетинг және жарнама',
      name_eng: 'Marketing and Advertising',
      code: 'B047',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: {
          name_rus: 'Бизнес администрирование в области Маркетинга',
          name_kaz: 'Маркетинг саласындағы бизнес әкімшілігі',
          name_eng: 'Business Administration in Marketing',
          code: '6B04105',
          academic_level: AcademicLevel.BACHELORS,
          costPerCredit: '45000',
          duration: 4,
        },
      },
    },
    include: {
      programs: true,
    },
  });

  await prisma.educationalProgramGroup.create({
    data: {
      name_rus: 'Туризм',
      name_kaz: 'Туризм',
      name_eng: 'Tourism',
      code: 'B091',
      academic_level: AcademicLevel.BACHELORS,
      programs: {
        create: [
          {
            name_rus: 'Туризм',
            name_kaz: 'Туризм',
            name_eng: 'Tourism',
            code: '6B11102',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
          },
          {
            name_rus: 'Туризм',
            name_kaz: 'Туризм',
            name_eng: 'Tourism',
            code: '6B11102',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
          },
          {
            name_rus: 'Гостеприимство',
            name_kaz: 'Қонақжайлық',
            name_eng: 'Hospitality',
            code: '6B11101',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 4,
          },
          {
            name_rus: 'Гостеприимство',
            name_kaz: 'Қонақжайлық',
            name_eng: 'Hospitality',
            code: '6B11101',
            academic_level: AcademicLevel.BACHELORS,
            costPerCredit: '45000',
            duration: 3,
          },
        ],
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
      uploadedById: admin.id,
    },
  });

  // Создаем заявителя
  const applicant = await prisma.applicant.create({
    data: {
      firstname: 'Серик',
      lastname: 'Бериков',
      middlename: 'Ерикович',
      birthDate: new Date('1995-05-15'),
      citizenship: Citizenship.KAZAKHSTAN,
      birthPlace: 'Алматы',
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
      type: DocumentType.IDENTIFICATION,
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
      uploadedById: admin.id,
    },
  });

  const representative = await prisma.representative.create({
    data: {
      applicantId: applicant.id,
      firstname: 'Тестер',
      lastname: 'Тестов',
      middlename: 'Тестович',
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
      studyingLanguage: SupportLanguages.RUS,
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

  // Создаем статус
  const processingStatus = await prisma.status.create({
    data: {
      name: 'В обработке',
      description: 'Заявка находится в обработке',
      color: '#FFA500',
    },
  });

  // Создаем лог
  await prisma.log.create({
    data: {
      createdById: user1.id,
      applicationId: application.id,
      statusId: processingStatus.id,
      description: 'Заявка создана',
    },
  });

  // Создаем тестовые обязательные документы
  await prisma.requiredDocument.createMany({
    data: [
      {
        name_rus: 'Удостоверение личности',
        name_kaz: 'Жеке куәлік',
        name_eng: 'Identity Card',
        code: 'ID-001',
        type: DocumentType.IDENTIFICATION,
        isNeedOriginal: true,
        isScanRequired: true,
        description: 'Документ, удостоверяющий личность',
        countries: JSON.stringify([Country.KAZAKHSTAN]),
        academicLevels: JSON.stringify([AcademicLevel.BACHELORS, AcademicLevel.MASTERS]),
        studyTypes: JSON.stringify([StudyType.PAID, StudyType.GRANT]),
        ageCategories: JSON.stringify([AgeCategory.ADULT, AgeCategory.MINOR]),
      },
      {
        name_rus: 'Аттестат о среднем образовании',
        name_kaz: 'Орта білім туралы аттестат',
        name_eng: 'High School Diploma',
        code: 'ED-001',
        type: DocumentType.EDUCATIONAL,
        isNeedOriginal: true,
        isScanRequired: true,
        description: 'Документ о среднем образовании',
        countries: JSON.stringify([Country.KAZAKHSTAN, Country.OTHER]),
        academicLevels: JSON.stringify([AcademicLevel.BACHELORS]),
        studyTypes: JSON.stringify([StudyType.PAID, StudyType.GRANT]),
        ageCategories: JSON.stringify([AgeCategory.ADULT]),
      },
      {
        name_rus: 'Медицинская справка',
        name_kaz: 'Медициналық анықтама',
        name_eng: 'Medical Certificate',
        code: 'MED-001',
        type: DocumentType.MEDICAL,
        isNeedOriginal: true,
        isScanRequired: true,
        description: 'Справка о состоянии здоровья',
        countries: JSON.stringify([Country.KAZAKHSTAN]),
        academicLevels: JSON.stringify([
          AcademicLevel.BACHELORS,
          AcademicLevel.MASTERS,
          AcademicLevel.DOCTORAL,
        ]),
        studyTypes: JSON.stringify([StudyType.PAID, StudyType.GRANT]),
        ageCategories: JSON.stringify([AgeCategory.ADULT, AgeCategory.MINOR]),
      },
    ],
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
