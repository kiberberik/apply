import { useSingleApplication } from '@/store/useSingleApplication';
import { useTranslations } from 'next-intl';
import React from 'react';
import { ApplicationWithConsultant } from './application-form';
import dateUtils from '@/lib/dateUtils';

const Info = () => {
  const tApplicant = useTranslations('Applicant');
  const tRoles = useTranslations('Roles');
  const tApplications = useTranslations('Applications');
  const tContractSignType = useTranslations('ContractSignType');
  const { application } = useSingleApplication();
  const applicationWithConsultant = application as unknown as ApplicationWithConsultant;

  return (
    <div className="mt-6 w-full rounded-lg border bg-white p-4">
      <h2 className="mb-4 flex items-center justify-between text-xl font-bold">
        {tApplications('infoTitle')}
      </h2>

      {application?.submittedAt && (
        <p>
          {tApplicant('applicationSubmitted')}{' '}
          {dateUtils.formatDateForDisplay(application.submittedAt)}
        </p>
      )}
      {applicationWithConsultant.consultant && (
        <>
          {tRoles('CONSULTANT')}: {applicationWithConsultant.consultant.name} (
          {applicationWithConsultant.consultant.email})
        </>
      )}
      {application?.contractSignType && (
        <p>
          {tApplications('contractSignType')}: {tContractSignType(application.contractSignType)}
        </p>
      )}
    </div>
  );
};

export default Info;
