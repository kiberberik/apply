'use client';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from './ui/button';

const ProfileUser = () => {
  const locale = useLocale();
  const {
    user,
    isAuthenticated,
    isEmailVerified,
    emailVerificationError,
    resendVerificationEmail,
    fetchUser,
  } = useAuthStore();
  const t = useTranslations('Profile');

  const handleResendVerification = () => {
    if (user?.email) {
      resendVerificationEmail(user.email, locale);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isEmailVerified) {
      console.log('User is authenticated but email is not verified');
    }
  }, [isAuthenticated, isEmailVerified]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">
        {t('greeting')}, {user?.name} <span className="italic">({user?.email})</span>
      </h1>

      {isEmailVerified ? (
        <div>
          {/* {JSON.stringify(user?.createdApplications)} */}
          {(user?.createdApplications || []).length < 1 ? (
            <div>
              <Button>Создать заявку</Button>
            </div>
          ) : (
            <div>
              {user?.createdApplications?.map((application) => {
                return <div key={application.id}>{application.id}</div>;
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>Ваш email не подтвержден. Пожалуйста, подтвердите его.</p>
          {emailVerificationError && <p className="error">{emailVerificationError}</p>}
          <button onClick={handleResendVerification}>Повторно отправить email подтверждения</button>
        </div>
      )}
    </div>
  );
};

export default ProfileUser;
