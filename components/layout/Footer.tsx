import Link from 'next/link';
import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <div className="bg-[#0F0F0F] py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-zinc-400">
          2025 {year > 2025 ? `- ${year}` : ''} ©
          <Link href={'mailto:dwts@mnu.kz'} target="_blank">
            {' '}
            DWTS MNU{' '}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Footer;
