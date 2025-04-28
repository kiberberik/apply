'use client';
import { useTranslations } from 'next-intl';

const NoAccess = () => {
  const c = useTranslations('Common');
  return <div className="container mx-auto py-10 text-red-500">{c('noAccess')}</div>;
};

export default NoAccess;
