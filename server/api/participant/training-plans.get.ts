import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
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
  let participantId: number;
  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    participantId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Текущая дата
  const now = new Date();

  try {
    // Получаем назначения, где тренинговый план активен и для которых plannedFor <= now
    const assignments = await prisma.trainingPlanAssignment.findMany({
      where: {
        participantId,
        trainingPlan: {
          plannedFor: { lte: now },
          active: true,
        },
      },
      include: {
        trainingPlan: { include: { exercises: true, group: true } },
      },
    });
    // Извлекаем тренировочные планы
    const trainingPlans = assignments.map((a) => a.trainingPlan);
    return trainingPlans;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении тренировочных планов",
    });
  }
});
