import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Проверка заголовка Authorization
  const authHeader = getHeader(event, "authorization");
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: отсутствует заголовок Authorization",
    });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: токен не передан",
    });
  }

  let coachId: number;
  try {
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "COACH") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: доступ разрешён только тренерам",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получаем group id из параметров маршрута
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: id группы обязателен",
    });
  }
  const groupId = Number(id);

  // Читаем тело запроса — ожидаем массив id участников
  const body = await readBody(event);
  const { participants } = body;
  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: participants обязателен и должен быть непустым массивом",
    });
  }

  // Проверяем, что группа существует и принадлежит текущему тренеру
  const group = await prisma.participantGroup.findUnique({
    where: { id: groupId },
    include: { participants: true },
  });
  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: "Группа не найдена",
    });
  }
  if (group.coachId !== coachId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: группа не принадлежит тренеру",
    });
  }

  // Обновляем участников группы
  const updatedGroup = await prisma.participantGroup.update({
    where: { id: groupId },
    data: {
      participants: {
        connect: participants.map((pid: number) => ({ id: pid })),
      },
    },
    select: {
      id: true,
      name: true,
      participants: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Находим все активные тренировочные планы, назначенные этой группе
  const trainingPlans = await prisma.trainingPlan.findMany({
    where: {
      groupId: groupId,
      active: true,
    },
  });

  // Для каждого нового участника и каждого плана создаем запись в TrainingPlanAssignment,
  // если такой записи ещё нет
  for (const participantId of participants) {
    for (const plan of trainingPlans) {
      // Проверяем, существует ли запись
      const existingAssignment = await prisma.trainingPlanAssignment.findUnique(
        {
          where: {
            trainingPlanId_participantId: {
              trainingPlanId: plan.id,
              participantId: participantId,
            },
          },
        }
      );
      if (!existingAssignment) {
        await prisma.trainingPlanAssignment.create({
          data: {
            trainingPlanId: plan.id,
            participantId: participantId,
          },
        });
      }
    }
  }

  return updatedGroup;
});
