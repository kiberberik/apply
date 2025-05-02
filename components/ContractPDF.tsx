'use client';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';
import LogoRedSvg from './layout/LogoRedSvg';

const tw = createTw({
  theme: {
    extend: {
      colors: {
        red: '#D7262C',
        green: '#22C55E',
        gray: {
          500: '#6B7280',
        },
        yellow: {
          50: '#FEFCE8',
        },
      },
      spacing: {
        '2': '8px',
        '4': '16px',
        '8': '32px',
        '10': '40px',
        '26': '104px',
      },
      width: {
        '10': '40px',
        '60': '240px',
        '80': '320px',
        xs: '320px',
        md: '384px',
        '3xl': '768px',
        '5xl': '1024px',
      },
      height: {
        '6': '24px',
        '10': '40px',
      },
      borderRadius: {
        '2xl': '16px',
        full: '9999px',
      },
      fontSize: {
        sm: '12px',
        base: '14px',
        lg: '16px',
        xl: '18px',
        '2xl': '22px',
        '3xl': '24px',
      },
      lineHeight: {
        none: '1',
        relaxed: '1.4',
      },
    },
  },
});

interface Applicant {
  citizenship: string;
  surname: string;
  givennames: string;
  patronymic: string;
  identificationNumber: string;
  documentType: string;
  documentNumber: string;
  documentIssueDate: string;
  phone: string;
  email: string;
  addressResidential: string;
  addressRegistration: string;
}

interface Representative extends Applicant {
  documentType: string;
  documentNumber: string;
  documentIssueDate: string;
}

interface Application {
  contractNumber: string;
  applicant: Applicant;
  representative?: Representative;
  submittedAt: string;
}

interface ChapterItem {
  title?: string;
  content: string;
}

interface Chapter {
  title: string;
  items: {
    left: ChapterItem[];
    right: ChapterItem[];
  };
}

interface CurrentAccount {
  title: string;
  accountTitle: string;
  address: string;
  bin: string;
  iik: string;
  bik: string;
  bankName: string;
  additionalInfo: string;
}

interface ContractsData {
  paid_minor: {
    approvedTitle: string;
    contractTitle: string;
    accesstionTitle: string;
    chapters: Chapter[];
  };
  currentAccount: CurrentAccount;
  note: string;
  appendixes: {
    number_3: {
      approvedTitle: string;
      appendixTitle: string;
      title: string;
      paragraphs: string[];
    };
  };
}

interface ContractPDFProps {
  data: {
    application: Application;
    contractsData: ContractsData;
  };
}

