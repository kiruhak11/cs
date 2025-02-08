import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Проверяем наличие заголовка авторизации
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

  // Декодируем токен и проверяем, что пользователь – тренер
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

  // Получаем planId из параметров маршрута
  const { planId } = event.context.params || {};
  if (!planId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: не указан planId",
    });
  }

  try {
    // Выполняем запрос для получения списка упражнений для плана с заданным ID
    const exercises = await prisma.trainingPlanExercise.findMany({
      where: { trainingPlanId: Number(planId) },
    });
    return exercises;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении упражнений",
    });
  }
});
