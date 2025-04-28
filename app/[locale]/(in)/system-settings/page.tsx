import { Button } from '@/components/ui/button';
import { File, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import React from 'react';

export default async function Page() {
  const t = await getTranslations('SystemSettings');
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900">{t('title')}</h1>
      <div className="my-4 grid grid-cols-1 flex-wrap gap-4 sm:grid-cols-2">
        <Button className="flex h-12 w-full items-center justify-start gap-3 px-8 py-6">
          <BookOpen className="h-8 w-8 shrink-0" />
          <Link
            href="/system-settings/educational-programs"
            className="text-left text-lg text-wrap"
          >
            {t('educationalPrograms')}
          </Link>
        </Button>
        <Button className="flex h-12 w-full items-center justify-start gap-3 px-8 py-6">
          <File className="h-8 w-8 shrink-0" />
          <Link href="/system-settings/required-documents" className="text-left text-lg text-wrap">
            {t('requiredDocuments')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
