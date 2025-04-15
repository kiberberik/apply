'use client';
import { Suspense, useEffect, use } from 'react';
import { ApplicationForm } from '../../../../../components/applicationForm/application-form';
import { useSingleApplication } from '@/store/useSingleApplication';

interface ApplicationPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default function ApplicationPage({ params }: ApplicationPageProps) {
  const { id } = use(params);
  const { fetchApplication, application, isLoading, error } = useSingleApplication();

  useEffect(() => {
    fetchApplication(id);
  }, [id, fetchApplication]);

  if (isLoading) {
    return <div className="container mx-auto py-10">Загрузка...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-red-500">Ошибка: {error}</div>;
  }

  if (!application) {
    return <div className="container mx-auto py-10">Заявка не найдена</div>;
  }

  const lastLog = application.Log?.[0];

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Редактирование заявки</h2>
      </div>
      <div className="mt-8">
        <div className="mb-8 rounded-lg bg-white p-4 shadow">
          <h3 className="mb-4 text-xl font-semibold">Текущие данные заявки</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Заявитель</h4>
              <p>
                <span className="text-gray-600">Имя:</span> {application.applicant?.firstname}
              </p>
              <p>
                <span className="text-gray-600">Фамилия:</span> {application.applicant?.lastname}
              </p>
              <p>
                <span className="text-gray-600">Отчество:</span> {application.applicant?.middlename}
              </p>
              <p>
                <span className="text-gray-600">Дата рождения:</span>{' '}
                {application.applicant?.birthDate
                  ? new Date(application.applicant.birthDate).toLocaleDateString()
                  : '-'}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Представитель</h4>
              {application.representative ? (
                <>
                  <p>
                    <span className="text-gray-600">Имя:</span>{' '}
                    {application.representative.firstname}
                  </p>
                  <p>
                    <span className="text-gray-600">Фамилия:</span>{' '}
                    {application.representative.lastname}
                  </p>
                  <p>
                    <span className="text-gray-600">Отчество:</span>{' '}
                    {application.representative.middlename}
                  </p>
                  <p>
                    <span className="text-gray-600">Степень родства:</span>{' '}
                    {application.representative.relationshipDegree}
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
                {application.details?.studyingLanguage}
              </p>
              <p>
                <span className="text-gray-600">Тип обучения:</span> {application.details?.type}
              </p>
              <p>
                <span className="text-gray-600">Уровень образования:</span>{' '}
                {application.details?.academicLevel}
              </p>
              <p>
                <span className="text-gray-600">Специальность:</span>{' '}
                {application.details?.educationalProgramId}
              </p>
              <p>
                <span className="text-gray-600">Язык договора:</span>{' '}
                {application?.contractLanguage}
              </p>
              <p>
                <span className="text-gray-600">Договор подписан онлайн:</span>{' '}
                {application?.isContractSignedOnline ? 'Да' : 'Нет'}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Статус заявки</h4>
              <p>
                <span className="text-gray-600">Статус:</span> {lastLog?.status || '-'}
              </p>
              {lastLog && (
                <>
                  <p>
                    <span className="text-gray-600">Описание:</span> {lastLog.description || '-'}
                  </p>
                  <p>
                    <span className="text-gray-600">Дата обновления:</span>{' '}
                    {new Date(lastLog.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-gray-600">Кем создано:</span>{' '}
                    {lastLog?.createdById || '-'}
                  </p>
                </>
              )}
            </div>
            <div>
              <h4 className="mb-2 font-medium">Другие данные:</h4>
              <p>
                <span className="text-gray-600">Дата создания:</span>{' '}
                {new Date(application.createdAt).toLocaleDateString()}
              </p>
              <p>
                <span className="text-gray-600">Дата обновления:</span>{' '}
                {new Date(application.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <Suspense fallback={'Загрузка...'}>
          <ApplicationForm id={id} />
        </Suspense>
      </div>
    </div>
  );
}
