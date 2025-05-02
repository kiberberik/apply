'use client';

import LogoRedSvg from '@/components/layout/LogoRedSvg';
import ContractPDF from '../../../../../components/ContractPDF';

const ContractPage = () => {
  const website = 'www.mnu.kz';
  const testApplicationData = {
    application: {
      contractNumber: '1234567890',
      applicant: {
        citizenship: 'Казахстан',
        surname: 'Тестов',
        givennames: 'Тест',
        patronymic: 'Тестович',
        identificationNumber: '1234567890',
        documentType: 'Паспорт',
        documentNumber: '1234567890',
        documentIssueDate: '2024-01-01',
        phone: '1234567890',
        email: 'test@test.com',
        addressResidential: 'ул. Тестовая, 1',
        addressRegistration: 'ул. Тестовая, 1',
      },
      representative: {
        citizenship: 'Казахстан',
        surname: 'Бестова',
        givennames: 'Беста',
        patronymic: 'Бестовна',
        identificationNumber: '1234567890',
        documentType: 'Удостоверение личности',
        documentNumber: '1234567890',
        documentIssueDate: '2024-01-01',
        phone: '1234567890',
        email: 'test@test.com',
        addressResidential: 'ул. Тестовая, 1',
        addressRegistration: 'ул. Тестовая, 1',
      },
      details: {
        academicLevel: 'Очная форма обучения',
        program: {
          group: 'Группа образовательных программ',
          code: '1234567890',
          name: 'Образовательная программа',
          costPerCredit: '100000',
        },
        studyingLanguage: 'Русский',
      },
      submittedAt: '2024-01-01',
    },
  };
  const contractsData = {
    paid_minor: {
      contractType: 'PAID_MINOR',
      approvedTitle: `Утверждено решением Правления
Протокол Исполнительного
органа-Правления № 13 от 20.05.2024 г.`,
      contractTitle: `Заявление о присоединении
к типовой форме договора возмездного оказания образовательных услуг
(очная форма обучения)`,
      accesstionTitle: `ПРИСОЕДИНЯЮТСЯ К ТИПОВОЙ ФОРМЕ ДОГОВОРА ВОЗМЕЗДНОГО ОКАЗАНИЯ ОБРАЗОВАТЕЛЬНЫХ УСЛУГ (ОЧНАЯ ФОРМА
ОБУЧЕНИЯ), ДАЛЕЕ ПО ТЕКСТУ – ДОГОВОР, С АО «УНИВЕРСИТЕТ КАЗГЮУ ИМЕНИ М.С. НАРИКБАЕВА» (ДАЛЕЕ – УНИВЕРСИТЕТ)
И ПОЛНОСТЬЮ ПРИНИМАЮТ НА СЕБЯ ВСЕ ПРАВА И ОБЯЗАННОСТИ ПРЕДСТАВИТЕЛЯ и ОБУЧАЮЩЕГОСЯ.`,
      chapters: [
        {
          title: `I. Подписанием настоящего «Заявления о присоединении», Представитель
и Обучающийся подтверждают, что:`,
          items: {
            left: [
              {
                title: ``,
                content: `В полной мере ознакомлены и принимают условия
Договора, размещенного на WEB-сайте Университета в
сети Интернет по адресу: ${website} и в соответствии
с Гражданским кодексом Республики Казахстан дают
свое безотзывное согласие на присоединение к нему;`,
              },
              {
                title: ``,
                content: `При соблюдении нормативных актов Республики
Казахстан, внутренних документов и процедур Универси-
тета, дает свое безусловное и безотзывное согласие на
зачисление в состав Обучающихся Университета по
очной форме обучения: ${testApplicationData.application.details.academicLevel}
по группе образовательных программ: ${testApplicationData.application.details.program.group}
по образовательной программе: ${testApplicationData.application.details.program.code} ${testApplicationData.application.details.program.name}
нормативный срок обучения составляет:
{@gop.op.period}
академических года, при условии своевременной
регистрации и освоения установленного внутренними
нормативными документами Университета количества
кредитов.
Максимальный срок обучения по отдельной группе
образовательных программ, соответствующего уровня
образования определяется внутренними нормативными
документами Университета.`,
              },
              {
                title: ``,
                content: `При подписании настоящего Заявления о присоедине-
нии, обучающийся обязуется осуществить оплату
разового единовременного взноса, в соответствии с
условиями Договора размещенного на WEB-сайте
Университета, Правилами оплаты образовательных услуг
Университета и в размере, утвержденном Реестром
стоимости услуг Университета на соответствующий год
поступления.
Настоящее «Заявление о присоединении» является
неотъемлемой частью Договора.

стоимость 1 (один) академического кредита составляет:
${testApplicationData.application.details.program.costPerCredit}
язык обучения:
тенге
${testApplicationData.application.details.studyingLanguage}`,
              },
            ],
            right: [
              {
                title: ``,
                content: `Ознакомлены и в полной мере принимают условия
внутренних нормативных документов Университета, в
том числе, но не ограничиваясь, Уставом Университета,
Академической политикой, политикой приема в Универ-
ситет, правилами оплаты и Реестром стоимости услуг
Университета на 2024-2025 учебный год, размещёнными
на WEB-сайте Университета в сети Интернет;`,
              },
              {
                title: ``,
                content: `Надлежащим образом уведомлены, что оплата услуг
Университета состоит из разового единовременного
взноса и оплаты образовательных услуг.
*Примечание: оплата за обучение определяется исходя
из произведения стоимости 1 (Одного) академического
кредита к количеству выбранных Обучающимся кредитов
на соответствующий академический период.`,
              },
              {
                title: ``,
                content: `В полном объёме соглашаются, что стоимость 1-го
кредита может быть изменена в сторону увеличения, в
пределах уровня инфляции, но не более чем 1 раз год;`,
              },
              {
                title: ``,
                content: `Вся информация, указанная в «Заявлении о присоедине-
нии», является достоверной и предоставлена в добро-
вольном порядке и по собственной инициативе.`,
              },
              {
                title: ``,
                content: `Подписывая настоящее «Заявление о присоединении» и
Приложение № 3 к Договору, Обучающийся и его
Представитель, дают свое безусловное и безотзывное
согласие на сбор, обработку, хранение, использование,
передачу (распространение, предоставление, доступ –
государственным органам РК и организациям, через
электронные информационные системы) и уничтожение
(«Обработка») биометрических данных, а также Персональных данных, относящейся прямо или косвенно к
Обучающемуся, его законному Представителю, которая
становится доступна в рамках настоящего Договора
и/или при оказании Университетом образовательных и
иных услуг.`,
              },
            ],
          },
        },
        {
          title: `II. Внесение изменений и дополнений в Договор и Реестр стоимости услуг Университета на 2024-2025
учебный год, осуществляется на условиях, определенных в Договоре и подлежит обязательному
опубликованию на WEB-сайте Университета в сети Интернет;`,
          items: {
            left: [
              {
                title: `III) Дополнительная информация:`,
                content: `Фамилия, имя, отчество родителей или лиц, их
заменяющих, для контакта только в экстренных случаях:
Ф.И.О:
{@fullnameparents}
Номер телефона:
{@telephonparents}
В общежитии:
{@obshejitie}`,
              },
              {
                title: `IV)
Договор вступает в силу с момента подписания
настоящего Заявления, при следующих условиях:`,
                content: `1) внесения Обучающимся или его Представителем на
расчетный счет Университета:
- не позднее 10 (Десяти) банковских дней с даты подписа-
ния настоящего Заявления о присоединении разового
единовременного взноса;
*Примечание: размер разового единовременного взноса
устанавливается в Реестре стоимости образовательных
услуг, утвержденном Исполнительным органом –
Правлением, на соответствующий год поступления и
Правилами оплаты образовательных и иных услуг
Университета;
2) предоставления в приемную комиссию Университета,
полного перечня документов, определенных Политикой
приема в Университет.`,
              },
            ],
            right: [
              {
                title: `V) Договор может быть расторгнут`,
                content: `Обучающимся путем:
- подачи заявления (в письменной форме) об отчисле-
нии, при соблюдении условий, предусмотренных
Договором возмездного оказания образовательных
услуг;
- издания соответствующего приказа об отчислении.
Примечание: обязательства по оплате образователь-
ных (за соответствующий академический период, в
соответствии с регистрацией, проведенной Обучаю-
щимся) и иных услуг Университета сохраняются, до
полного их исполнения Обучающимся и/или его
законным Представителем.
При расторжении Договора на возмездное оказание
услуг, до включения абитуриента в приказ о зачисле-
нии в состав Обучающихся, часть разового единовре-
менного взноса подлежит возврату, в порядке и на
условиях, определенном Договором на возмездное
оказание услуг и Правилами оплаты образовательных и
иных услуг
Стороны пришли к соглашению, что при наступлении
обстоятельств, указанных в настоящем разделе
Заявления о присоединении, заключения «Соглашения
о расторжении Договора» не требуется.`,
              },
            ],
          },
        },
      ],
    },
    currentAccount: {
      title: `Расчетный счет`,
      accountTitle: `АО «Университет КАЗГЮУ имени М.С. Нарикбаева»`,
      address: `010000 г. Астана, Район «Нура», шоссе Корғалжын, 8`,
      bin: 'БИН: 020140001689',
      iik: 'ИИК: KZ566018821000657861',
      bik: 'БИК: HSBKKZKX',
      bankName: 'в АО «Народный Банк Казахстана»',
      additionalInfo: 'КБЕ 17, КНП 861',
    },
    note: `*Примечание: в случае предоставления недостоверного и/или неполного пакета документации, предусмотрен-
ного нормативными актами Республики Казахстан и внутренними нормативными документами Университета,
настоящее Заявление о присоединении считается аннулированным, в одностороннем, внесудебном порядке,
независимо от способа его подписания.`,
    appendixes: {
      number_3: {
        approvedTitle: `Утверждено решением Правления Протокол Исполнительного органа-Правления № 13 от 20.05.2024 г.`,
        appendixTitle: `Приложение № 3 к договору № ${testApplicationData.application.contractNumber} возмездного оказания образовательных услуг (очная форма обучения) от ${testApplicationData.application.submittedAt}`,
        title: 'СОГЛАСИЕ НА СБОР И ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ',
        paragraphs: [
          `Я, гражданин ${testApplicationData.application.applicant.surname} ${testApplicationData.application.applicant.givennames} ${testApplicationData.application.applicant.patronymic}`,
          `являющийся (- ая) субъектом персональных данных (далее – субъект), ИИН ${testApplicationData.application.applicant.identificationNumber}`,
          `${testApplicationData.application.applicant.documentType} № ${testApplicationData.application.applicant.documentNumber}, выданное (- ное) ${testApplicationData.application.applicant.documentIssueDate}`,
          `зарегистрированный (- ая) по адресу ${testApplicationData.application.applicant.addressRegistration}`,
          `, в соответствии со статьей 8 ЗРК «О персональных данных и их защите» даю свое безусловное и безотзывное согласие на
сбор, обработку, хранение, использование, передачу (распространение, предоставление, доступ государственным органам
РК и организациям к «Персональным данным» через электронные информационные системы Университета,) и уничтоже-
ние («Обработка») Персональных, а также биометрических данных, относящихся прямо или косвенно ко мне, которые
становятся доступны в рамках настоящего Договора и/или при оказании Университетом образовательных и иных услуг,
включая, но не ограничиваясь:`,
          `Министерству науки и образования РК через информационные системы и электронные базы данных Университе-
та, предназначенные для автоматизированного сбора, хранения и обработки информации о контингенте обучающихся и их
законных представителях.`,
          `Министерство обороны РК через информационные системы и электронные базы данных Университета, предна-
значенные для автоматизированного сбора, хранения и обработки информации о контингенте обучающихся призывного
возраста.`,
          `НПП «Атамекен» и независимым агентствам по обеспечению качества в образовании, через информационные системы и
электронные базы данных Университета, предназначенные для автоматизированного сбора, хранения и обработки
информации о контингенте обучающихся, в целях формирования рейтинга образовательных программ ВУЗов РК.`,
          `Министерству труда и социальной защиты населения РК (МТСЗН РК), являющемуся собственником базы данных
участников накопительной пенсионной системы, системы обязательного социального страхования, системы обязательного
социального медицинского страхования и единой информационной системы в социально-трудовой сфере,`,
          `Министерству юстиции РК (МЮ РК), являющемуся собственником государственной базы данных «Физические
лица» (ГБД ФЛ), предназначенной для автоматизированного сбора, хранения и обработки информации, создания Нацио-
нального реестра индивидуальных идентификационных номеров с целью внедрения единой идентификации физических
лиц в РК,`,
          `Министерству цифрового развития, инноваций и аэрокосмической промышленности РК (МЦРИАП РК), являюще-
муся собственником сервиса «База мобильных граждан» (БМГ) - базы мобильных данных граждан «электронного прави-
тельства» РК.`,
          `на передачу персональных данных субъекта третьему лицу - оператору уполномоченного органа в области
образования акционерному обществу «Финансовый центр» (БИН 050740000618) для сбора и обработки полученных
персональных данных с целью обеспечения мониторинга и контроля за соблюдением лицами, указанными в пункте 17
статьи 47 ЗРК «Об образовании», своих обязанностей по отработке или возмещению расходов бюджетных средств в случае
не отработки.`,
          `Перечень собираемых данных, связанных с субъектом, на передачу, сбор и обработку которых дается согласие
субъектом`,
          `МТСЗН РК: сведения об обязательных пенсионных взносах, обязательных социальных отчислениях, отчислениях и
взносах в фонд социального медицинского страхования, и информация о наличии трудовых договоров, заключенных с
работодателями;`,
          `МЮ РК:`,
          `группа 1. Основные сведения: ИИН, Ф.И.О., дата рождения, пол, дата смерти, гражданство, национальность, место
рождени я, место регистрации, жизненный статус физического лица, сведения о документах, удостоверяющих личность;`,
          `группа 2. Сведения об исключении, условно исключении ИИН;`,
          `группа 3. Сведения о свидетельствах, о рождении и смерти;`,
          `группа 4. Сведения о дееспособности;`,
          `группа 5. Сведения о пропавшем без вести;`,
          `группа 6. Сведения о скрывающимся от дознания, следствия, суда и отбытия наказания.`,
          `МЦРИАП РК: мобильный номер телефона, зарегистрированный в БМГ.`,
          `Период, в течение которого действует согласие на сбор, обработку и передачу персональных данных – на весь
период обучения, а также на срок, установленный «Перечнем типовых документов, образующихся в деятельности государ-
ственных и негосударственных организаций, с указанием срока хранения», утвержденного приказом и.о. Министра
культуры и спорта РК от 29 сентября 2017 года № 263.`,
          `Субъект не дает согласия на трансграничную передачу персональных данных, на распространение персональных
данных в общедоступных источниках, а также на передачу собранных персональных данных третьим лицам, за исключени-
ем оснований, предусмотренных статьей 9 ЗРК «О персональных данных и их защите».`,
          `Подтверждаю, что, давая данное согласие, субъект действует без принуждения, по собственной воле и в своих
интересах.`,
        ],
      },
    },
  };

  return (
    <div className="container mx-auto my-12 space-y-12 p-4 font-sans text-lg">
      <ContractPDF data={{ application: testApplicationData.application, contractsData }} />
      {/* FIRST PAGE */}
      {/* header */}
      <div className="flex items-start justify-between">
        <div>
          <LogoRedSvg />
        </div>
        <div className="max-w-xs text-right text-base text-black">
          <span className="">{contractsData.paid_minor.approvedTitle}</span>
        </div>
      </div>
      {/* title */}
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-extrabold">
          № <span className=" ">{testApplicationData.application.contractNumber}</span>
        </h1>
        <h2 className="text-2xl font-extrabold text-[#D7262C]">
          <span className="">{contractsData.paid_minor.contractTitle}</span>
        </h2>
      </div>
      {/* brief */}
      <div className="">
        <div className="mx-auto max-w-5xl">
          {/* applicant */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              <p>Настоящим заявлением, я гражданин (-ка): </p>
              <p className="border-b border-black font-bold text-green-500">
                {testApplicationData.application.applicant.citizenship}
              </p>
            </div>
            <div className="">
              <div className="grid grid-cols-2 gap-2">
                <div>Фамилия: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.surname}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Имя: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.givennames}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Отчество: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.patronymic}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>ИИН: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.identificationNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Документ, удостоверяющий личность: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.documentType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Номер документа: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.documentNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Выдан: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.documentIssueDate}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>Дата выдачи: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.applicant.documentIssueDate}</p>
                </div>
              </div>
            </div>
            <p>именуемый (-ая) в дальнейшем «Обучающийся»,</p>
          </div>
          {/* END APPLICANT */}

          {/* representative */}
          {testApplicationData.application?.representative?.surname && (
            <div className="bg-yellow-50">
              <div className="grid grid-cols-2 gap-2">
                <div>ФИО: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>
                    {testApplicationData.application.representative.surname}{' '}
                    {testApplicationData.application.representative.givennames}{' '}
                    {testApplicationData.application.representative.patronymic}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>ИИН: </div>
                <div className="w-full border-b border-black font-bold text-green-500">
                  <p>{testApplicationData.application.representative.identificationNumber}</p>
                </div>
              </div>
              <p>
                выступающий в качестве Представителя несовершеннолетнего, и действующий в интересах
                несовершеннолетнего на основании
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex-col">
                  <p className="border-b border-black font-bold text-green-500">
                    {testApplicationData.application.representative.documentType}{' '}
                  </p>
                  <p className="text-center text-sm">(наименование документа)</p>
                </div>
                <div className="flex-col">
                  <p className="border-b border-black font-bold text-green-500">
                    № {testApplicationData.application.representative.documentNumber}{' '}
                  </p>
                  <p className="text-center text-sm">(номер документа)</p>
                </div>
                <div className="flex-col">
                  <p className="border-b border-black font-bold text-green-500">
                    {testApplicationData.application.representative.documentIssueDate}{' '}
                  </p>
                  <p className="text-center text-sm">(дата выдачи)</p>
                </div>
              </div>
            </div>
          )}
          {/* END REPRESENTATIVE */}
        </div>
        <p className="my-8 text-center leading-none font-extrabold">
          <span className="">{contractsData.paid_minor.accesstionTitle}</span>
        </p>
      </div>
      {/* END BRIEF */}

      {/* CHAPTER */}
      <div className="">
        {contractsData.paid_minor.chapters.map((chapter) => (
          <div key={chapter.title} className="my-4 space-y-4">
            <h3 className="text-center text-2xl font-extrabold text-[#D7262C]">{chapter.title}</h3>
            {/* ITEMS */}
            <div className="flex gap-2">
              {/* Left column */}
              <div className="flex w-full flex-col gap-2">
                {chapter.items.left.map((content, index) => (
                  <div key={index} className="flex flex-col items-start justify-start">
                    <div>
                      {content.title ? (
                        <span className="font-bold text-[#D7262C]">
                          {content.title}
                          <br />
                        </span>
                      ) : (
                        <span className="text-[#D7262C]">
                          {content.title ? content.title : index + 1}
                          {') '}
                        </span>
                      )}
                      {content.content}
                    </div>
                  </div>
                ))}
              </div>
              {/* Right column */}
              <div className="flex w-full flex-col gap-2">
                {chapter.items.right.map((content, index) => (
                  <div key={index} className="flex flex-col items-start justify-start">
                    <div>
                      {content.title ? (
                        <span className="font-bold text-[#D7262C]">
                          {content.title}
                          <br />
                        </span>
                      ) : (
                        <span className="text-[#D7262C]">
                          {index + chapter.items.left.length + 1}
                          {') '}
                        </span>
                      )}
                      {content.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {/* END ITEMS */}
      </div>
      {/* END CHAPTER */}

      {/* END FIRST PAGE CHAPTER I */}

      {/* SECOND PAGE CHAPTER II */}

      {/* CURRENT ACCOUNT */}
      <div className="">
        <div className="flex flex-col justify-start">
          <h3 className="text-2xl font-bold text-[#D7262C]">
            {contractsData.currentAccount.title}
          </h3>
          <p>{contractsData.currentAccount.accountTitle}</p>
          <p>{contractsData.currentAccount.address}</p>
          <p>{contractsData.currentAccount.bin}</p>
          <p>{contractsData.currentAccount.iik}</p>
          <p>{contractsData.currentAccount.bik}</p>
          <p>{contractsData.currentAccount.bankName}</p>
          <p>{contractsData.currentAccount.additionalInfo}</p>
        </div>
      </div>
      {/* END CURRENT ACCOUNT */}
      {/* NOTE */}
      <div className="">
        <p className="font-bold">{contractsData.note}</p>
      </div>
      {/* END NOTE */}

      {/* SIGNATURE */}
      <div className="flex flex-col gap-8">
        {/* SIGNATURE APPLICANT */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="max-w-md rounded-full border-1 border-[#D7262C] px-4 py-2 text-center font-extrabold">
              Обучающийся
            </p>
          </div>
          <div>
            <div className="rounded-2xl border-1 border-[#D7262C] p-4">
              <p>
                Ф.И.О.: {testApplicationData.application.applicant.surname}{' '}
                {testApplicationData.application.applicant.givennames}{' '}
                {testApplicationData.application.applicant.patronymic}
              </p>
              <p>ИИН: {testApplicationData.application.applicant.identificationNumber}</p>
              <p>Контактный телефон: {testApplicationData.application.applicant.phone}</p>
              <p>Email: {testApplicationData.application.applicant.email}</p>
              <p>
                Фактический адрес: {testApplicationData.application.applicant.addressResidential}
              </p>
              <p>Адрес прописки: {testApplicationData.application.applicant.addressRegistration}</p>
              <div className="flex flex-col items-end justify-end">
                <div className="h-10 w-60 border-b border-black"></div>
                <span className="mt-2 w-60 text-center text-sm text-gray-500 italic">
                  (Подпись)
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* END SIGNATURE */}
        {/* SIGNATURE REPRESENTATIVE */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="max-w-md rounded-full border-1 border-[#D7262C] px-4 py-2 text-center font-extrabold">
              Представитель
            </p>
          </div>
          <div>
            <div className="rounded-2xl border-1 border-[#D7262C] p-4">
              <p>
                Ф.И.О.: {testApplicationData.application.representative.surname}{' '}
                {testApplicationData.application.representative.givennames}{' '}
                {testApplicationData.application.representative.patronymic}
              </p>
              <p>ИИН: {testApplicationData.application.representative.identificationNumber}</p>
              <p>Контактный телефон: {testApplicationData.application.representative.phone}</p>
              <p>Email: {testApplicationData.application.representative.email}</p>
              <p>
                Действующий на основании:{' '}
                {testApplicationData.application.representative.documentType}
              </p>
              <p>
                № {testApplicationData.application.representative.documentNumber} от{' '}
                {testApplicationData.application.representative.documentIssueDate}
              </p>
              <div className="flex flex-col items-end justify-end">
                <div className="h-10 w-60 border-b border-black"></div>
                <span className="mt-2 w-60 text-center text-sm text-gray-500 italic">
                  (Подпись)
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* END SIGNATURE REPRESENTATIVE */}
      </div>
      {/* END SIGNATURE */}

      {/* END SECOND PAGE */}

      {/* THIRD PAGE */}
      {/* APPENDIXE 3 */}
      <div className="space-y-8">
        {/* HEADER */}
        <div className="flex items-start justify-between">
          <div>
            <LogoRedSvg />
          </div>
          <div className="max-w-xs space-y-8 text-right text-base text-black">
            <h3 className="">{contractsData.appendixes.number_3.approvedTitle}</h3>
            <h2 className="font-extrabold">{contractsData.appendixes.number_3.appendixTitle}</h2>
          </div>
        </div>
        {/* END HEADER */}
        {/* TITLE */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-[#D7262C]">
            {contractsData.appendixes.number_3.title}
          </h2>
        </div>
        {/* END TITLE */}
        {/* CONTENT */}
        <div className="my-4 space-y-2 indent-8 leading-relaxed">
          {contractsData.appendixes.number_3.paragraphs.map((paragraph, index) => (
            <p className="" key={index}>
              {paragraph}
            </p>
          ))}
        </div>
        {/* END CONTENT */}
        {/* SIGNATURE */}
        <div className="flex flex-row justify-between pt-26">
          <p>
            Субъект: {testApplicationData.application.applicant.surname}{' '}
            {testApplicationData.application.applicant.givennames}{' '}
            {testApplicationData.application.applicant.patronymic}
          </p>
          <div className="flex flex-col items-end justify-end">
            <div className="h-6 w-60 border-b border-black"></div>
            <span className="mt-2 w-60 text-center text-sm text-gray-500 italic">(Подпись)</span>
          </div>
        </div>
        {/* END SIGNATURE */}
        {/* SIGNATURE DATE */}
        <div className="flex justify-end pt-10">
          <div className="flex flex-col items-end justify-end">
            <p className="flex gap-2">
              Дата подписания: «<span className="mx-0 h-6 w-10 border-b border-black px-0"></span>»{' '}
              <span className="h-6 w-60 border-b border-black"></span> {new Date().getFullYear()}{' '}
              года
            </p>
          </div>
        </div>
      </div>
      {/* END APPENDIXE 3 */}

      {/* END THIRD PAGE */}

      {/* FOOTER ALL PAGES */}
      <div className="flex flex-row justify-between">
        <div>
          <p>Создано и подписано: {testApplicationData.application.submittedAt}</p>
          <p>Регистрационный номер {testApplicationData.application.contractNumber}</p>
        </div>
        <div className="flex flex-col items-end justify-end">
          <div className="h-6 w-80 border-b border-black"></div>
          <span className="mt-2 w-80 text-center text-sm text-gray-500 italic">
            (Подпись лица, принявшего заявление)
          </span>
        </div>
      </div>
      {/* END FOOTER ALL PAGES */}
    </div>
  );
};

export default ContractPage;
