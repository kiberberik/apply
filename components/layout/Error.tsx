import React from 'react';
import { useTranslations } from 'next-intl';
const Error = () => {
  const c = useTranslations('Common');
  return (
    <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-zinc-800/50">
      <p className="container mx-auto py-10 text-red-500">{c('error')}</p>
    </div>
  );
};

export default Error;
