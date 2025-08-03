import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getTranslations } from 'next-intl/server';
import { checkServerAccess } from '@/lib/serverAuth';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getContractBuffer } from '@/lib/contractUtils';

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

  console.log('Processing application:', id);
  console.log('TrustMe ID:', application.trustMeId);
  console.log('Contract file links:', application.contractFileLinks);

  const email = application?.applicant?.email as string;
  const givennames = application?.applicant?.givennames as string;
  //   const consultant = application?.consultant?.name as string;

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
          contractFilename = 'contract.pdf'; //offline_
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
    const attachments = contractBuffer
      ? [
          {
            filename: contractFilename,
            content: contractBuffer,
            contentType: 'application/pdf',
          },
        ]
      : undefined;

    console.log('Email attachments prepared:', attachments ? 'YES' : 'NO');
    if (attachments) {
      console.log('Attachment filename:', attachments[0].filename);
      console.log('Attachment content length:', attachments[0].content.length);
    }

    console.log('Sending email to:', email);
    await sendEmail({
      to: email,
      cc: 'dwts@mnu.kz',
      subject: 'Test Success Enrolled',
      html: `
      <div style="margin: 0 auto; width: 100%; background-color: #9CA3AF;">
  <div style="margin: 0 auto; max-width: 768px; text-align: center;">
    <div style="height: 350px; background-image: url('https://spaces.mnu.kz/wp-content/uploads/2025/07/ise-hero.jpg'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
    <div style="position: relative; background-color: white; padding: 40px 0;">
      <div style="z-index: 50; margin-bottom: 32px; display: flex; align-items: center; justify-content: center; gap: 16px;">
        <img src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ise-logo.svg" alt="" style="height: 50px; width: auto;" />
        <img src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu_red.svg" alt="" style="height: 50px; width: auto;" />
      </div>
      <div style="margin-bottom: 32px;">
        <h2 style="margin-bottom: 16px; font-family: Inter, Arial, sans-serif; font-size: 30px; font-weight: bold; color: #000000;">
          Құрметті, ${givennames}!
        </h2>
        <p style="margin-bottom: 16px; padding: 0 40px; font-family: Montserrat, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #000000;">
          Сізбен қуанышты жаңалықпен бөлісуге асықпыз - сіздің өтінішіңіз сәтті өңделіп,
          <span style="color: #D62E1F;">Maqsut&nbsp;Narikbayev&nbsp;University</span>
          университетіне ресми түрде қабылдандыңыз!
        </p>
        <div style="padding: 0 16px; font-family: Montserrat, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #000000;">
          Сіздің ресми құжаттарыңыз — Білім беру қызметін көрсету туралы Шарт және Қосылу туралы Өтініш — Жеке кабинетіңізде қолжетімді. Жаңа ортаға тез бейімделуіңізге көмектесу үшін біз сізді қош келдіңіз бетіне шақырамыз. Ол жерде студенттік ұйымдар, пайдалы кеңестер мен көптеген маңызды ақпараттар ұсынылған.
          <br /><br />
          Сондай-ақ, оқу барысында қажет барлық платформалар ресми сайтымыздағы <a href="https://mnu.kz/kk-kz/" style="cursor: pointer; text-decoration: underline; color: #D62E1F;">mnu.kz</a> Пайдалы сілтемелер бөлімінде көрсетілген. Оған дейін, “MNU-де оқу” бөліміндегі оқу платформалары мен оқу үдерісіне қатысты толық ақпаратпен танысып шығуыңызды сұраймыз.
          <br /><br />
          Қабылдануыңызбен шын жүректен құттықтаймыз! Жаңа жетістіктер мен жарқын болашаққа бірге қадам басайық!
        </div>
      </div>

      <div style="z-index: 50; margin-bottom: 32px;">
        <h2 style="margin-bottom: 16px; font-family: Inter, Arial, sans-serif; font-size: 30px; font-weight: bold; color: #000000;">
          Уважаемый(ая), ${givennames}!
        </h2>
        <p style="margin-bottom: 16px; padding: 0 40px; font-family: Montserrat, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #000000;">
          Поздравляем Вас с зачислением в <span style="color: #D62E1F;">Maqsut&nbsp;Narikbayev&nbsp;University!</span>
        </p>
        <p style="padding: 0 16px; font-family: Montserrat, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #000000;">
          Ваши официальные документы — Договор об оказании образовательных услуг и Заявление о присоединении — уже доступны в вашем Личном кабинете. Чтобы помочь вам легче адаптироваться, приглашаем вас посетить нашу приветственную страницу, где вы найдете полезную информацию о студенческих организациях, лайфхаки и многое другое
          <br /><br />
          Также, все необходимые для обучения платформы перечислены в разделе Полезные ссылки на нашем официальном сайте: <a href="https://mnu.kz/ru/" style="cursor: pointer; text-decoration: underline; color: #D62E1F;">mnu.kz</a>. Перед этим, пожалуйста, ознакомьтесь с подробной информацией о платформах для обучения и других учебных процессах в разделе Обучение в MNU.
        </p>
      </div>

      <div style="z-index: 50; margin-bottom: 32px;">
        <h2 style="margin-bottom: 16px; font-family: Inter, Arial, sans-serif; font-size: 30px; font-weight: bold; color: #000000;">
          Dear ${givennames}!
        </h2>
        <p style="margin-bottom: 16px; padding: 0 40px; font-family: Montserrat, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #000000;">
          We are delighted to inform you that your application has been successfully processed — you are officially admitted to <span style="color: #D62E1F;">Maqsut&nbsp;Narikbayev&nbsp;University!</span>
        </p>
        <p style="padding: 0 16px; font-family: Montserrat, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #000000;">
          Your official documents — the Educational Services Agreement and the Enrollment Application — are already available in your Personal Account.
          <br /><br />
          To help you adapt more easily, we invite you to visit our Welcome Page, where you will find useful information about student organizations, life hacks, and much more.
          <br /><br />
          Additionally, all platforms required for your studies are listed in the Useful Links section on our official website: <a href="https://mnu.kz/" style="cursor: pointer; text-decoration: underline; color: #D62E1F;">mnu.kz</a>. Before proceeding, please review the detailed information about learning platforms and academic processes in the Studying at MNU section.
          <br /><br />
          Congratulations once again on your admission! We look forward to seeing you thrive and grow as part of the MNU community 🌟
        </p>
      </div>

      <a href="https://lp.mnu.kz/box">
        <button style="margin: 0 auto; display: flex; cursor: pointer; align-items: center; justify-content: center; gap: 8px; border-radius: 12px; background-color: #D62E1F; padding: 8px 16px; color: white; border: none; font-size: 16px; font-weight: bold;">
          See more
        </button>
      </a>
    </div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: black; padding: 24px 16px; color: #9E9E9E; font-family: Arial, sans-serif;">
  <tr>
    <td align="center">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 768px;">
        <tr>
          <!-- Logo -->
          <td align="left" style="width: 25%; padding: 0 8px;">
            <a href="https://mnu.kz/" target="_blank">
              <img src="https://spaces.mnu.kz/wp-content/uploads/2025/07/logo_mnu.svg" alt="MNU Logo" width="100" height="80" style="display: block;">
            </a>
          </td>

          <!-- Contact Us -->
          <td align="left" style="width: 25%; padding: 0 8px; color: #9E9E9E; font-size: 12px;">
            <strong style="text-transform: uppercase; text-decoration: underline;">Contact Us</strong><br>
            <a href="mailto:info@mnu.kz" style="color: #9E9E9E; text-decoration: none;">info@mnu.kz</a><br>
            <a href="tel:+77172703030" style="color: #9E9E9E; text-decoration: none;">+7 (717) 270-30-30</a><br>
            <a href="tel:+77001703030" style="color: #9E9E9E; text-decoration: none;">+7 (700) 170-30-30</a>
          </td>

          <!-- Socials -->
          <td align="left" style="width: 25%; padding: 0 8px; color: #9E9E9E; font-size: 12px;">
            <strong style="text-transform: uppercase; text-decoration: underline;">Socials</strong><br>
            <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 8px;">
              <tr>
                <td style="padding-right: 8px;">
                  <a href="https://instagram.com/mnu.kz" target="_blank">
                    <img src="https://spaces.mnu.kz/wp-content/uploads/2025/07/ig.svg" alt="Instagram" width="20" height="20" style="display: block;">
                  </a>
                </td>
                <td style="padding-right: 8px;">
                  <a href="https://www.facebook.com/kazguuKZ/?locale=ru_RU" target="_blank">
                    <img src="https://spaces.mnu.kz/wp-content/uploads/2025/07/fb.svg" alt="Facebook" width="20" height="20" style="display: block;">
                  </a>
                </td>
                <td>
                  <a href="https://www.tiktok.com/@mnu.kz" target="_blank">
                    <img src="https://spaces.mnu.kz/wp-content/uploads/2025/07/tt.svg" alt="TikTok" width="20" height="20" style="display: block;">
                  </a>
                </td>
              </tr>
            </table>
          </td>

          <!-- Links -->
          <td align="left" style="width: 25%; padding: 0 8px; color: #9E9E9E; font-size: 12px;">
            <a href="https://mnu.kz/dsa" style="color: #9E9E9E; text-decoration: underline; display: block; margin-bottom: 8px;">Student Life</a>
            <a href="https://mnu.kz/studying/" style="color: #9E9E9E; text-decoration: underline; display: block;">Studying at MNU</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

  </div>
</div>
      `,
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
