'use client';
import { useTranslations } from 'next-intl';

const Loading = () => {
  const c = useTranslations('Common');
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-rose-500" />
        <p className="text-gray-500">{c('loading')}</p>
      </div>
    </div>
  );
};

export default Loading;
