'use client';
import { Suspense, useEffect, use } from 'react';
import { useSingleApplication } from '@/store/useSingleApplication';
import ApplicationForm from '@/components/applicationForm/application-form';
import Warning from '@/components/applicationForm/Warning';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations } from 'next-intl';

interface ApplicationPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();
  const c = useTranslations('Common');
  console.log('user', user);

  const { fetchApplication, application, isLoading, error } = useSingleApplication();

  useEffect(() => {
    console.log('Fetching application with ID:', id);
    fetchApplication(id);
  }, [id, fetchApplication]);

  if (isLoading) {
    return <div className="container mx-auto py-10">{c('loading')}</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-red-500">
        {c('error')}: {error}
      </div>
    );
  }

  if (!application) {
    return <div className="container mx-auto py-10">{c('notFound')}</div>;
  }

  // Проверка прав доступа
  const hasAccess =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    (user?.createdApplications && user.createdApplications.some((app) => app.id === id)) ||
    (user?.consultedApplications && user.consultedApplications.some((app) => app.id === id)) ||
    // Проверяем createdById в текущей заявке, если она доступна
    (application?.createdById && application.createdById === user?.id);

  if (!hasAccess) {
    return <div className="container mx-auto py-10 text-red-500">{c('noAccess')}</div>;
  }

  // const lastLog = application.Log?.[0];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{c('edit')}</h2>
      </div>
      <Warning />
      <div className="mt-8">
        {/* <div className="mb-8 rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-xl font-semibold">Текущие данные заявки</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Заявитель</h4>
              <p>
                <span className="text-gray-600">Имя:</span>{' '}
                {application.applicant?.givennames || '-'}
              </p>
              <p>
                <span className="text-gray-600">Фамилия:</span>{' '}
                {application.applicant?.surname || '-'}
              </p>
              <p>
                <span className="text-gray-600">Отчество:</span>{' '}
                {application.applicant?.patronymic || '-'}
              </p>
              <p>
                <span className="text-gray-600">Дата рождения:</span>{' '}
                {application.applicant?.birthDate
                  ? new Date(application.applicant.birthDate).toLocaleDateString()
                  : '-'}
              </p>
              <p>
                <span className="text-gray-600">Место рождения:</span>{' '}
                {application.applicant?.birthPlace || '-'}
              </p>
              <p>
                <span className="text-gray-600">Гражданство:</span>{' '}
                {application.applicant?.citizenship || '-'}
              </p>
              <p>
                <span className="text-gray-600">ИИН:</span>{' '}
                {application.applicant?.identificationNumber || '-'}
              </p>
              <p>
                <span className="text-gray-600">Тип документа:</span>{' '}
                {application.applicant?.documentType || '-'}
              </p>
              <p>
                <span className="text-gray-600">Email:</span> {application.applicant?.email || '-'}
              </p>
              <p>
                <span className="text-gray-600">Телефон:</span>{' '}
                {application.applicant?.phone || '-'}
              </p>
              <p>
                <span className="text-gray-600">Адрес проживания:</span>{' '}
                {application.applicant?.addressResidential || '-'}
              </p>
              <p>
                <span className="text-gray-600">Адрес регистрации:</span>{' '}
                {application.applicant?.addressRegistration || '-'}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Представитель</h4>
              {application.representative ? (
                <>
                  <p>
                    <span className="text-gray-600">Имя:</span>{' '}
                    {application.representative.givennames || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Фамилия:</span>{' '}
                    {application.representative.surname || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Отчество:</span>{' '}
                    {application.representative.patronymic || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Степень родства:</span>{' '}
                    {application.representative.relationshipDegree || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Гражданство:</span>{' '}
                    {application.representative.citizenship || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">ИИН:</span>{' '}
                    {application.representative.identificationNumber || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Тип документа:</span>{' '}
                    {application.representative.documentType || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{' '}
                    {application.representative.email || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Телефон:</span>{' '}
                    {application.representative.phone || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Адрес проживания:</span>{' '}
                    {application.representative.addressResidential || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Адрес регистрации:</span>{' '}
                    {application.representative.addressRegistration || '-'}
                  </p>
                </>
              ) : (
                <p className="text-gray-500">Представитель не указан</p>
              )}
            </div>
            <div>
              <h4 className="mb-2 font-medium">Детали заявки</h4>
              <p>
                <span className="text-gray-600">Необходимость общежития:</span>{' '}
                {application.details?.isDormNeeds ? 'Да' : 'Нет'}
              </p>
              <p>
                <span className="text-gray-600">Язык обучения:</span>{' '}
                {application.details?.studyingLanguage || '-'}
              </p>
              <p>
                <span className="text-gray-600">Тип обучения:</span>{' '}
                {application.details?.type || '-'}
              </p>
              <p>
                <span className="text-gray-600">Уровень образования:</span>{' '}
                {application.details?.academicLevel || '-'}
              </p>
              <p>
                <span className="text-gray-600">Образовательная программа:</span>{' '}
                {application.details?.educationalProgram?.name_rus || '-'}
              </p>
              <p>
                <span className="text-gray-600">Код программы:</span>{' '}
                {application.details?.educationalProgram?.code || '-'}
              </p>
              <p>
                <span className="text-gray-600">Длительность обучения:</span>{' '}
                {application.details?.educationalProgram?.duration
                  ? `${application.details.educationalProgram.duration}`
                  : '-'}
              </p>
              <p>
                <span className="text-gray-600">Стоимость за кредит:</span>{' '}
                {application.details?.educationalProgram?.costPerCredit || '-'}
              </p>
              <p>
                <span className="text-gray-600">Язык договора:</span>{' '}
                {application?.contractLanguage || '-'}
              </p>
              <p>
                <span className="text-gray-600">Тип подписания договора:</span>{' '}
                {application?.contractSignType || '-'}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Статус заявки</h4>
              {lastLog && (
                <>
                  <p>
                    <span className="text-gray-600">Статус:</span> {lastLog?.statusId || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Описание:</span> {lastLog.description || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Дата обновления:</span>{' '}
                    {new Date(lastLog.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-gray-600">Создано:</span>{' '}
                    {lastLog?.createdBy
                      ? `${lastLog.createdBy.name} (${lastLog.createdBy.email})`
                      : '-'}
                  </p>
                </>
              )}
            </div>
            <div>
              <h4 className="mb-2 font-medium">Документы</h4>
              {application.documents && application.documents.length > 0 ? (
                application.documents.map((doc) => (
                  <p key={doc.id}>
                    <span className="text-gray-600">{doc.type}:</span> {doc.name || doc.link || '-'}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">Документы не загружены</p>
              )}
            </div>
            <div>
              <h4 className="mb-2 font-medium">Другие данные</h4>
              <p>
                <span className="text-gray-600">Дата создания:</span>{' '}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-600">Дата обновления:</span>{' '}
                {new Date(application.updatedAt).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-600">Заявка создана пользователем:</span>{' '}
                {application.createdBy?.name || '-'}
              </p>
              <p>
                <span className="text-gray-600">Email создателя:</span>{' '}
                {application.createdBy?.email || '-'}
              </p>
              <p>
                <span className="text-gray-600">Роль создателя:</span>{' '}
                {application.createdBy?.role || '-'}
              </p>
            </div>
          </div>
        </div> */}
        <Suspense fallback={'Загрузка...'}>
          <ApplicationForm id={id} />
        </Suspense>
      </div>
    </div>
  );
}
