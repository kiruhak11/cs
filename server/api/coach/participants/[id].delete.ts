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
        statusMessage: "Forbidden: только тренеры могут удалять участников",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Извлекаем id участника из параметров маршрута
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: id участника обязателен",
    });
  }
  const participantId = Number(id);

  // Проверяем, что участник существует и принадлежит данному тренеру
  const participant = await prisma.user.findUnique({
    where: { id: participantId },
  });
  if (!participant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Участник не найден",
    });
  }
  if (participant.coachId !== coachId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: участник не принадлежит тренеру",
    });
  }
  if (participant.role !== "PARTICIPANT") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: можно удалять только участников",
    });
  }

  try {
    const deletedParticipant = await prisma.$transaction(async (tx) => {
      // Удаляем все назначения участника в тренировочных планах
      await tx.trainingPlanAssignment.deleteMany({
        where: { participantId },
      });

      // Удаляем достижения участника, если они есть
      await tx.achievement.deleteMany({
        where: { participantId },
      });

      // Если есть другие зависимости – их тоже нужно удалить или откорректировать

      // Наконец, удаляем участника
      return await tx.user.delete({
        where: { id: participantId },
      });
    });
    return {
      message: "Участник успешно удалён",
      participant: deletedParticipant,
    };
  } catch (error) {
    console.error("Ошибка при удалении участника:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении участника",
    });
  }
});
