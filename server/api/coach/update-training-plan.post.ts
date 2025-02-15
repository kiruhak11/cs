import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

function computePlannedFor(dayOfWeek: string, weekType: string): Date {
  const now = new Date();
  const currentDay = now.getDay();
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
    targetMonday = mondayThisWeek;
  }
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
  // Проверка авторизации
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

  const body = await readBody(event);
  const { planId, dayOfWeek, groupId, exercises, weekType, participantIds } =
    body;
  if (!planId || !dayOfWeek || !weekType) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: отсутствуют обязательные поля",
    });
  }

  const newPlannedFor = computePlannedFor(dayOfWeek, weekType);
  console.log("Обновляем план:", {
    planId,
    dayOfWeek,
    groupId,
    weekType,
    participantIds,
    newPlannedFor,
  });

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

    // Обновляем упражнения: удаляем старые и создаём новые
    await prisma.trainingPlanExercise.deleteMany({
      where: { trainingPlanId: planId },
    });
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

    // Обновляем индивидуальные назначения
    await prisma.trainingPlanAssignment.deleteMany({
      where: { trainingPlanId: planId },
    });
    if (participantIds && Array.isArray(participantIds)) {
      const numericIds = participantIds
        .map((pid: any) =>
          typeof pid === "object" ? Number(pid.id) : Number(pid)
        )
        .filter((id: number) => !isNaN(id));
      if (numericIds.length > 0) {
        const assignmentsData = numericIds.map((pid: number) => ({
          trainingPlanId: planId,
          participantId: pid,
        }));
        await prisma.trainingPlanAssignment.createMany({
          data: assignmentsData,
        });
      }
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
