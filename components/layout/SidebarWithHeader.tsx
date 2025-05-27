'use client';
import React, { Fragment, useState } from 'react';
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import {
  ArrowLeftStartOnRectangleIcon,
  Bars3BottomLeftIcon,
  ChartBarIcon,
  FolderIcon,
  // HomeIcon,
  InboxIcon,
  UsersIcon,
  XMarkIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
// import { Cog8ToothIcon } from '@heroicons/react/20/solid'; // MagnifyingGlassIcon
import { useLocale, useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Role } from '@prisma/client';
import { hasAccess } from '@/lib/hasAccess';
import { Button } from '../ui/button';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function NavigationHeader({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('Navigation');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const { user } = useAuthStore();

  async function handleLogout() {
    try {
      await useAuthStore.getState().logout(); // Вызов logout из zustand
      router.push('/auth');
      router.refresh();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  }

  const navigation = [
    // { name: t('profile'), href: '/', icon: HomeIcon, requiredRole: Role.USER },
    {
      name: t('applications'),
      href: '/applications',
      icon: FolderIcon,
      requiredRole: Role.MANAGER,
    },
    { name: t('users'), href: '/users', icon: UsersIcon, requiredRole: Role.ADMIN },
    { name: t('statistics'), href: '/statistics', icon: ChartBarIcon, requiredRole: Role.MANAGER },
    {
      name: t('systemSettings'),
      href: '/system-settings',
      icon: InboxIcon,
      requiredRole: Role.ADMIN,
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    hasAccess(user?.role ?? Role.USER, item.requiredRole),
  );

  // const userNavigation = [
  //   { name: t('profile'), href: '/', icon: HomeIcon },
  //   { name: t('settings'), href: '/settings', icon: Cog8ToothIcon },
  // ];

  return (
    <>
      <div>
        {/* Мобильное меню */}
        <Transition show={mobileMenuOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 md:hidden" onClose={setMobileMenuOpen}>
            <TransitionChild
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="bg-opacity-75 fixed inset-0 bg-zinc-600" />
            </TransitionChild>

            <div className="fixed inset-0 z-40 flex">
              <TransitionChild
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-[#0F0F0F] pt-5 pb-4">
                  {/* <TransitionChild
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:ring-2 focus:ring-white focus:outline-none focus:ring-inset"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </TransitionChild> */}
                  <div className="mx-auto flex w-[100%] items-center justify-between p-4">
                    <div className="flex flex-shrink-0 items-center justify-between">
                      <Logo />
                    </div>
                    <button
                      type="button"
                      className="text-gray-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-5 flex-1 overflow-y-auto px-2">
                    <nav className="space-y-1">
                      {filteredNavigation.map((item) => {
                        const isActive = pathname.endsWith(locale + item.href);
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              isActive
                                ? 'bg-[#D62E20] text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'group flex items-center px-2 py-2 text-base font-medium',
                            )}
                          >
                            <item.icon className="mr-4 h-6 w-6 flex-shrink-0" aria-hidden="true" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        {/* Основной контент */}
        <div className="flex flex-col">
          <div className="sticky top-0 z-50 bg-[#0F0F0F] shadow">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center">
                <button
                  type="button"
                  className={`text-gray-300 sm:hidden ${
                    user?.role == 'USER' || user?.role == 'CONSULTANT' ? 'hidden' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Bars3BottomLeftIcon className="h-6 w-6" />
                </button>
                <div
                  className={`${user?.role == 'USER' || user?.role == 'CONSULTANT' ? 'block' : 'hidden'} sm:block`}
                >
                  <Logo />
                </div>
              </div>

              {/* Десктопная навигация */}
              <nav className="hidden md:flex md:space-x-4">
                {filteredNavigation.map((item) => {
                  const isActive = pathname.endsWith(locale + item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        isActive
                          ? 'bg-[#D62E20] text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                        'flex items-center px-3 py-2 text-sm font-medium',
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Пользовательская навигация */}
              <div className="flex items-center justify-end space-x-4 text-white">
                <Menu as="div" className="relative mx-auto w-fit">
                  <MenuButton className="flex items-center justify-center gap-2 p-2 text-sm transition-colors duration-200">
                    <span className="sr-only">Open user menu</span>
                    <h3 className="hidden truncate text-base sm:block">
                      {user?.name && user.name.split(' ').length > 1
                        ? `${user.name.split(' ')[0]} ${user.name
                            .split(' ')
                            .slice(1)
                            .map((word) => `${word[0]}.`)
                            .join(' ')}`
                        : user?.name}
                    </h3>
                    <UserCircleIcon
                      className="h-6 w-6 text-white hover:text-rose-600"
                      aria-hidden="true"
                    />
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
                    <MenuItems className="ring-opacity-5 absolute right-0 z-10 mt-2 w-min origin-top-right bg-[#0F0F0F] py-1 shadow-lg">
                      {/* {userNavigation.map((item) => {
                        return (
                          <MenuItem key={item.name}>
                            {({}) => {
                              const isActive =
                                (pathname === `/${locale}` && item.href === '/') ||
                                pathname.endsWith(locale + item.href);
                              return (
                                <Link
                                  href={item.href}
                                  className={classNames(
                                    isActive ? 'bg-gray-100' : '',
                                    'flex items-center justify-start gap-2 px-4 py-2 text-sm text-gray-700 data-[active]:bg-blue-100',
                                  )}
                                >
                                  <item.icon
                                    className={classNames(
                                      isActive
                                        ? 'text-gray-300'
                                        : 'text-gray-400 group-hover:text-gray-300',
                                      'h-4 w-4 flex-shrink-0',
                                    )}
                                    aria-hidden="true"
                                  />
                                  {item.name}
                                </Link>
                              );
                            }}
                          </MenuItem>
                        );
                      })} */}
                      {/* <div className="mx-auto my-2 h-px w-[80%] bg-zinc-200"></div> */}
                      <MenuItem>
                        {({}) => (
                          <Button
                            className={classNames(
                              'flex w-full items-center justify-start gap-2 rounded-none px-4 py-2 text-sm text-gray-200 hover:bg-red-600',
                            )}
                            onClick={handleLogout}
                          >
                            <ArrowLeftStartOnRectangleIcon
                              className={classNames('h-4 w-4 flex-shrink-0')}
                              aria-hidden="true"
                            />
                            {t('signOut')}
                          </Button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Transition>
                </Menu>

                <LanguageSwitcher />
              </div>
            </div>
          </div>

          <main className="flex-1">
            <div className="mx-auto max-w-7xl p-4">
              <div className="min-h-[80vh] rounded-lg border-0 border-dashed border-gray-100 p-4">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
