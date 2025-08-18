import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getTranslations } from 'next-intl/server';
import { checkServerAccess } from '@/lib/serverAuth';
import { Role, AcademicLevel, StudyType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContractBuffer } from '@/lib/contractUtils';
import * as fs from 'fs';
import * as path from 'path';

// Получение логинов/паролей для абитуриента из внешнего источника
type ExternalLoginRow = {
  [key: string]: string | null | undefined;
};

type ApplicantCredentials = {
  email_login: string;
  email_pass: string;
  platonus_login: string;
  platonus_pass: string;
};

function normalizeName(input: string | null | undefined): string {
  if (!input) return '';
  return input.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

function buildNameVariants(fullName: string): string[] {
  const normalized = normalizeName(fullName);
  const parts = normalized.split(' ').filter(Boolean);
  const variants = new Set<string>([normalized]);
  // Если есть отчество, добавляем вариант без отчества
  if (parts.length >= 3) {
    variants.add(`${parts[0]} ${parts[1]}`);
  }
  return Array.from(variants);
}

async function fetchExternalLogins(): Promise<ExternalLoginRow[]> {
  const url = process.env.NEXT_PUBLIC_LOGINS_PASSWORDS;
  if (!url) return [];
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (Array.isArray(data)) return data as ExternalLoginRow[];
    return [];
  } catch {
    return [];
  }
}

async function getApplicantCredentialsByIinOrName(
  iin: string | null | undefined,
  fullName: string,
): Promise<ApplicantCredentials | null> {
  const rows = await fetchExternalLogins();
  if (!rows.length) return null;

  const nameVariants = buildNameVariants(fullName);

  // 1) Поиск по ИИН
  let found: ExternalLoginRow | undefined;
  if (iin) {
    found = rows.find((r) => String(r['ИИН'] ?? '').trim() === String(iin).trim());
  }

  // 2) Если ИИН нет или не нашли — поиск по ФИО
  if (!found) {
    found = rows.find((r) => {
      const fio = normalizeName(String(r['ФИО'] ?? ''));
      return nameVariants.some((v) => v === fio);
    });
  }

  if (!found) return null;

  const emailLogin = String(found['Корпоративная почта логин'] ?? '').trim();
  const emailPass = String(found['Пароль от корпоративной почты'] ?? '').trim();
  const platonusLogin = String(found['Логин от АИС "Платон"'] ?? '').trim();
  const platonusPass = String(found['Пароль от АИС "Платон"'] ?? '').trim();

  if (!emailLogin && !emailPass && !platonusLogin && !platonusPass) return null;

  return {
    email_login: emailLogin,
    email_pass: emailPass,
    platonus_login: platonusLogin,
    platonus_pass: platonusPass,
  };
}

function resolveStaticContractPath(
  academicLevel?: AcademicLevel | null,
  type?: StudyType | null,
): string | null {
  if (!academicLevel || !type) return null;

  const isBachelorsOrMasters =
    academicLevel === AcademicLevel.BACHELORS || academicLevel === AcademicLevel.MASTERS;

  if (isBachelorsOrMasters && type === StudyType.NONE_DEGREE) {
    return 'public/contracts/contract_nd_25.pdf';
  }

  if (academicLevel === AcademicLevel.BACHELORS && type === StudyType.CONDITIONAL) {
    return 'public/contracts/contract_conditional_25.pdf';
  }

  if (isBachelorsOrMasters && type === StudyType.GRANT) {
    return 'public/contracts/contract_grant_25_bac_mas.pdf';
  }

  if (isBachelorsOrMasters && type === StudyType.PAID) {
    return 'public/contracts/contract_paid_25_bac_mas.pdf';
  }

  if (academicLevel === AcademicLevel.DOCTORAL && type === StudyType.GRANT) {
    return 'public/contracts/contract_grant_25_phd.pdf';
  }

  if (academicLevel === AcademicLevel.DOCTORAL && type === StudyType.PAID) {
    return 'public/contracts/contract_paid_25_phd.pdf';
  }

  return null;
}

