import React from 'react';

const Warning = () => {
  return (
    <div className="my-6 rounded-md border-l-4 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 space-y-4 text-lg text-yellow-700">
          <h2 className="text-2xl font-bold">Уважаемые абитуриенты!</h2>
          <h3 className="text-xl font-bold">
            Мы рады, что Вы выбрали Maqsut Narikbayev University.
          </h3>
          <p>
            Доводим до Вашего сведения, что при подаче документов для поступления в состав
            обучающихся MNU, посредствам информационного портала - &quot;в личном кабинете&quot;, Вы
            даете согласие на сбор, обработку, использование, передачу (распространение,
            предоставление, доступ) и уничтожение («Обработка») биометрических данных, а также любой
            информации, в том числе: фамилии, имя, отчества, даты и места рождения, адреса,
            семейного положения, образования, национальности и любой другой информации
            («Персональные данные»), относящейся прямо или косвенно к Абитуриенту, его законному
            Представителю.
          </p>
          <p>
            Университет обязуется обеспечивать соблюдение требований законодательства Республики
            Казахстан в сфере защиты биометрических и персональных данных.
          </p>
          <p>
            Также, уведомляем Вас, что при подаче всех документов посредством портала – в
            &quot;личном кабинете&quot; услугополучателя отображается статус о принятии.
          </p>
          <p className="font-bold">
            Вы предупреждаетесь об ответственности за полноту, подлинность, достоверность
            представленных документов и сведений, содержащихся в них.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Warning;
