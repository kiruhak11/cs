// server/api/coach/training-plan/[id].delete.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Проверка заголовка авторизации
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
        statusMessage:
          "Forbidden: только тренеры могут удалять тренировочные планы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Извлекаем id плана из параметров маршрута
  const params = event.context.params as Record<string, string>;
  const id = params?.id;
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: id плана обязателен",
    });
  }

  // Проверяем, что план принадлежит данному тренеру
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: Number(id) },
  });
  if (!plan) {
    throw createError({
      statusCode: 404,
      statusMessage: "Тренировочный план не найден",
    });
  }
  if (plan.coachId !== coachId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: план не принадлежит тренеру",
    });
  }

  try {
    // Удаляем связанные записи в TrainingPlanAssignment
    await prisma.trainingPlanAssignment.deleteMany({
      where: { trainingPlanId: Number(id) },
    });

    // Удаляем связанные записи в TrainingPlanExercise
    await prisma.trainingPlanExercise.deleteMany({
      where: { trainingPlanId: Number(id) },
    });

    // Теперь удаляем сам план
    const deletedPlan = await prisma.trainingPlan.delete({
      where: { id: Number(id) },
    });

    return { message: "Тренировочный план успешно удален", plan: deletedPlan };
  } catch (error) {
    console.error("Ошибка при удалении плана:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении тренировочного плана",
    });
  }
});