const ContractPDF = ({ data }: ContractPDFProps) => {
  const { application, contractsData } = data;

  return (
    <Document pageMode="useThumbs">
      {/* First Page */}
      <Page size="A4" style={tw('p-8')}>
        {/* Header */}
        <View style={tw('flex flex-row justify-between mb-5')}>
          <View>
            <LogoRedSvg />
          </View>
          <View style={tw('max-w-xs text-right text-base')}>
            <Text>{contractsData.paid_minor.approvedTitle}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={tw('flex flex-col text-center mb-5 max-w-5xl mx-auto')}>
          <View>
            <Text style={tw('text-2xl font-extrabold')}>№ {application.contractNumber}</Text>
          </View>

          <View>
            <Text style={tw('text-2xl font-extrabold text-red')}>
              {contractsData.paid_minor.contractTitle}
            </Text>
          </View>
        </View>

        <View>
          <View style={tw('flex flex-col mx-auto max-w-5xl')}>
            {/* Applicant Info */}
            <View style={tw('flex flex-col w-full')}>
              <View style={tw('w-full flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>
                  Настоящим заявлением, я гражданин (-ка):
                </Text>
                <Text
                  style={tw('flex flex-col w-full border-b border-black font-bold text-green-500')}
                >
                  {application.applicant.citizenship}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Фамилия:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.surname}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Имя:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.givennames}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Отчество:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.patronymic}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>ИИН:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.identificationNumber}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>ИИН:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.identificationNumber}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Документ, удостоверяющий личность:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.documentType}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Номер документа:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.documentNumber}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Дата выдачи:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.documentIssueDate}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Выдан:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.documentIssueDate}
                </Text>
              </View>

              <View style={tw('flex flex-row gap-2')}>
                <Text style={tw('w-full flex flex-col')}>Дата выдачи:</Text>
                <Text style={tw('w-full text-green font-bold border-b border-black')}>
                  {application.applicant.documentIssueDate}
                </Text>
              </View>

              <Text>именуемый (-ая) в дальнейшем «Обучающийся»,</Text>
            </View>

            {/* Representative Info */}
            {application.representative && (
              <View style={tw('bg-yellow-50 mb-5 mt-4')}>
                <View style={tw('flex flex-row gap-2')}>
                  <Text style={tw('w-full flex flex-col')}>ФИО:</Text>
                  <Text style={tw('w-full text-green font-bold border-b border-black')}>
                    {application.representative.surname} {application.representative.givennames}{' '}
                    {application.representative.patronymic}
                  </Text>
                </View>

                <View style={tw('flex flex-row gap-2')}>
                  <Text style={tw('w-full flex flex-col')}>ИИН:</Text>
                  <Text style={tw('w-full text-green font-bold border-b border-black')}>
                    {application.representative.identificationNumber}
                  </Text>
                </View>

                <View style={tw('flex flex-row gap-2')}>
                  <Text style={tw('w-full flex flex-col')}>Дата выдачи:</Text>
                  <Text style={tw('w-full text-green font-bold border-b border-black')}>
                    {application.representative.documentIssueDate}
                  </Text>
                </View>

                <Text>
                  выступающий в качестве Представителя несовершеннолетнего, и действующий в
                  интересах несовершеннолетнего на основании
                </Text>

                <View style={tw('flex flex-row gap-4')}>
                  <View style={tw('flex flex-col w-1/3')}>
                    <Text
                      style={tw(
                        'flex flex-col w-full text-green text-base text-center font-bold border-b border-black',
                      )}
                    >
                      {application.representative.documentType}
                    </Text>
                    <Text style={tw('text-center text-sm')}>наименование документа</Text>
                  </View>
                  <View style={tw('flex flex-col  w-1/3')}>
                    <Text
                      style={tw(
                        'flex flex-col w-full text-green text-base text-center font-bold border-b border-black',
                      )}
                    >
                      № {application.representative.documentNumber}
                    </Text>
                    <Text style={tw('text-center text-sm')}>номер документа</Text>
                  </View>
                  <View style={tw('flex flex-col w-1/3')}>
                    <Text
                      style={tw(
                        'flex flex-col w-full text-green text-base text-center font-bold border-b border-black',
                      )}
                    >
                      {application.representative.documentIssueDate}
                    </Text>
                    <Text style={tw('text-center text-sm')}>дата выдачи</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
          {/* Accession Title */}
          <View style={tw('flex flex-col my-8')}>
            <Text style={tw('flex flex-col text-center font-extrabold leading-none')}>
              {contractsData.paid_minor.accesstionTitle}
            </Text>
          </View>
        </View>

        {/* Chapters */}
        {contractsData.paid_minor.chapters.map((chapter: Chapter, index: number) => (
          <View key={index} style={tw('flex flex-col mb-4 mt-4')}>
            <Text style={tw('flex flex-col text-center text-2xl font-extrabold text-[#D7262C]')}>
              {chapter.title}
            </Text>

            <View style={tw('flex gap-2')}>
              {/* Left Column */}
              <View style={tw('flex w-full flex-col gap-2')}>
                {chapter.items.left.map((item: ChapterItem, i: number) => (
                  <View key={i}>
                    {item.title ? (
                      <Text style={tw('text-bold text-red')}>
                        {item.title}
                        {'\n'}
                      </Text>
                    ) : (
                      <Text style={tw('text-red')}>
                        {i + 1}
                        {') '}
                      </Text>
                    )}
                    <Text>{item.content}</Text>
                  </View>
                ))}
              </View>

              {/* Right Column */}
              <View style={tw('flex w-full flex-col gap-2')}>
                {chapter.items.right.map((item: ChapterItem, i: number) => (
                  <View key={i}>
                    {item.title ? (
                      <Text style={tw('flex flex-col text-bold text-red')}>
                        {item.title}
                        {'\n'}
                      </Text>
                    ) : (
                      <Text style={tw('text-red')}>
                        {i + chapter.items.left.length + 1}
                        {') '}
                      </Text>
                    )}
                    <Text style={tw('')}>{item.content}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </Page>
      <Page>
        {/* Current Account */}
        <View style={tw('mb-4 mt-4')}>
          <Text style={tw('text-2xl font-bold text-red')}>
            {contractsData.currentAccount.title}
          </Text>
          <Text>{contractsData.currentAccount.accountTitle}</Text>
          <Text>{contractsData.currentAccount.address}</Text>
          <Text>{contractsData.currentAccount.bin}</Text>
          <Text>{contractsData.currentAccount.iik}</Text>
          <Text>{contractsData.currentAccount.bik}</Text>
          <Text>{contractsData.currentAccount.bankName}</Text>
          <Text>{contractsData.currentAccount.additionalInfo}</Text>
        </View>

        {/* Note */}
        <View style={tw('mb-4 mt-4')}>
          <Text style={tw('font-bold')}>{contractsData.note}</Text>
        </View>

        {/* Signatures */}
        <View style={tw('mb-8 mt-4')}>
          {/* Applicant Signature */}
          <View style={tw('flex flex-row gap-2')}>
            <View style={tw('w-1/2 p-1')}>
              <Text style={tw('border-1 border-full text-center font-extrabold text-red')}>
                Обучающийся
              </Text>
            </View>
            <View style={tw('w-1/2 p-1 flex flex-col items-end justify-end')}>
              <View style={tw('border-1 border-full w-80 h-10')} />
              <Text style={tw('text-sm text-gray-500 italic')}>(Подпись)</Text>
            </View>
          </View>

          {/* Representative Signature */}
          {application.representative && (
            <View style={tw('flex flex-row gap-2')}>
              <View style={tw('w-1/2 p-1')}>
                <Text style={tw('border-1 border-full text-center font-extrabold text-red')}>
                  Представитель
                </Text>
              </View>
              <View style={tw('w-1/2 p-1 flex flex-col items-end justify-end')}>
                <View style={tw('border-1 border-full w-80 h-10')} />
                <Text style={tw('text-sm text-gray-500 italic')}>(Подпись)</Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={tw('flex flex-row justify-between')}>
          <View>
            <Text>Создано и подписано: {application.submittedAt}</Text>
            <Text>Регистрационный номер {application.contractNumber}</Text>
          </View>
          <View style={tw('flex flex-col items-end justify-end')}>
            <View style={tw('border-1 border-full w-80 h-10')} />
            <Text style={tw('text-sm text-gray-500 italic')}>
              (Подпись лица, принявшего заявление)
            </Text>
          </View>
        </View>
      </Page>

      {/* Second Page */}
      <Page size="A4" style={tw('p-8')}>
        {/* ... existing second page content ... */}
      </Page>

      {/* Third Page */}
      <Page size="A4" style={tw('p-8')}>
        {/* Appendix 3 Header */}
        <View style={tw('flex flex-row items-start')}>
          <View>
            <Text>Логотип</Text>
          </View>
          <View style={tw('max-w-xs text-right text-base space-y-8')}>
            <Text>{contractsData.appendixes.number_3.approvedTitle}</Text>
            <Text style={tw('font-extrabold')}>
              {contractsData.appendixes.number_3.appendixTitle}
            </Text>
          </View>
        </View>

        {/* Appendix 3 Title */}
        <View style={tw('text-center max-w-3xl')}>
          <Text style={tw('text-2xl font-extrabold text-red')}>
            {contractsData.appendixes.number_3.title}
          </Text>
        </View>

        {/* Appendix 3 Content */}
        <View style={tw('mb-2 mt-2 indent-8 leading-relaxed')}>
          {contractsData.appendixes.number_3.paragraphs.map((paragraph, index) => (
            <Text key={index}>{paragraph}</Text>
          ))}
        </View>

        {/* Appendix 3 Signature */}
        <View style={tw('pt-26 flex flex-row justify-between')}>
          <Text>
            Субъект: {application.applicant.surname} {application.applicant.givennames}{' '}
            {application.applicant.patronymic}
          </Text>
          <View style={tw('flex flex-col items-end justify-end')}>
            <View style={tw('border-b border-black w-60 h-6')} />
            <Text style={tw('text-sm text-gray-500 italic')}>(Подпись)</Text>
          </View>
        </View>

        {/* Appendix 3 Signature Date */}
        <View style={tw('pt-10 flex flex-row justify-end')}>
          <View style={tw('flex flex-col items-end justify-end')}>
            <View style={tw('flex flex-row gap-2')}>
              <Text>Дата подписания: «</Text>
              <View style={tw('h-6 w-10 border-b border-black mx-0 px-0')} />
              <Text>» </Text>
              <View style={tw('h-6 w-60 border-b border-black')} />
              <Text> {new Date().getFullYear()} года</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={tw('flex flex-row justify-between')}>
          <View>
            <Text>Создано и подписано: {application.submittedAt}</Text>
            <Text>Регистрационный номер {application.contractNumber}</Text>
          </View>
          <View style={tw('flex flex-col items-end justify-end')}>
            <View style={tw('border-b border-black w-80 h-6')} />
            <Text style={tw('text-sm text-gray-500 italic')}>
              (Подпись лица, принявшего заявление)
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ContractPDF;
