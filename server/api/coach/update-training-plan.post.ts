// server/api/coach/update-training-plan.post.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

// Функция для вычисления новой даты plannedFor на основе дня недели и типа недели
function computePlannedFor(dayOfWeek: string, weekType: string): Date {
  const now = new Date();
  // Определяем начало текущей недели (с понедельника)
  const currentDay = now.getDay(); // 0 - воскресенье, 1 - понедельник и т.д.
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  const mondayThisWeek = new Date(now);
  mondayThisWeek.setDate(now.getDate() + diffToMonday);
  mondayThisWeek.setHours(0, 0, 0, 0);

  let targetMonday: Date;
  if (weekType === "current") {
    targetMonday = mondayThisWeek;
  } else if (weekType === "next") {
    targetMonday = new Date(mondayThisWeek);
    targetMonday.setDate(targetMonday.getDate() + 7);
  } else {
    targetMonday = mondayThisWeek; // По умолчанию текущая неделя
  }

  // Сопоставляем день недели с числовым смещением (Понедельник = 0, Вторник = 1, и т.д.)
  const dayOffsets: Record<string, number> = {
    Monday: 0,
    Tuesday: 1,
    Wednesday: 2,
    Thursday: 3,
    Friday: 4,
    Saturday: 5,
    Sunday: 6,
  };
  const offset = dayOffsets[dayOfWeek] ?? 0;
  const plannedFor = new Date(targetMonday);
  plannedFor.setDate(targetMonday.getDate() + offset);
  return plannedFor;
}

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
        statusMessage: "Forbidden: только тренеры могут обновлять планы",
      });
    }
    coachId = decoded.id;
  } catch (e) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Чтение данных из тела запроса
  const body = await readBody(event);
  const { planId, dayOfWeek, groupId, exercises, weekType } = body;
  if (!planId || !dayOfWeek || !weekType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: отсутствуют обязательные поля",
    });
  }

  // Вычисляем новую дату plannedFor
  const newPlannedFor = computePlannedFor(dayOfWeek, weekType);

  try {
    // Обновляем тренировочный план
    await prisma.trainingPlan.update({
      where: { id: planId },
      data: {
        dayOfWeek,
        groupId: groupId || null,
        plannedFor: newPlannedFor,
      },
    });

    // Удаляем все существующие упражнения для этого плана
    await prisma.trainingPlanExercise.deleteMany({
      where: { trainingPlanId: planId },
    });

    // Если передан массив упражнений, создаём новые записи
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      const exercisesData = exercises.map((ex: any) => ({
        trainingPlanId: planId,
        load: ex.load,
        exercise: ex.exercise,
      }));
      await prisma.trainingPlanExercise.createMany({
        data: exercisesData,
      });
    }

    return { message: "План успешно обновлен" };
  } catch (e: any) {
    console.error("Ошибка обновления плана:", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении плана",
    });
  }
});
