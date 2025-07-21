import { useTranslations } from 'next-intl';
import React from 'react';
import { ApplicationWithConsultant } from './application-form';
import dateUtils from '@/lib/dateUtils';
import { useApplicationStore } from '@/store/useApplicationStore';

const Info = () => {
  const tApplicant = useTranslations('Applicant');
  const tRoles = useTranslations('Roles');
  const tApplications = useTranslations('Applications');
  const tContractSignType = useTranslations('ContractSignType');
  const { singleApplication } = useApplicationStore();

  const applicationWithConsultant = singleApplication as unknown as ApplicationWithConsultant;

  return (
    <div className="mt-6 w-full rounded-lg border bg-white p-4">
      <h2 className="mb-4 flex items-center justify-between text-xl font-bold">
        {tApplications('infoTitle')}
      </h2>

      <p>
        {tApplicant('applicationCreatedAt')}
        {': '}
        {singleApplication?.createdAt
          ? dateUtils.formatDateForDisplay(singleApplication.createdAt)
          : ''}
      </p>

      <p>
        {tApplicant('applicationSubmitted')}
        {': '}
        {singleApplication?.submittedAt
          ? dateUtils.formatDateForDisplay(singleApplication.submittedAt)
          : tApplications('notSubmitted')}
      </p>

      <p>
        {tRoles('CONSULTANT')}:{' '}
        {applicationWithConsultant.consultant
          ? `${applicationWithConsultant.consultant.name} (${applicationWithConsultant.consultant.email})`
          : tApplications('noConsultant')}
      </p>

      {singleApplication?.contractSignType && (
        <p>
          {tApplications('contractSignType')}:{' '}
          {tContractSignType(singleApplication.contractSignType)}
        </p>
      )}

      {singleApplication?.contractNumber && (
        <p className="text-xl font-bold">{singleApplication.contractNumber}</p>
      )}
    </div>
  );
};

export default Info;
