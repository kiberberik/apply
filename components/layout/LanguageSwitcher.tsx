'use client';

import { Fragment } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { LanguageIcon } from '@heroicons/react/24/outline';

const languages = {
  ru: 'Русский',
  en: 'English',
  kz: 'Қазақша',
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    router.push(newPath);
  };

  return (
    <Menu as="div" className="relative mx-4 text-left">
      <MenuButton className="flex items-center justify-center space-x-2 p-2 text-sm transition-colors duration-200">
        <span>{languages[currentLocale as keyof typeof languages]}</span>
        <LanguageIcon className="h-6 w-6 text-rose-600 hover:text-rose-400" />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="ring-opacity-5 absolute right-0 z-10 mt-2 w-min origin-top-right rounded-lg shadow-lg ring-1 focus:outline-none">
          {Object.entries(languages).map(([locale, label]) => {
            if (locale === currentLocale) return null;

            return (
              <MenuItem key={locale}>
                {({ active }) => (
                  <button
                    onClick={() => handleLanguageChange(locale)}
                    className={classNames(
                      'flex w-full items-center justify-center rounded-sm px-6 py-2 text-sm',
                      active ? 'bg-zinc-700 text-white' : 'text-black',
                    )}
                  >
                    {label}
                  </button>
                )}
              </MenuItem>
            );
          })}
        </MenuItems>
      </Transition>
    </Menu>
  );
}
