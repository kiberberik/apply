'use client';
import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';

const NoAccess = () => {
  const t = useTranslations('NoAccess');
  const router = useRouter();
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 rounded-full bg-red-100 p-4">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="mb-4 text-2xl font-bold text-gray-900">{t('title')}</h1>

        <p className="mb-8 text-gray-600">{t('description')}</p>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            {t('goBack')}
          </Button>

          <Button onClick={() => router.push('/')}>{t('goHome')}</Button>
        </div>
      </div>
    </div>
  );
};

export default NoAccess;
