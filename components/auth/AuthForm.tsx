'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Bounce, toast } from 'react-toastify';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/useAuthStore'; // Импорт стора
import LanguageSwitcher from '../layout/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';

type FormMode = 'login' | 'register' | 'recovery' | 'successRecovery';

function AuthFormComponent() {
  const router = useRouter();
  const t = useTranslations('auth');
  const locale = useLocale();
  const { user } = useAuthStore();

  const [mode, setMode] = useState<FormMode>('login');
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isClient, setIsClient] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (mode === 'login' && user && isClient) {
      router.push('/');
    }
  }, [user, router, mode, isClient]);

  const resetForm = () => {
    setFullname('');
    setEmail('');
    setPassword('');
    setStatus('idle');
  };

  const handleModeSwitch = (newMode: FormMode) => {
    setMode(newMode);
    resetForm();
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');

    const data = mode === 'recovery' ? { email, locale } : { fullname, email, password, locale };

    let endpoint = '';
    let redirectPath = '';

    switch (mode) {
      case 'login':
        endpoint = '/api/login';
        redirectPath = '/';
        break;
      case 'register':
        endpoint = '/api/register';
        redirectPath = '/auth';
        break;
      case 'recovery':
        endpoint = '/api/password-reset';
        break;
      default:
        return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const response = await res.json();

      if (!res.ok) {
        throw new Error(response.error || t('genericError'));
      }

      if (mode === 'recovery') {
        toast.success(t('recoveryEmailSent'), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        });
        setMode('successRecovery'); // переключаем в новый режим
      } else if (mode === 'login') {
        const { setUser } = useAuthStore.getState();
        setUser(response.user);
        toast.success(t('loginSuccess'), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        });
        const unsubscribe = useAuthStore.subscribe((state) => {
          if (state.user) {
            unsubscribe(); // Отписываемся, чтобы не вызывать лишние редиректы
            // setTimeout(() => {
            //   router.push(redirectPath);
            // }, 500);
          }
        });
      } else if (mode === 'register') {
        toast.success(t('registerSuccess'), {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: 'light',
          transition: Bounce,
        });
        router.push(redirectPath);
        setMode('login');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('genericError'), {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        transition: Bounce,
      });
      setStatus('error');
    } finally {
      if (mode !== 'recovery') setStatus('idle');
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-0">
      {isClient && (
        <>
          <div className="mx-auto my-auto grid h-full min-h-screen w-full grid-cols-1 gap-8 py-10 md:grid-cols-2 md:p-10">
            <div className="absolute top-2 right-0 md:top-8 md:right-8">
              <LanguageSwitcher />
            </div>
            <div className="relative hidden w-full items-center justify-center md:flex">
              <Image
                src="/images/welcome_bg.png"
                alt="Welcome"
                fill
                className="rounded-xl object-cover"
                priority
              />
            </div>
            <div className="mx-auto my-auto h-full w-[80%] max-w-3xl rounded-lg bg-white p-2">
              <div className="mb-4 flex items-center justify-center md:mb-8">
                <Link href="https://mnu.kz" target="_blank">
                  <Image src="/images/mnu_logo_black.svg" alt="MNU Logo" width={100} height={100} />
                </Link>
              </div>
              <h1 className="mx-auto mb-2 max-w-sm text-center text-lg font-bold md:mb-8 md:text-2xl">
                {mode == 'login' ? (
                  <>
                    <br />
                    {t('greeting')}
                    <br />
                  </>
                ) : mode == 'register' ? (
                  <>{t('become')}</>
                ) : (
                  ''
                )}
              </h1>

              {/* Tabs only visible if not in successRecovery */}
              {mode !== 'successRecovery' && (
                <div className="mb-4 grid grid-cols-2 flex-wrap justify-around text-sm md:mb-8">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className={`w-full px-1 py-2 ${
                      mode === 'login'
                        ? 'border-b-1 border-zinc-600 font-semibold text-zinc-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {t('signIn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className={`w-full px-1 py-2 ${
                      mode === 'register'
                        ? 'border-b-1 border-zinc-600 font-semibold text-zinc-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {t('signUp')}
                  </button>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {mode === 'successRecovery' ? (
                <div className="py-10 text-center">
                  <h2 className="mb-4 text-lg font-semibold">{t('recoveryEmailSent')}</h2>
                  <p className="text-gray-600">
                    {t('checkYourEmail')} - {email}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'recovery' ? (
                    <h2 className="mb-4 text-base font-semibold">{t('recoveryEmailTitle')}</h2>
                  ) : null}

                  {mode === 'register' && (
                    <div>
                      <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">
                        {t('name')}
                      </label>
                      <input
                        type="text"
                        id="fullname"
                        autoComplete="fullname"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                        required
                        minLength={1}
                        maxLength={63}
                        disabled={status === 'loading'}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none disabled:bg-gray-100"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      {t('email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === 'loading'}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none disabled:bg-gray-100"
                    />
                  </div>

                  {mode !== 'recovery' && (
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {t('password')}
                      </label>
                      <input
                        type="password"
                        id="password"
                        autoComplete="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        disabled={status === 'loading'}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 focus:outline-none disabled:bg-gray-100"
                      />
                    </div>
                  )}

                  {/* Forgot Password Link */}
                  {mode === 'login' && (
                    <div className="mt-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleModeSwitch('recovery');
                        }}
                        className="text-sm text-[#1E4AE9] hover:underline"
                      >
                        {t('forgotPassword')}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex w-full justify-center rounded-md border border-transparent bg-[#162D3A] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:outline-none disabled:bg-zinc-300"
                  >
                    {status === 'loading'
                      ? t('loading')
                      : mode === 'login'
                        ? t('signIn')
                        : mode === 'register'
                          ? t('signUp')
                          : t('sendRecoveryEmail')}
                  </button>
                </form>
              )}

              {mode !== 'register' && (
                <div className="mt-6 text-center text-sm md:mt-8">
                  {t('noAccount')}{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleModeSwitch('register');
                    }}
                    className="text-[#1E4AE9] hover:underline"
                  >
                    {t('signUp')}
                  </button>
                </div>
              )}

              <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 md:mt-16 lg:px-8">
                <p className="text-center text-sm text-[#959CB6] md:text-base">
                  2025 {year > 2025 ? `- ${year}` : ''} ©
                  <Link href={'mailto:dwts@mnu.kz'} target="_blank">
                    {' '}
                    DWTS MNU{' '}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const AuthForm = dynamic(() => Promise.resolve(AuthFormComponent), {
  ssr: false,
});

export default AuthForm;
