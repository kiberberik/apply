import type { Metadata } from 'next';
import '../globals.css';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Mulish } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import { ToastContainer } from 'react-toastify';
import Footer from '@/components/layout/Footer';

const mulish = Mulish({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mulish',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Apply MNU',
  description: 'Admission MNU',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body className={`${mulish.variable} antialiased`}>
        <NextTopLoader
          color="#D62E20"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD"
          template='<div class="bar" role="bar"><div class="peg"></div></div> 
  <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
          zIndex={1600}
          showAtBottom={false}
        />
        <NextIntlClientProvider>
          <div className="flex min-h-screen w-full flex-col">
            <div className="flex-grow">{children}</div>
            <Footer />
          </div>
        </NextIntlClientProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
