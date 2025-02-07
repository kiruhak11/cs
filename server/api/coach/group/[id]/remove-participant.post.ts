// server/api/coach/group/[id]/remove-participant.post.ts
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
        statusMessage: "Forbidden: только тренеры могут изменять группы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получаем id группы из параметров маршрута
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: id группы обязателен",
    });
  }
  const groupId = Number(id);

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

  // Извлекаем из тела запроса participantId для удаления
  const body = await readBody(event);
  const { participantId } = body; // ожидаем число
  if (!participantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: participantId обязателен",
    });
  }

  try {
    // Обновляем группу: отключаем участника
    const updatedGroup = await prisma.participantGroup.update({
      where: { id: groupId },
      data: {
        participants: {
          disconnect: [{ id: participantId }],
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
    // Удаляем записи из TrainingPlanAssignment, где удаляемый участник назначен по планам, связанным с этой группой
    await prisma.trainingPlanAssignment.deleteMany({
      where: {
        participantId: participantId,
        trainingPlan: {
          groupId: groupId,
        },
      },
    });
    return updatedGroup;
  } catch (error) {
    console.error("Ошибка при обновлении группы:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении участников группы",
    });
  }
});
