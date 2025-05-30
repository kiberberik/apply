import {
  PrismaClient,
  Role,
  DocumentType,
  AcademicLevel,
  StudyType,
  SupportLanguages,
  Country,
  AgeCategory,
  ApplicationStatus,
  IdentificationDocumentType,
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

  await prisma.language.create({
    data: {
      code: SupportLanguages.POLY,
      name_rus: 'Полиязычный',
      name_kaz: 'Көптілді',
      name_eng: 'Multilingual',
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
      email: 'sanzhar_k@mnu.kz',
      name: 'Санжар',
      password: await hash('123123', 12),
      role: Role.ADMIN,
      emailVerified: new Date(),
      emailVerificationToken: 'admin2-verified',
    },
  });

  await prisma.user.create({
    data: {
      email: 'rasul_aisayev@kazguu.kz',
      name: 'Расул',
      password: await hash('123123', 12),
      role: Role.ADMIN,
      emailVerified: new Date(),
      emailVerificationToken: 'admin3-verified',
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
      email: 'user1@example.com',
      name: 'Regular User 1',
      role: Role.ADMIN,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'Regular User 2',
      role: Role.USER,
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

  // const educationalProgramGroup = await prisma.educationalProgramGroup.create({
  //   data: {
  //     name_rus: 'Информационные технологии',
  //     name_kaz: 'Ақпараттық технологиялар',
  //     name_eng: 'Information Technology',
  //     code: 'B057',
  //     academic_level: AcademicLevel.BACHELORS,
  //     programs: {
  //       create: {
  //         name_rus: 'Информационные системы',
  //         name_kaz: 'Ақпараттық жүйелер',
  //         name_eng: 'Information Systems',
  //         code: 'B057-1',
  //         academic_level: AcademicLevel.BACHELORS,
  //         costPerCredit: '35000',
  //         languages: {
  //           create: [
  //             { language: { connect: { id: russian.id } } },
  //             { language: { connect: { id: kazakh.id } } },
  //             { language: { connect: { id: english.id } } },
  //           ],
  //         },
  //       },
  //     },
  //   },
  //   include: {
  //     programs: {
  //       include: {
  //         languages: true,
  //       },
  //     },
  //   },
  // });

  const educationalProgramGroup = await prisma.educationalProgramGroup.create({
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
    include: {
      programs: true,
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

  // Создаем заявителя
  const applicant = await prisma.applicant.create({
    data: {
      surname: 'Заманов',
      givennames: 'Аман',
      patronymic: 'Жаманович',
      birthDate: new Date('2002-01-01'),
      birthPlace: 'Казахстан, Мангистауская область',
      isCitizenshipKz: true,
      citizenship: 'KAZAKHSTAN',
      identificationNumber: '020101888999',
      documentType: IdentificationDocumentType.ID_CARD,
      documentNumber: 'ID0123456789',
      documentIssueDate: new Date('2020-01-01'),
      documentExpiryDate: new Date('2030-01-01'),
      documentIssuingAuthority: 'МВД РК',
      documentFileLinks: JSON.stringify(['https://example.com/applicant1_id_card']),
      email: 'aman@test.test',
      phone: '+77071112233',
      addressResidential: 'Казахстан, Астана, Нура, Айтеке би, 45',
      addressRegistration: 'Казахстан, Астана, Нура, Айтеке би, 45',
      documents: {
        create: [
          {
            link: 'https://example.com/applicant1_id_card',
            name: 'Удостоверение личности заявителя',
            type: DocumentType.IDENTIFICATION,
            uploadedBy: {
              connect: {
                id: user1.id,
              },
            },
          },
        ],
      },
    },
  });

  // Создаем представителя
  const representative = await prisma.representative.create({
    data: {
      givennames: 'Жаман',
      patronymic: 'Романович',
      surname: 'Саманов',
      isCitizenshipKz: true,
      citizenship: 'KAZAKHSTAN',
      identificationNumber: '880202123321',
      documentType: IdentificationDocumentType.ID_CARD,
      documentNumber: 'ID9876543210',
      documentIssueDate: new Date('2019-05-15'),
      documentExpiryDate: new Date('2029-05-15'),
      documentIssuingAuthority: 'МВД РК',
      documentFileLinks: JSON.stringify(['https://example.com/representative1_id_card']),
      representativeDocumentNumber: 'REP12345',
      representativeDocumentIssueDate: new Date('2022-01-01'),
      representativeDocumentExpiryDate: new Date('2032-01-01'),
      representativeDocumentIssuingAuthority: 'Нотариальная контора',
      representativeDocumentFileLinks: JSON.stringify(['https://example.com/representative1_doc']),
      relationshipDegree: 'PARENT',
      email: 'zhaman@test.test',
      phone: '+77076665544',
      addressResidential: 'Казахстан, Астана, Нура, Айтеке би, 45',
      addressRegistration: 'Казахстан, Астана, Нура, Айтеке би, 45',
      applicant: {
        connect: {
          id: applicant.id,
        },
      },
    },
  });

  // Создаем детали заявки
  const details = await prisma.details.create({
    data: {
      type: StudyType.PAID,
      academicLevel: AcademicLevel.BACHELORS,
      isDormNeeds: false,
      studyingLanguage: SupportLanguages.ENG,
      educationalProgram: {
        connect: {
          id: educationalProgramGroup.programs[0].id,
        },
      },
    },
  });

  // Создаем заявку
  const application = await prisma.application.create({
    data: {
      createdBy: {
        connect: {
          id: user1.id,
        },
      },
      consultant: {
        connect: {
          id: consultant1.id,
        },
      },
      applicant: {
        connect: {
          id: applicant.id,
        },
      },
      representative: {
        connect: {
          id: representative.id,
        },
      },
      details: {
        connect: {
          id: details.id,
        },
      },
      documents: {},
      Log: {
        create: {
          createdBy: {
            connect: {
              id: user1.id,
            },
          },
          statusId: ApplicationStatus.PROCESSING,
        },
      },
    },
  });

  console.log(application);

  // Создаем тестовые обязательные документы
  await prisma.requiredDocument.createMany({
    data: [
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
        studyTypes: JSON.stringify([
          StudyType.PAID,
          StudyType.GRANT,
          StudyType.CONDITIONAL,
          StudyType.NONE_DEGREE,
        ]),
        ageCategories: JSON.stringify([AgeCategory.ADULT, AgeCategory.MINOR]),
      },
      {
        name_rus: 'Вступительный взнос',
        name_kaz: 'Қабылдау жарнасы',
        name_eng: 'Admission Fee',
        code: 'ADMISSION-FEE',
        type: DocumentType.FINANCIAL,
        isNeedOriginal: true,
        isScanRequired: true,
        description: 'Вступительный взнос',
        countries: JSON.stringify([Country.KAZAKHSTAN, Country.OTHER]),
        academicLevels: JSON.stringify([
          AcademicLevel.BACHELORS,
          AcademicLevel.MASTERS,
          AcademicLevel.DOCTORAL,
        ]),
        studyTypes: JSON.stringify([
          StudyType.PAID,
          StudyType.GRANT,
          StudyType.CONDITIONAL,
          StudyType.NONE_DEGREE,
        ]),
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
