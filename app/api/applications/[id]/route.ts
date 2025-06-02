import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    console.log(`[API] GET request for application ID: ${id}`);

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: true,
        representative: true,
        details: {
          include: {
            educationalProgram: true,
          },
        },
        documents: true,
        Log: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        consultant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!application) {
      console.log(`[API] Application not found for ID: ${id}`);
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    console.log(`[API] Returning application with ID: ${id}, updatedAt: ${application.updatedAt}`);
    return NextResponse.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Получаем ID заявки из параметров URL
    const id = (await params).id;

    console.log(`[API] PATCH request for application ID: ${id}`);

    // Получаем данные из запроса
    const data = await request.json();
    console.log(`[API] Received data:`, JSON.stringify(data, null, 2));

    // Находим заявку в базе данных с включением всех связанных сущностей
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        Log: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        applicant: true,
        representative: true,
        details: true,
      },
    });

    // Если заявка не найдена, возвращаем 404
    if (!application) {
      console.log(`[API] Application not found for ID: ${id}`);
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Выполняем все обновления в рамках одной транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Переменные для хранения обновленных сущностей
      let updatedApplicant = application.applicant;
      let updatedRepresentative = application.representative;
      let updatedDetails = application.details;

      // 1. Обновляем основную сущность Application
      const updatedApp = await tx.application.update({
        where: { id },
        data: {
          contractLanguage: data.contractLanguage ?? application.contractLanguage,
          submittedAt: data.submittedAt !== undefined ? data.submittedAt : application.submittedAt,
          consultantId:
            data.consultantId !== undefined ? data.consultantId : application.consultantId,
          updatedAt: new Date(),
          contractSignType: data.contractSignType ?? application.contractSignType,
          trustMeId: data.trustMeId ?? application.trustMeId,
          trustMeUrl: data.trustMeUrl ?? application.trustMeUrl,
          trustMeFileName: data.trustMeFileName ?? application.trustMeFileName,
        },
        include: {
          applicant: true,
          representative: true,
          details: {
            include: { educationalProgram: true },
          },
          documents: true,
          Log: {
            orderBy: { createdAt: 'desc' },
            include: {
              createdBy: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      console.log(`[API] Application updated: ${id}`);

      // 2. Обновляем статус в логе, если он указан
      if (data.statusId) {
        console.log(`[API] Updating status to: ${data.statusId}`);
        const lastLog = application.Log[0];

        if (lastLog) {
          await tx.log.update({
            where: { id: lastLog.id },
            data: {
              statusId: data.statusId,
              updatedAt: new Date(),
            },
          });
        } else {
          await tx.log.create({
            data: {
              applicationId: id,
              statusId: data.statusId,
              createdById: application.createdById,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }
      }

      // 3. Обрабатываем данные заявителя (Applicant)
      if (data.applicant) {
        // Подготавливаем данные заявителя, удаляя системные поля
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          ...applicantData
        } = data.applicant;
        /* eslint-enable @typescript-eslint/no-unused-vars */

        // Обработка даты рождения
        let birthDate = undefined;
        let documentIssueDate = undefined;
        let documentExpiryDate = undefined;

        // Обработка даты рождения
        if (data.applicant.birthDate) {
          try {
            birthDate = new Date(data.applicant.birthDate);
          } catch (e) {
            console.error(`[API] Error parsing birthDate:`, e);
          }
        }

        // Обработка дат документа
        if (data.applicant.documentIssueDate) {
          try {
            documentIssueDate = new Date(data.applicant.documentIssueDate);
          } catch (e) {
            console.error(`[API] Error parsing documentIssueDate:`, e);
          }
        }

        if (data.applicant.documentExpiryDate) {
          try {
            documentExpiryDate = new Date(data.applicant.documentExpiryDate);
          } catch (e) {
            console.error(`[API] Error parsing documentExpiryDate:`, e);
          }
        }

        // Создаем базовые данные заявителя
        const applicantBaseData = {
          ...applicantData,
          // Обновляем даты, если они были преобразованы
          ...(birthDate !== undefined && { birthDate }),
          ...(documentIssueDate !== undefined && { documentIssueDate }),
          ...(documentExpiryDate !== undefined && { documentExpiryDate }),
          // Устанавливаем documentType в null, если оно пустое
          documentType: applicantData.documentType || null,
          updatedAt: new Date(),
        };

        // Если заявитель уже существует, обновляем его
        if (application.applicantId) {
          console.log(`[API] Updating applicant: ${application.applicantId}`);

          updatedApplicant = await tx.applicant.update({
            where: { id: application.applicantId },
            data: applicantBaseData,
          });

          console.log(`[API] Applicant updated: ${updatedApplicant.id}`);
        }
        // Если заявителя нет, создаем нового и связываем с заявкой
        else {
          console.log(`[API] Creating new applicant`);

          updatedApplicant = await tx.applicant.create({
            data: {
              ...applicantBaseData,
              createdAt: new Date(),
              applications: { connect: { id } },
            },
          });

          // Обновляем связь в заявке
          await tx.application.update({
            where: { id },
            data: {
              applicant: { connect: { id: updatedApplicant.id } },
            },
          });

          console.log(`[API] New applicant created: ${updatedApplicant.id}`);
        }
      }

      // 4. Обрабатываем данные представителя (Representative)
      if (data.representative) {
        // Подготавливаем данные представителя, удаляя системные поля
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          applicantId,
          ...representativeData
        } = data.representative;
        /* eslint-enable @typescript-eslint/no-unused-vars */

        // Обрабатываем даты для документов
        let documentIssueDate = undefined;
        let documentExpiryDate = undefined;
        let representativeDocumentIssueDate = undefined;
        let representativeDocumentExpiryDate = undefined;

        // Обработка дат идентификационного документа
        if (data.representative.documentIssueDate) {
          try {
            documentIssueDate = new Date(data.representative.documentIssueDate);
          } catch (e) {
            console.error(`[API] Error parsing documentIssueDate:`, e);
          }
        }

        if (data.representative.documentExpiryDate) {
          try {
            documentExpiryDate = new Date(data.representative.documentExpiryDate);
          } catch (e) {
            console.error(`[API] Error parsing documentExpiryDate:`, e);
          }
        }

        // Обработка дат документа представителя
        if (data.representative.representativeDocumentIssueDate) {
          try {
            representativeDocumentIssueDate = new Date(
              data.representative.representativeDocumentIssueDate,
            );
          } catch (e) {
            console.error(`[API] Error parsing representativeDocumentIssueDate:`, e);
          }
        }

        if (data.representative.representativeDocumentExpiryDate) {
          try {
            representativeDocumentExpiryDate = new Date(
              data.representative.representativeDocumentExpiryDate,
            );
          } catch (e) {
            console.error(`[API] Error parsing representativeDocumentExpiryDate:`, e);
          }
        }

        // Создаем базовые данные представителя
        const representativeBaseData = {
          ...representativeData,
          // Обновляем даты документов, если они были преобразованы
          ...(documentIssueDate !== undefined && { documentIssueDate }),
          ...(documentExpiryDate !== undefined && { documentExpiryDate }),
          ...(representativeDocumentIssueDate !== undefined && { representativeDocumentIssueDate }),
          ...(representativeDocumentExpiryDate !== undefined && {
            representativeDocumentExpiryDate,
          }),
          // Обновляем временную метку
          updatedAt: new Date(),
        };

        // Если представитель уже существует, обновляем его
        if (application.representativeId) {
          console.log(`[API] Updating representative: ${application.representativeId}`);

          updatedRepresentative = await tx.representative.update({
            where: { id: application.representativeId },
            data: representativeBaseData,
          });

          console.log(`[API] Representative updated: ${updatedRepresentative.id}`);
        }
        // Если представителя нет, создаем нового и связываем с заявкой
        else {
          console.log(`[API] Creating new representative`);

          updatedRepresentative = await tx.representative.create({
            data: {
              ...representativeBaseData,
              createdAt: new Date(),
              applications: { connect: { id } },
            },
          });

          // Обновляем связь в заявке
          await tx.application.update({
            where: { id },
            data: {
              representative: { connect: { id: updatedRepresentative.id } },
            },
          });

          console.log(`[API] New representative created: ${updatedRepresentative.id}`);
        }
      }

      // 5. Обрабатываем детали заявки (Details)
      if (data.details) {
        // Удаляем системные поля и поля, не принадлежащие модели Details
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          applicationId: _applicationId,
          educationalProgramId,
          educationalProgram, // Добавляем это поле в список исключаемых полей
          contractLanguage: _contractLanguage,
          ...detailsData
        } = data.details;
        /* eslint-enable @typescript-eslint/no-unused-vars */

        // Проверка на остаточные вложенные объекты
        const cleanedDetailsData = { ...detailsData };
        if (cleanedDetailsData.educationalProgram) {
          delete cleanedDetailsData.educationalProgram;
        }

        // Создаем базовые данные для деталей
        const detailsBaseData = {
          ...cleanedDetailsData,
          updatedAt: new Date(),
          ...(educationalProgramId && {
            educationalProgramId: educationalProgramId,
          }),
        };

        // Если детали уже существуют, обновляем их
        if (application.detailsId) {
          console.log(`[API] Updating details: ${application.detailsId}`);

          updatedDetails = await tx.details.update({
            where: { id: application.detailsId },
            data: detailsBaseData,
          });

          console.log(`[API] Details updated: ${updatedDetails.id}`);
        }
        // Если деталей нет, создаем новые и связываем с заявкой
        else {
          console.log(`[API] Creating new details`);

          updatedDetails = await tx.details.create({
            data: {
              ...detailsBaseData,
              type: detailsBaseData.type || null,
              academicLevel: detailsBaseData.academicLevel || null,
              studyingLanguage: detailsBaseData.studyingLanguage || null,
              createdAt: new Date(),
              application: { connect: { id } },
            },
          });

          // Обновляем связь в заявке
          await tx.application.update({
            where: { id },
            data: {
              details: { connect: { id: updatedDetails.id } },
            },
          });

          console.log(`[API] New details created: ${updatedDetails.id}`);
        }
      }

      // 6. Обрабатываем documentDetails
      if (data.documentDetails) {
        for (const [docCode, details] of Object.entries(data.documentDetails)) {
          const document = await tx.document.findFirst({
            where: {
              applicationId: id,
              code: docCode,
            },
          });

          if (document) {
            const typedDetails = details as {
              diplomaSerialNumber?: string;
              number?: string;
              issueDate?: string;
              expirationDate?: string;
              issuingAuthority?: string;
            };

            await tx.document.update({
              where: { id: document.id },
              data: {
                diplomaSerialNumber: typedDetails.diplomaSerialNumber || null,
                number: typedDetails.number || null,
                issueDate: typedDetails.issueDate ? new Date(typedDetails.issueDate) : null,
                expirationDate: typedDetails.expirationDate
                  ? new Date(typedDetails.expirationDate)
                  : null,
                issuingAuthority: typedDetails.issuingAuthority || null,
              },
            });
          }
        }
      }

      // Возвращаем обновленное приложение
      return updatedApp;
    });

    console.log(`[API] All updates completed successfully for application: ${id}`);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`[API] Error updating application:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Вместо удаления устанавливаем флаг isDeleted в true
    await prisma.application.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error soft deleting application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
