'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';

const SuccessEmail = () => {
  const name = 'Мухамедкарим';
  const locale = useLocale();

  const handleTestMail = async () => {
    try {
      const emailResponse = await fetch('/api/email/success-enrolled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: 'cmdcpd3vk0001rqx6mdm80ztz', // 'cm9sqpj9g0001rqnmnf7d8hgd',
          locale: locale, // Используем русский язык по умолчанию
        }),
      });

      if (!emailResponse.ok) {
        console.error('Ошибка при отправке письма');
      }
    } catch (error) {
      console.error('Ошибка при отправке письма:', error);
    }
  };

  return (
    <div style={{ backgroundColor: '#9CA3AF', margin: '0', padding: '0' }}>
      <Button onClick={handleTestMail}>test success enrolled mail</Button>
      <div style={{ margin: '0 auto', width: '100%', backgroundColor: '#9CA3AF' }}>
        <div style={{ margin: '0 auto', maxWidth: '768px', textAlign: 'center' }}>
          <div
            style={{
              height: '350px',
              backgroundImage: "url('/images/ise-hero.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          ></div>
          <div
            style={{
              position: 'relative',
              marginTop: '-10px',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              backgroundColor: 'white',
              padding: '40px 0',
            }}
          >
            <div
              style={{
                zIndex: '50',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <Image
                src={'/images/ise-logo.svg'}
                alt=""
                style={{ height: '50px', width: 'auto' }}
                width={100}
                height={100}
              />
              <Image
                src={'/images/logo_mnu_red.svg'}
                alt=""
                style={{ height: '50px', width: 'auto' }}
                width={100}
                height={100}
              />
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2
                style={{
                  marginBottom: '16px',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Құрметті, {name}!
              </h2>
              <p
                style={{
                  marginBottom: '16px',
                  padding: '0 40px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#000000',
                }}
              >
                Сізбен қуанышты жаңалықпен бөлісуге асықпыз - сіздің өтінішіңіз сәтті өңделіп,{' '}
                <span style={{ color: '#D62E1F' }}>Maqsut&nbsp;Narikbayev&nbsp;University</span>{' '}
                университетіне ресми түрде қабылдандыңыз!
              </p>
              <div
                style={{
                  padding: '0 16px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#000000',
                }}
              >
                Сіздің ресми құжаттарыңыз — Білім беру қызметін көрсету туралы Шарт және Қосылу
                туралы Өтініш — Жеке кабинетіңізде қолжетімді. Жаңа ортаға тез бейімделуіңізге
                көмектесу үшін біз сізді қош келдіңіз бетіне шақырамыз. Ол жерде студенттік ұйымдар,
                пайдалы кеңестер мен көптеген маңызды ақпараттар ұсынылған.
                <br />
                <br />
                Сондай-ақ, оқу барысында қажет барлық платформалар ресми сайтымыздағы{' '}
                <Link
                  href="https://mnu.kz/kk-kz/"
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: '#D62E1F' }}
                >
                  mnu.kz
                </Link>{' '}
                Пайдалы сілтемелер бөлімінде көрсетілген. Оған дейін, &ldquo;MNU-де оқу&rdquo;
                бөліміндегі оқу платформалары мен оқу үдерісіне қатысты толық ақпаратпен танысып
                шығуыңызды сұраймыз.
                <br />
                <br />
                Қабылдануыңызбен шын жүректен құттықтаймыз! Жаңа жетістіктер мен жарқын болашаққа
                бірге қадам басайық!
              </div>
            </div>
            <div style={{ zIndex: '50', marginBottom: '32px' }}>
              <h2
                style={{
                  zIndex: '50',
                  marginBottom: '16px',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Уважаемый(ая), {name}!
              </h2>
              <p
                style={{
                  zIndex: '50',
                  marginBottom: '16px',
                  padding: '0 40px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#000000',
                }}
              >
                Поздравляем Вас с зачислением в{' '}
                <span style={{ color: '#D62E1F' }}>Maqsut&nbsp;Narikbayev&nbsp;University!</span>
              </p>
              <p
                style={{
                  zIndex: '50',
                  padding: '0 16px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#000000',
                }}
              >
                Ваши официальные документы — Договор об оказании образовательных услуг и Заявление о
                присоединении — уже доступны в вашем Личном кабинете. Чтобы помочь вам легче
                адаптироваться, приглашаем вас посетить нашу приветственную страницу, где вы найдете
                полезную информацию о студенческих организациях, лайфхаки и многое другое
                <br />
                <br />
                Также, все необходимые для обучения платформы перечислены в разделе Полезные ссылки
                на нашем официальном сайте:{' '}
                <Link
                  href="https://mnu.kz/ru/"
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: '#D62E1F' }}
                >
                  mnu.kz
                </Link>
                . Перед этим, пожалуйста, ознакомьтесь с подробной информацией о платформах для
                обучения и других учебных процессах в разделе Обучение в MNU.
              </p>
            </div>
            <div style={{ zIndex: '50', marginBottom: '32px' }}>
              <h2
                style={{
                  marginBottom: '16px',
                  fontFamily: 'Inter, Arial, sans-serif',
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#000000',
                }}
              >
                Dear {name}!
              </h2>
              <p
                style={{
                  marginBottom: '16px',
                  padding: '0 40px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#000000',
                }}
              >
                We are delighted to inform you that your application has been successfully processed
                — you are officially admitted to{' '}
                <span style={{ color: '#D62E1F' }}>Maqsut&nbsp;Narikbayev&nbsp;University!</span>
              </p>
              <p
                style={{
                  padding: '0 16px',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.5',
                  color: '#000000',
                }}
              >
                Your official documents — the Educational Services Agreement and the Enrollment
                Application — are already available in your Personal Account.
                <br />
                <br />
                To help you adapt more easily, we invite you to visit our Welcome Page, where you
                will find useful information about student organizations, life hacks, and much more.
                <br />
                <br />
                Additionally, all platforms required for your studies are listed in the Useful Links
                section on our official website:{' '}
                <Link
                  href="https://mnu.kz/"
                  style={{ cursor: 'pointer', textDecoration: 'underline', color: '#D62E1F' }}
                >
                  mnu.kz
                </Link>
                . Before proceeding, please review the detailed information about learning platforms
                and academic processes in the Studying at MNU section.
                <br />
                <br />
                Congratulations once again on your admission! We look forward to seeing you thrive
                and grow as part of the MNU community 🌟
              </p>
            </div>

            <Link href={'https://lp.mnu.kz/box'}>
              <button
                style={{
                  margin: '0 auto',
                  display: 'flex',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderRadius: '12px',
                  backgroundColor: '#D62E1F',
                  padding: '8px 16px',
                  color: 'white',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                See more
                <svg
                  width="9"
                  height="11"
                  viewBox="0 0 9 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.52479 7.61783L7.76484 0.847354L0.990512 1.57215C0.918906 1.57034 0.847746 1.58392 0.781848 1.612C0.71595 1.64007 0.656854 1.68198 0.608559 1.73487C0.560264 1.78777 0.523899 1.85043 0.501925 1.9186C0.479951 1.98678 0.472881 2.05888 0.481195 2.13002C0.489508 2.20117 0.51301 2.2697 0.55011 2.33097C0.58721 2.39224 0.637042 2.44483 0.696231 2.48516C0.755421 2.5255 0.822587 2.55265 0.893182 2.56478C0.963777 2.5769 1.03615 2.57372 1.10541 2.55544L6.18263 2.02023L0.196409 9.48041C0.113416 9.58384 0.0749095 9.716 0.0893591 9.84782C0.103809 9.97963 0.170031 10.1003 0.273458 10.1833C0.376886 10.2663 0.509046 10.3048 0.640865 10.2904C0.772683 10.2759 0.893362 10.2097 0.976355 10.1063L6.96258 2.64607L7.53996 7.71867C7.55489 7.85052 7.62158 7.97103 7.72535 8.0537C7.82913 8.13637 7.9615 8.17444 8.09334 8.15951C8.22518 8.14459 8.3457 8.0779 8.42837 7.97412C8.51104 7.87035 8.5491 7.73798 8.53418 7.60614L8.52479 7.61783Z"
                    fill="white"
                  />
                </svg>
              </button>
            </Link>

            <Image
              src={'/images/ise-mascot.svg'}
              alt=""
              style={{
                position: 'absolute',
                top: '150px',
                left: '0',
                zIndex: '0',
                opacity: '0.5',
              }}
              width={800}
              height={800}
            />
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              alignItems: 'start',
              justifyContent: 'space-between',
              gap: '16px',
              backgroundColor: 'black',
              padding: '24px 16px',
              color: '#9E9E9E',
            }}
          >
            <Link href="https://mnu.kz/">
              <Image src={'/images/logo_mnu.svg'} alt="" style={{}} width={100} height={80} />
            </Link>
            <div style={{ textAlign: 'left', color: '#9E9E9E' }}>
              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  textDecoration: 'underline',
                }}
              >
                Contact Us
              </h3>
              <Link href="mailto:info@mnu.kz" style={{ color: '#9E9E9E', textDecoration: 'none' }}>
                <h4 style={{ paddingTop: '4px', fontSize: '12px', margin: '0' }}>info@mnu.kz</h4>
              </Link>
              <Link href="tel:+77172703030" style={{ color: '#9E9E9E', textDecoration: 'none' }}>
                <h4 style={{ paddingTop: '4px', fontSize: '12px', margin: '0' }}>
                  +7(717) 270-30-30
                </h4>
              </Link>
              <Link href="tel:+77001703030" style={{ color: '#9E9E9E', textDecoration: 'none' }}>
                <h4 style={{ paddingTop: '4px', fontSize: '12px', margin: '0' }}>
                  +7(700) 170-30-30
                </h4>
              </Link>
            </div>
            <div style={{ textAlign: 'left', color: '#9E9E9E' }}>
              <h3
                style={{
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  textDecoration: 'underline',
                }}
              >
                Socials
              </h3>
              <div
                style={{
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'start',
                  justifyContent: 'start',
                  gap: '8px',
                }}
              >
                <Link href="https://instagram.com/mnu.kz">
                  <Image src="/images/ig.svg" width={20} height={20} alt="" style={{}} />
                </Link>
                <Link href="https://www.facebook.com/kazguuKZ/?locale=ru_RU">
                  <Image src="/images/fb.svg" width={20} height={20} alt="" style={{}} />
                </Link>
                <Link href="https://www.tiktok.com/@mnu.kz">
                  <Image src="/images/tt.svg" width={20} height={20} alt="" style={{}} />
                </Link>
              </div>
            </div>
            <div style={{ textAlign: 'left', color: '#9E9E9E' }}>
              <Link
                href="https://mnu.kz/dsa"
                style={{ color: '#9E9E9E', textDecoration: 'underline' }}
              >
                <h3 style={{ fontSize: '12px', margin: '0' }}>Student Life</h3>
              </Link>
              <Link
                href="https://mnu.kz/studying/"
                style={{ color: '#9E9E9E', textDecoration: 'underline' }}
              >
                <h3 style={{ paddingTop: '8px', fontSize: '12px', margin: '0' }}>
                  Studying at MNU
                </h3>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessEmail;