export async function POST(request: Request) {
  const { locale, id } = await request.json();
  const c = await getTranslations({ locale, namespace: 'Common' });
  const hasAccess = await checkServerAccess(Role.USER);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 });
  }

  const application = await prisma.application.findUnique({
    where: {
      id: id,
    },
    include: {
      applicant: true,
      consultant: true,
      details: {
        include: {
          educationalProgram: {
            include: {
              group: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    console.error('Application not found:', id);
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  console.log('application: ', application?.details?.educationalProgram?.group?.code);
  // return;

  switch (application.details?.academicLevel) {
  }

  console.log('Processing application:', id);
  console.log('TrustMe ID:', application.trustMeId);
  console.log('Contract file links:', application.contractFileLinks);

  const email = application?.applicant?.email as string;
  const givennames = application?.applicant?.givennames as string;
  const iin = application?.applicant?.identificationNumber as string;
  //   const consultant = application?.consultant?.name as string;

  const surname = application?.applicant?.surname as string;
  const patronymic = application?.applicant?.patronymic as string;
  const fullName = [surname, givennames, patronymic].filter(Boolean).join(' ').trim();

  const applicantCredentials = await getApplicantCredentialsByIinOrName(iin, fullName);
  console.log('Applicant credentials resolved:', applicantCredentials);

  if (!email) {
    console.error('No email found for application:', id);
    return NextResponse.json({ error: 'Email не найден' }, { status: 400 });
  }

  let contractBuffer = null;
  let contractFilename = 'Заявление.pdf';

  if (application?.trustMeId) {
    console.log('Attempting to download contract from TrustMe:', application.trustMeId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/trustme/download-contract?documentId=${application.trustMeId}`;
      console.log('Calling TrustMe API at:', apiUrl);

      const res = await fetch(apiUrl, {
        method: 'GET',
      });

      if (!res.ok) {
        console.error('TrustMe API response not ok:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('TrustMe API error response:', errorText);
        throw new Error(`TrustMe API error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      console.log('TrustMe API response:', data);

      if (data.success) {
        const filePath = data?.filePath;
        console.log('Contract file path from TrustMe:', filePath);

        if (filePath) {
          try {
            const fileName = filePath.replace('/private/contracts/', '');
            console.log('Attempting to read contract file:', fileName);

            contractBuffer = await getContractBuffer(fileName);
            console.log('Contract buffer received:', contractBuffer ? 'YES' : 'NO');

            if (contractBuffer) {
              contractFilename = 'Заявление.pdf'; //signed_
              console.log('Contract file successfully loaded from TrustMe');
            } else {
              console.error('Failed to get contract buffer from TrustMe file');
            }
          } catch (error) {
            console.error('Error reading TrustMe contract file:', error);
          }
        }
      } else {
        console.error('TrustMe API returned error:', data.error);
        return NextResponse.json({
          message: 'Ошибка при загрузке контракта из TrustMe',
          details: data.details || data.error,
        });
      }
    } catch (error) {
      console.error('Error calling TrustMe API:', error);
      return NextResponse.json({
        message: 'Ошибка при обращении к TrustMe API',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    console.log('No TrustMe ID, checking for offline contract');
    // Если нет trustMeId, пробуем взять контракт оффлайн
    const contractLinks = application?.contractFileLinks;
    let offlineFile = null;

    if (Array.isArray(contractLinks) && contractLinks.length > 0) {
      offlineFile = contractLinks[0];
    } else if (typeof contractLinks === 'string') {
      try {
        const arr = JSON.parse(contractLinks);
        if (Array.isArray(arr) && arr.length > 0) offlineFile = arr[0];
      } catch (error) {
        console.error('Failed to parse contract links JSON:', error);
      }
    }

    console.log('Offline file to process:', offlineFile);

    if (offlineFile) {
      try {
        contractBuffer = await getContractBuffer(offlineFile);
        console.log('Offline contract buffer received:', contractBuffer ? 'YES' : 'NO');

        if (contractBuffer) {
          contractFilename = 'Заявление.pdf'; //offline_
          console.log('Offline contract file successfully loaded');
        } else {
          console.error('Failed to get offline contract buffer');
          return NextResponse.json({
            message: 'Не удалось получить оффлайн контракт',
          });
        }
      } catch (error) {
        console.error('Error reading offline contract file:', error);
        return NextResponse.json({
          message: 'Ошибка при получении оффлайн контракта',
        });
      }
    } else {
      console.log('No offline contract file found');
    }
  }

  console.log('Final contract buffer status:', contractBuffer ? 'AVAILABLE' : 'NOT AVAILABLE');
  console.log('Contract filename:', contractFilename);

  try {
    // Подготовка второго вложения (статический шаблон договора из public/contracts)
    const staticContractPath = resolveStaticContractPath(
      application.details?.academicLevel as AcademicLevel | undefined,
      application.details?.type as StudyType | undefined,
    );

    let staticContractBuffer: Buffer | null = null;
    let staticContractFilename = '';

    if (staticContractPath) {
      try {
        const absStaticPath = path.join(process.cwd(), staticContractPath);
        if (fs.existsSync(absStaticPath)) {
          staticContractBuffer = fs.readFileSync(absStaticPath);
          staticContractFilename = path.basename(staticContractPath);
          console.log('Static contract loaded:', staticContractFilename);
        } else {
          console.warn('Static contract file not found:', absStaticPath);
        }
      } catch (e) {
        console.error('Failed to read static contract file:', e);
      }
    } else {
      console.log('No static contract path resolved for current application');
    }

    const attachmentsArray: Array<{ filename: string; content: Buffer; contentType: string }> = [];
    if (contractBuffer) {
      attachmentsArray.push({
        filename: contractFilename,
        content: contractBuffer,
        contentType: 'application/pdf',
      });
    }
    if (staticContractBuffer) {
      attachmentsArray.push({
        filename: 'Договор.pdf',
        content: staticContractBuffer,
        contentType: 'application/pdf',
      });
    }

    const attachments = attachmentsArray.length > 0 ? attachmentsArray : undefined;

    console.log('Email attachments prepared:', attachments ? 'YES' : 'NO');
    if (attachments) {
      attachments.forEach((a, idx) => {
        console.log(`Attachment[${idx}] filename:`, a.filename);
        console.log(`Attachment[${idx}] content length:`, a.content.length);
      });
    }

    console.log('Sending email to:', email);
    // ise
    // isj
    // sla
    // mls
    // application?.details?.academicLevel === (BACHELORS || MASTERS) && application?.details?.type === NONE_DEGREE = public/contracts/contract_nd_25.pdf
    // application?.details?.academicLevel === BACHELORS && application?.details?.type === CONDITIONAL = public/contracts/contract_conditional_25.pdf
    // application?.details?.academicLevel === (BACHELORS || MASTERS) && application?.details?.type === GRANT = public/contracts/contract_grant_25_bac_mas.pdf
    // application?.details?.academicLevel === (BACHELORS || MASTERS) && application?.details?.type === PAID = public/contracts/contract_paid_25_bac_mas.pdf
    // application?.details?.academicLevel === DOCTORAL && application?.details?.type === GRANT = public/contracts/contract_grant_25_phd.pdf
    // application?.details?.academicLevel === DOCTORAL && application?.details?.type === PAID = public/contracts/contract_paid_25_phd.pdf

    const htmlISJ = `
    <div style="margin: 0 auto; width: 100%; background-color: #9ca3af">
  <div style="margin: 0 auto; max-width: 768px; text-align: center">
    <div
      style="
        height: 350px;
        background-image: url(&quot;https://spaces.mnu.kz/wp-content/uploads/2025/07/isj-hero.jpg&quot;);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "
    ></div>
    <div style="position: relative; background-color: white; padding: 40px 0">
      <div style="text-align: center; margin-bottom: 32px;">
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/isj-logo.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle; margin-right: 16px;"
        />
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_red.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle;"
        />
      </div>
      <div style="margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Құрметті, ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Құттықтаймыз, сіз
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >-ге оқуға қабылдандыңыз!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🦊 ХЖМ - Түлкі</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Бүгіннен бастап сіз <b>Халықаралық журналистика мектебінің</b> бір бөлігісіз.
          Біздің символымыз - түлкі. Бұл жануар қырағылықты, алғыр ойды
          және тапқырлықты бейнелейді. Бұл қасиеттер әрбір журналист үшін
          маңызды: мәселенің түпкі мәнін аңғару, өткір сұрақтар қоя білу және
          шындықты анықтай білу.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Біздің мектепте сізді кәсіби жолға бастайтын қызықты сапар күтеді:
          заманауи студиялар, кәсіби техника және монтаж зертханалары. Сізге
          индустрия мамандары дәріс береді, алда - нақты медиа-жобалар,
          Қазақстанның жетекші БАҚ-тарында тағылымдамалар және халықаралық
          бағдарламаларға қатысу бар. Сонымен бірге, сізді жылы шырайлы
          қауымдастық, клубтар, фестивальдер мен есте қаларлық <b>студенттік өмір</b>
          күтіп тұр.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Оқуға қажетті барлық платформалар біздің сайттағы
          <a
            href="https://mnu.kz/kk-kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«MNU студенттеріне»</a
          >
          бөлімінде жинақталған. Жақын арада өздеріңіздің білім жолында әрдайым
          жандарыңыздан табылатын ХЖМ ұжымымен танысатын боласыздар.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>MNU</b> — сіздің тарихыңыздың жаңа тарауы басталатын орын.
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Уважаемый(ая), ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Поздравляем, вы зачислены в
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🦊 МШЖ - Лис</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          С сегодняшнего дня вы часть <b>Международной школы журналистики</b>. Наш
          символ — лис. Это животное олицетворяет наблюдательность,
          острый ум и находчивость. Эти качества важны для каждого журналиста:
          видеть суть, задавать неудобные вопросы и искать правду, даже когда её
          пытаются скрыть.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          В нашей школе вас ждёт увлекательный путь к профессии: современные
          студии, профессиональная техника и монтажные лаборатории. Вас будут
          обучать практики из индустрии, впереди — реальные медиа-проекты,
          стажировки в ведущих СМИ Казахстана и участие в международных
          программах. А ещё, тёплое сообщество, клубы, фестивали и <b>студенческая
          жизнь</b>, которую вы не забудете.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Все необходимые для учёбы платформы и сервисы уже собраны в разделе
          <a
            href="https://mnu.kz/ru/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Обучение в MNU»</a
          >
          на нашем сайте. Совсем скоро вы познакомитесь с командой МШЖ, которая
          будет рядом на всём вашем пути.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Добро пожаловать в <b>MNU</b> - место, где начинается новая глава вашей истории.
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Dear ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Congratulations — you are now enrolled at
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🦊 ISJ — The Fox</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          As of today, you are part of the <b>International School of Journalism</b>.
          Our symbol is the fox — a creature known for its keen
          observation, sharp intellect, and resourcefulness. These are essential
          qualities for every journalist: to perceive the truth beneath the
          surface, to ask difficult questions, and to uncover what others may
          try to hide.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          An exciting journey into the profession awaits you at our School. You
          will have access to state-of-the-art studios, professional equipment,
          and editing laboratories. Your education will be guided by experienced
          industry practitioners. Ahead of you lie real media projects,
          internships at leading Kazakhstani media outlets, and opportunities to
          participate in international programmes. You will also become part of
          a vibrant community — clubs, festivals, and <b>student life</b> that you’ll
          remember for years to come.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          All the platforms and services necessary for your studies are already
          available in the
          <a
            href="https://mnu.kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Studying at MNU»</a
          >
          section of our website. Very soon, you will meet the ISJ team, who
          will support you every step of the way.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>Welcome to MNU — the place where a new chapter of your story begins.</b>
        </p>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://outlook.office.com/mail/"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          Outlook
        </a>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <div style="
            width: 200px;
            margin: 0 auto;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          ">
            <a
              href="https://platonus.mnu.kz/"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Platonus
            </a>
            ${' '}/${' '}
            <a
              href="https://kazguu.instructure.com/login/ldap"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Canvas LMS
            </a>
        </div>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://lp.mnu.kz/box"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          See more &rarr;
        </a>
      </div>
    </div>

    <img
       src="https://spaces.mnu.kz/wp-content/uploads/2025/07/img_isj.png"
       alt="ISJ"
       width="100%"
       height="auto"
       style="display: block; padding: 20px 0;"
    />

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color: black;
        padding: 24px 16px;
        color: #9e9e9e;
        font-family: Arial, sans-serif;
      "
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width: 768px"
          >
            <tr>
              <!-- Logo -->
              <td align="left" valign="top" style="width: 25%; padding: 0 8px">
                <a href="https://mnu.kz/" target="_blank">
                  <img
                    src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_white.png"
                    alt="MNU Logo"
                    width="100"
                    height="auto"
                    style="display: block"
                  />
                </a>
              </td>

              <!-- Contact Us -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="
                    text-transform: uppercase;
                    text-decoration: underline;
                    margin-bottom: 8px;
                    display: block;
                  "
                  >Contact Us</strong
                >
                <a
                  href="mailto:info@mnu.kz"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >info@mnu.kz</a
                >
                <a
                  href="tel:+77172703030"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >+7 (717) 270-30-30</a
                >
                <a
                  href="tel:+77001703030"
                  style="color: #9e9e9e; text-decoration: none; display: block"
                  >+7 (700) 170-30-30</a
                >
              </td>

              <!-- Socials -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="text-transform: uppercase; text-decoration: underline"
                  >Socials</strong
                ><br />
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-top: 8px"
                >
                  <tr>
                    <td style="padding-right: 8px">
                      <a href="https://instagram.com/mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ig.png"
                          alt="Instagram"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td style="padding-right: 8px">
                      <a
                        href="https://www.facebook.com/kazguuKZ/?locale=ru_RU"
                        target="_blank"
                      >
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/fb.png"
                          alt="Facebook"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td>
                      <a href="https://www.tiktok.com/@mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/tt.png"
                          alt="TikTok"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Links -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <a
                  href="https://mnu.kz/dsa"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                    margin-bottom: 8px;
                  "
                  >Student Life</a
                >
                <a
                  href="https://mnu.kz/studying/"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                  "
                  >Studying at MNU</a
                >
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</div>
    `;

    const htmlMLS = `
    <div style="margin: 0 auto; width: 100%; background-color: #9ca3af">
  <div style="margin: 0 auto; max-width: 768px; text-align: center">
    <div
      style="
        height: 350px;
        background-image: url(&quot;https://spaces.mnu.kz/wp-content/uploads/2025/07/mls-hero.jpg&quot;);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "
    ></div>
    <div style="position: relative; background-color: white; padding: 40px 0">
      <div style="text-align: center; margin-bottom: 32px;">
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/mls-logo.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle; margin-right: 16px;"
        />
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_red.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle;"
        />
      </div>
      <div style="margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Құрметті, ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Құттықтаймыз, сіз
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >-ге оқуға қабылдандыңыз!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🦁 ҚЖМ — Арыстан</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Бүгіннен бастап сіз <b>Құқық жоғары мектебінің</b> бір бөлігісіз.
          Біздің символымыз - Арыстан. Ол әділеттілікті, күш пен көшбасшылықты бейнелейді. Арыстан секілді, сіз заң мен әділеттің қорғаны болып, құқықтар мен қағидаттарды сақтай отырып, адал қоғамның қалыптасуына ықпал етесіз.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          MNU-де сізді халықаралық деңгейдегі білім, тәжірибелі мамандардың қолдауы, түрлі жобаларға қатысу, тағылымдамалар мен халықаралық бағдарламалар күтіп тұр. Сондай-ақ,  сізді студенттік клубтар, фестивальдер, форумдардарға толы жарқын <b>студенттік өмір</b> күтіп тұр.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Оқуға қажетті барлық платформалар біздің сайттағы
          <a
            href="https://mnu.kz/kk-kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«MNU студенттеріне»</a
          >
          бөлімінде жинақталған. Жақын арада өздеріңіздің білім жолында әрдайым
          жандарыңыздан табылатын ХЖМ ұжымымен танысатын боласыздар.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>MNU</b> — сіздің тарихыңыздың жаңа тарауы басталатын орын.
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Уважаемый(ая), ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Поздравляем, вы зачислены в
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🦁 ВШП — Лев</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          С сегодняшнего дня вы часть <b>Высшей Школы Права</b>. Наш символ это Лев - воплощение справедливости, силы и лидерства. Как Лев, вы будете стоять на защите закона, отстаивать права и принципы, формируя честное и ответственное общество.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          В MNU вы получите знания международного уровня, поддержку преподавателей‑практиков, опыт участия в реальных проектах, стажировках и международных программах. А ещё вас ждёт яркая <b>студенческая жизнь</b>: клубы, фестивали, форумы и крутое сообщество.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Все необходимые для учёбы платформы и сервисы уже собраны в разделе
          <a
            href="https://mnu.kz/ru/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Обучение в MNU»</a
          >
          на нашем сайте. Совсем скоро вы познакомитесь с командой МШЖ, которая
          будет рядом на всём вашем пути.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Добро пожаловать в <b>MNU</b> - университет, который станет точкой старта вашего будущего!
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Dear ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Congratulations — you are now enrolled at
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🦁 MLS — The Lion</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          From today onwards, you are part of the <b>MNU Law School</b>. Our symbol is the Lion — the embodiment of justice, strength, and leadership. As a Lion, you will uphold the law, defend rights and principles, and contribute to building an honest and responsible society.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          At MNU, you will receive a world-class education, guided by experienced faculty who are active professionals in the field. You will gain practical experience through real-world projects, internships, and international programmes. In addition to your academic journey, you will find a vibrant <b>student life</b> — clubs, festivals, forums, and a welcoming, energetic community.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          All the platforms and services necessary for your studies are already
          available in the
          <a
            href="https://mnu.kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Studying at MNU»</a
          >
          section of our website. Very soon, you will meet the ISJ team, who
          will support you every step of the way.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>Welcome to MNU — the place where a new chapter of your story begins.</b>
        </p>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://outlook.office.com/mail/"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          Outlook
        </a>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <div style="
            width: 200px;
            margin: 0 auto;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          ">
            <a
              href="https://platonus.mnu.kz/"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Platonus
            </a>
            ${' '}/${' '}
            <a
              href="https://kazguu.instructure.com/login/ldap"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Canvas LMS
            </a>
        </div>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://lp.mnu.kz/box"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          See more &rarr;
        </a>
      </div>
    </div>

    <img
       src="https://spaces.mnu.kz/wp-content/uploads/2025/07/img_mls.png"
       alt="MLS"
       width="100%"
       height="auto"
       style="display: block; padding: 20px 0;"
    />

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color: black;
        padding: 24px 16px;
        color: #9e9e9e;
        font-family: Arial, sans-serif;
      "
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width: 768px"
          >
            <tr>
              <!-- Logo -->
              <td align="left" valign="top" style="width: 25%; padding: 0 8px">
                <a href="https://mnu.kz/" target="_blank">
                  <img
                    src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_white.png"
                    alt="MNU Logo"
                    width="100"
                    height="auto"
                    style="display: block"
                  />
                </a>
              </td>

              <!-- Contact Us -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="
                    text-transform: uppercase;
                    text-decoration: underline;
                    margin-bottom: 8px;
                    display: block;
                  "
                  >Contact Us</strong
                >
                <a
                  href="mailto:info@mnu.kz"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >info@mnu.kz</a
                >
                <a
                  href="tel:+77172703030"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >+7 (717) 270-30-30</a
                >
                <a
                  href="tel:+77001703030"
                  style="color: #9e9e9e; text-decoration: none; display: block"
                  >+7 (700) 170-30-30</a
                >
              </td>

              <!-- Socials -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="text-transform: uppercase; text-decoration: underline"
                  >Socials</strong
                ><br />
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-top: 8px"
                >
                  <tr>
                    <td style="padding-right: 8px">
                      <a href="https://instagram.com/mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ig.png"
                          alt="Instagram"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td style="padding-right: 8px">
                      <a
                        href="https://www.facebook.com/kazguuKZ/?locale=ru_RU"
                        target="_blank"
                      >
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/fb.png"
                          alt="Facebook"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td>
                      <a href="https://www.tiktok.com/@mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/tt.png"
                          alt="TikTok"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Links -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <a
                  href="https://mnu.kz/dsa"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                    margin-bottom: 8px;
                  "
                  >Student Life</a
                >
                <a
                  href="https://mnu.kz/studying/"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                  "
                  >Studying at MNU</a
                >
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</div>
    `;

    const htmlISE = `
    <div style="margin: 0 auto; width: 100%; background-color: #9ca3af">
  <div style="margin: 0 auto; max-width: 768px; text-align: center">
    <div
      style="
        height: 350px;
        background-image: url(&quot;https://spaces.mnu.kz/wp-content/uploads/2025/07/ise-hero.jpg&quot;);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "
    ></div>
    <div style="position: relative; background-color: white; padding: 40px 0">
      <div style="text-align: center; margin-bottom: 32px;">
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ise-logo.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle; margin-right: 16px;"
        />
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_red.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle;"
        />
      </div>
      <div style="margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Құрметті, ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Құттықтаймыз, сіз
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >-ге оқуға қабылдандыңыз!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🔥 МШЭ — Феникс</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
        Бүгіннен бастап сіз <b>Халықаралық экономика мектебінің</b> бір бөлігісіз. Біздің символымыз - жаңғыруды, трансформацияны және өсуді бейнелейтін Феникс. Феникс ретінде сіз талдау мен стратегиялық ойлаудың күшіне сүйене отырып, қиындықтарды жеңуді, өзгерістерден мүмкіндіктер табуды және болашақты құруды үйренесіз.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          MNU-де сізді халықаралық деңгейдегі білім, тәжірибелі мамандардың қолдауы, түрлі жобаларға қатысу, тағылымдамалар мен халықаралық бағдарламалар күтіп тұр. Сондай-ақ, сізді студенттік клубтар, фестивальдер, форумдардарға толы жарқын <b>студенттік өмір</b> күтіп тұр.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Оқуға қажетті барлық платформалар біздің сайттағы
          <a
            href="https://mnu.kz/kk-kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«MNU студенттеріне»</a
          >
          бөлімінде жинақталған. Жақын арада өздеріңіздің білім жолында әрдайым
          жандарыңыздан табылатын ХЖМ ұжымымен танысатын боласыздар.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>MNU</b> — сіздің тарихыңыздың жаңа тарауы басталатын орын.
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Уважаемый(ая), ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Поздравляем, вы зачислены в
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🔥 МШЭ — Феникс</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
         С сегодняшнего дня вы - часть <b>Международной школы экономики</b>. Наш символ - Феникс, олицетворяющий возрождение, трансформацию и рост. Как Феникс, вы научитесь преодолевать вызовы, находить возможности в переменах и строить будущее, опираясь на силу анализа и стратегического мышления.        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          В MNU вы получите знания международного уровня, поддержку преподавателей‑практиков, опыт участия в реальных проектах, стажировках и международных программах. А ещё вас ждёт яркая <b>студенческая жизнь</b>: клубы, фестивали, форумы и крутое сообщество.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Все необходимые для учёбы платформы и сервисы уже собраны в разделе
          <a
            href="https://mnu.kz/ru/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Обучение в MNU»</a
          >
          на нашем сайте. Совсем скоро вы познакомитесь с командой МШЖ, которая
          будет рядом на всём вашем пути.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Добро пожаловать в <b>MNU</b> - университет, который станет точкой старта вашего будущего!
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Dear ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Congratulations — you are now enrolled at
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🔥 ISE — The Phoenix</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          From today onwards, you are a student of the <b>International School of Economics</b>. Our symbol is the Phoenix — a timeless emblem of rebirth, transformation, and resilience. As a Phoenix, you will learn to rise above challenges, embrace change, and shape the future through the power of critical analysis and strategic thinking.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          At MNU, you will receive a world-class education, guided by experienced faculty who are active professionals in the field. You will gain practical experience through real-world projects, internships, and international programmes. In addition to your academic journey, you will find a vibrant student life — clubs, festivals, forums, and a welcoming, energetic community.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          All the platforms and services necessary for your studies are already
          available in the
          <a
            href="https://mnu.kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Studying at MNU»</a
          >
          section of our website. Very soon, you will meet the ISJ team, who
          will support you every step of the way.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>Welcome to MNU — the place where a new chapter of your story begins.</b>
        </p>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://outlook.office.com/mail/"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          Outlook
        </a>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <div style="
            width: 200px;
            margin: 0 auto;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          ">
            <a
              href="https://platonus.mnu.kz/"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Platonus
            </a>
            ${' '}/${' '}
            <a
              href="https://kazguu.instructure.com/login/ldap"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Canvas LMS
            </a>
        </div>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://lp.mnu.kz/box"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          See more &rarr;
        </a>
      </div>
    </div>

    <img
       src="https://spaces.mnu.kz/wp-content/uploads/2025/07/img_ise.png"
       alt="ISE"
       width="100%"
       height="auto"
       style="display: block; padding: 20px 0;"
    />

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color: black;
        padding: 24px 16px;
        color: #9e9e9e;
        font-family: Arial, sans-serif;
      "
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width: 768px"
          >
            <tr>
              <!-- Logo -->
              <td align="left" valign="top" style="width: 25%; padding: 0 8px">
                <a href="https://mnu.kz/" target="_blank">
                  <img
                    src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_white.png"
                    alt="MNU Logo"
                    width="100"
                    height="auto"
                    style="display: block"
                  />
                </a>
              </td>

              <!-- Contact Us -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="
                    text-transform: uppercase;
                    text-decoration: underline;
                    margin-bottom: 8px;
                    display: block;
                  "
                  >Contact Us</strong
                >
                <a
                  href="mailto:info@mnu.kz"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >info@mnu.kz</a
                >
                <a
                  href="tel:+77172703030"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >+7 (717) 270-30-30</a
                >
                <a
                  href="tel:+77001703030"
                  style="color: #9e9e9e; text-decoration: none; display: block"
                  >+7 (700) 170-30-30</a
                >
              </td>

              <!-- Socials -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="text-transform: uppercase; text-decoration: underline"
                  >Socials</strong
                ><br />
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-top: 8px"
                >
                  <tr>
                    <td style="padding-right: 8px">
                      <a href="https://instagram.com/mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ig.png"
                          alt="Instagram"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td style="padding-right: 8px">
                      <a
                        href="https://www.facebook.com/kazguuKZ/?locale=ru_RU"
                        target="_blank"
                      >
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/fb.png"
                          alt="Facebook"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td>
                      <a href="https://www.tiktok.com/@mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/tt.png"
                          alt="TikTok"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Links -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <a
                  href="https://mnu.kz/dsa"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                    margin-bottom: 8px;
                  "
                  >Student Life</a
                >
                <a
                  href="https://mnu.kz/studying/"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                  "
                  >Studying at MNU</a
                >
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</div>
    `;

    const htmlSLA = `
    <div style="margin: 0 auto; width: 100%; background-color: #9ca3af">
  <div style="margin: 0 auto; max-width: 768px; text-align: center">
    <div
      style="
        height: 350px;
        background-image: url(&quot;https://spaces.mnu.kz/wp-content/uploads/2025/07/sla-hero.jpg&quot;);
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
      "
    ></div>
    <div style="position: relative; background-color: white; padding: 40px 0">
      <div style="text-align: center; margin-bottom: 32px;">
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/sla-logo.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle; margin-right: 16px;"
        />
        <img
          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_red.png"
          alt=""
          style="height: 50px; width: auto; display: inline-block; vertical-align: middle;"
        />
      </div>
      <div style="margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Құрметті, ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Құттықтаймыз, сіз
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >-ге оқуға қабылдандыңыз!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🐉 ЖГМ — Айдаһар</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
        Бүгіннен бастап сіз <b>Жоғары Гуманитарлық Мектептің</b> бір бөлігісіз. Біздің символымыз - Айдаһар. Ол даналықты, ой тереңдігін және рух қуатын бейнелейді. Айдаһар секілді, сіз әлемді талдаумен шектелмей, оны мәдениет, тіл, идеялар және адам болмысына терең түсінік арқылы жетілдіруге үлес қосасыз.        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
        MNU-де сізді халықаралық деңгейдегі білім, тәжірибелі мамандардың қолдауы, түрлі жобаларға қатысу, тағылымдамалар мен халықаралық бағдарламалар күтіп тұр. Сондай-ақ,  сізді студенттік клубтар, фестивальдер, форумдардарға толы жарқын <b>студенттік өмір</b> күтіп тұр.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Оқуға қажетті барлық платформалар біздің сайттағы
          <a
            href="https://mnu.kz/kk-kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«MNU студенттеріне»</a
          >
          бөлімінде жинақталған. Жақын арада өздеріңіздің білім жолында әрдайым
          жандарыңыздан табылатын ХЖМ ұжымымен танысатын боласыздар.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>MNU</b> — сіздің тарихыңыздың жаңа тарауы басталатын орын.
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Уважаемый(ая), ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Поздравляем, вы зачислены в
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🐉 ВГШ — Дракон</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
        С сегодняшнего дня вы - часть <b>Высшей Гуманитарной Школы</b>. Наш символ это Дракон, воплощающий мудрость, глубину мысли и силу духа. Как Дракон, вы будете не только анализировать мир, но и влиять на его развитие - через культуру, язык, идеи и понимание человека.
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
        В MNU вы получите знания международного уровня, поддержку преподавателей‑практиков, опыт участия в реальных проектах, стажировках и международных программах. А ещё вас ждёт яркая <b>студенческая жизнь</b>: клубы, фестивали, форумы и крутое сообщество.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Все необходимые для учёбы платформы и сервисы уже собраны в разделе
          <a
            href="https://mnu.kz/ru/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Обучение в MNU»</a
          >
          на нашем сайте. Совсем скоро вы познакомитесь с командой МШЖ, которая
          будет рядом на всём вашем пути.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Добро пожаловать в <b>MNU</b> - университет, который станет точкой старта вашего будущего!
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px">
        <h2
          style="
            margin-bottom: 16px;
            font-family: Inter, Arial, sans-serif;
            font-size: 30px;
            font-weight: bold;
            color: #000000;
          "
        >
          Dear ${givennames}!
        </h2>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          Congratulations — you are now enrolled at
          <span style="color: #d62e1f"
            >Maqsut&nbsp;Narikbayev&nbsp;University</span
          >!
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>🐉 SLA — The Dragon</b>
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
        From today onwards, you are a member of the <b>School of Liberal Arts</b>. Our symbol is the Dragon — a creature that embodies wisdom, intellectual depth, and strength of spirit. As a Dragon, you will not only analyse the world, but also contribute to shaping it through culture, language, ideas, and a profound understanding of humanity.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          At MNU, you will receive a world-class education, guided by experienced faculty who are active professionals in the field. You will gain practical experience through real-world projects, internships, and international programmes. In addition to your academic journey, you will find a vibrant <b>student life</b> — clubs, festivals, forums, and a welcoming, energetic community.
        </p>

        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          All the platforms and services necessary for your studies are already
          available in the
          <a
            href="https://mnu.kz/studying/"
            style="cursor: pointer; text-decoration: underline; color: #d62e1f"
            >«Studying at MNU»</a
          >
          section of our website. Very soon, you will meet the ISJ team, who
          will support you every step of the way.
        </p>
        <p
          style="
            margin-bottom: 16px;
            padding: 0 40px;
            font-family: Montserrat, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #000000;
          "
        >
          <b>Welcome to MNU — the place where a new chapter of your story begins.</b>
        </p>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://outlook.office.com/mail/"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          Outlook
        </a>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.email_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <div style="
            width: 200px;
            margin: 0 auto;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          ">
            <a
              href="https://platonus.mnu.kz/"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Platonus
            </a>
            ${' '}/${' '}
            <a
              href="https://kazguu.instructure.com/login/ldap"
              style="
                display: inline-block;
                cursor: pointer;
              "
            >
              Canvas LMS
            </a>
        </div>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="margin-top: 12px; margin-bottom: 12px; border-collapse: collapse"
        >
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Login:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_login || ''}</td>
          </tr>
          <tr>
            <td style="text-align: right; width: 50%; padding: 4px 8px; font-weight: 600; white-space: nowrap;">Password:</td>
            <td style="text-align: left; padding: 4px 8px;">${applicantCredentials?.platonus_pass || ''}</td>
          </tr>
        </table>
      </div>

      <div style="margin: 0 auto; width: 100%; text-align: center">
        <a
          href="https://lp.mnu.kz/box"
          style="
            width: 200px;
            margin: 0 auto;
            display: inline-block;
            cursor: pointer;
            border-radius: 12px;
            background-color: #d62e1f;
            padding: 8px 16px;
            color: white;
            border: none;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            text-align: center;
          "
        >
          See more &rarr;
        </a>
      </div>
    </div>

    <img
       src="https://spaces.mnu.kz/wp-content/uploads/2025/07/img_sla.png"
       alt="SLA"
       width="100%"
       height="auto"
       style="display: block; padding: 20px 0;"
    />

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        background-color: black;
        padding: 24px 16px;
        color: #9e9e9e;
        font-family: Arial, sans-serif;
      "
    >
      <tr>
        <td align="center" valign="top">
          <table
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="max-width: 768px"
          >
            <tr>
              <!-- Logo -->
              <td align="left" valign="top" style="width: 25%; padding: 0 8px">
                <a href="https://mnu.kz/" target="_blank">
                  <img
                    src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_white.png"
                    alt="MNU Logo"
                    width="100"
                    height="auto"
                    style="display: block"
                  />
                </a>
              </td>

              <!-- Contact Us -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="
                    text-transform: uppercase;
                    text-decoration: underline;
                    margin-bottom: 8px;
                    display: block;
                  "
                  >Contact Us</strong
                >
                <a
                  href="mailto:info@mnu.kz"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >info@mnu.kz</a
                >
                <a
                  href="tel:+77172703030"
                  style="
                    color: #9e9e9e;
                    text-decoration: none;
                    margin-bottom: 4px;
                    display: block;
                  "
                  >+7 (717) 270-30-30</a
                >
                <a
                  href="tel:+77001703030"
                  style="color: #9e9e9e; text-decoration: none; display: block"
                  >+7 (700) 170-30-30</a
                >
              </td>

              <!-- Socials -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <strong
                  style="text-transform: uppercase; text-decoration: underline"
                  >Socials</strong
                ><br />
                <table
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="margin-top: 8px"
                >
                  <tr>
                    <td style="padding-right: 8px">
                      <a href="https://instagram.com/mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ig.png"
                          alt="Instagram"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td style="padding-right: 8px">
                      <a
                        href="https://www.facebook.com/kazguuKZ/?locale=ru_RU"
                        target="_blank"
                      >
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/fb.png"
                          alt="Facebook"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                    <td>
                      <a href="https://www.tiktok.com/@mnu.kz" target="_blank">
                        <img
                          src="https://spaces.mnu.kz/wp-content/uploads/2025/07/tt.png"
                          alt="TikTok"
                          width="20"
                          height="20"
                          style="display: block"
                        />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>

              <!-- Links -->
              <td
                align="left"
                valign="top"
                style="
                  width: 25%;
                  padding: 0 8px;
                  color: #9e9e9e;
                  font-size: 12px;
                "
              >
                <a
                  href="https://mnu.kz/dsa"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                    margin-bottom: 8px;
                  "
                  >Student Life</a
                >
                <a
                  href="https://mnu.kz/studying/"
                  style="
                    color: #9e9e9e;
                    text-decoration: underline;
                    display: block;
                  "
                  >Studying at MNU</a
                >
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</div>
    `;

    // Определение HTML-шаблона по коду группы образовательной программы
    const groupCodeRaw = application?.details?.educationalProgram?.group?.code ?? '';
    const groupCode = typeof groupCodeRaw === 'string' ? groupCodeRaw.trim().toUpperCase() : '';

    const SLA_CODES = new Set<string>(['B036', 'B041', 'B091', 'M059', 'M056', 'M066']);
    const ISE_CODES = new Set<string>([
      'B140',
      'B044',
      'B045',
      'B046',
      'B047',
      'M064',
      'M074',
      'M070',
      'D070',
    ]);
    const ISJ_CODES = new Set<string>(['B042']);
    const MLS_CODES = new Set<string>(['B049', 'M078', 'D078']);

    let selectedHtml = '';
    if (ISJ_CODES.has(groupCode)) selectedHtml = htmlISJ;
    else if (SLA_CODES.has(groupCode)) selectedHtml = htmlSLA;
    else if (MLS_CODES.has(groupCode)) selectedHtml = htmlMLS;
    else if (ISE_CODES.has(groupCode)) selectedHtml = htmlISE;

    console.log('Educational program group code:', groupCode, '-> template selected');

    await sendEmail({
      to: 'berikbazar@yandex.com', // email,
      cc: 'dwts@mnu.kz, kairula_madina@mnu.kz, 95bazarov@gmail.com, burambekov@gmail.com, a_zhussipova@kazguu.kz, f_bakirova@kazguu.kz, e_suleeva@kazguu.kz, a_muratova@kazguu.kz, shynarbek_a@kazguu.kz, ibrayevas@kazguu.kz, sh_utegenova@kazguu.kz, f_zhussupbekova@mnu.kz, nagymetbaevd@gmail.com',
      subject: 'Test Success Enrolled',
      html: selectedHtml,
      attachments,
    });

    console.log('Email sent successfully');
    return NextResponse.json({
      message: c('successMessage'),
    });
  } catch (error) {
    console.error('Enrolled email error:', error);
    return NextResponse.json({ error: c('error') }, { status: 500 });
  }
}
