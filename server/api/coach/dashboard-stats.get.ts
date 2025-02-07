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

  // Проверка токена и роли
  let coachId: number;
  try {
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "COACH") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: доступ только для тренеров",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получение статистики: количество групп, участников и планов, связанных с тренером
  try {
    const groupsCount = await prisma.participantGroup.count({
      where: { coachId },
    });
    const participantsCount = await prisma.user.count({
      where: { coachId, role: "PARTICIPANT" },
    });
    const plansCount = await prisma.trainingPlan.count({
      where: { coachId },
    });
    return {
      groups: groupsCount,
      participants: participantsCount,
      plans: plansCount,
    };
  } catch (error) {
    console.error("Ошибка при получении статистики:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении статистики",
    });
  }
});
