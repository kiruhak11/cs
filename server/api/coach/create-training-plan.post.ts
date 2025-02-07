import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

// Функция для вычисления начала текущей недели (понедельник)
function getCurrentMonday(): Date {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7; // воскресенье -> 6, понедельник -> 0 и т.д.
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Функция для вычисления начала следующей недели (следующий понедельник)
function getNextMonday(): Date {
  const currentMonday = getCurrentMonday();
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7);
  return nextMonday;
}

export default defineEventHandler(async (event) => {
  // Авторизация
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
          "Forbidden: только тренеры могут создавать тренировочные планы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Извлекаем данные из запроса
  const body = await readBody(event);
  const {
    dayOfWeek,
    details,
    participants,
    groupId,
    planForNextWeek,
    exercises,
  } = body;

  if (!dayOfWeek || !details) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: dayOfWeek и details обязательны",
    });
  }

  // Определяем дату начала недели для плана
  const plannedFor = planForNextWeek ? getNextMonday() : getCurrentMonday();

  try {
    // Создаем тренировочный план
    const trainingPlan = await prisma.trainingPlan.create({
      data: {
        dayOfWeek,
        details,
        coachId,
        groupId: groupId ? Number(groupId) : null,
        plannedFor,
      },
    });

    // Если передан массив упражнений, создаем записи для каждой заполненной строки
    if (exercises && Array.isArray(exercises)) {
      for (const ex of exercises) {
        // Проверяем, что обе ячейки заполнены
        if (
          ex.load &&
          ex.exercise &&
          ex.load.trim() !== "" &&
          ex.exercise.trim() !== ""
        ) {
          await prisma.trainingPlanExercise.create({
            data: {
              trainingPlanId: trainingPlan.id,
              load: ex.load,
              exercise: ex.exercise,
            },
          });
        }
      }
    }

    // Если выбрана группа, назначаем план всем участникам этой группы
    if (groupId) {
      const groupData = await prisma.participantGroup.findUnique({
        where: { id: Number(groupId) },
        include: { participants: true },
      });
      if (groupData && groupData.participants.length > 0) {
        for (const participant of groupData.participants) {
          await prisma.trainingPlanAssignment.create({
            data: {
              trainingPlanId: trainingPlan.id,
              participantId: participant.id,
            },
          });
        }
      }
    } else if (
      participants &&
      Array.isArray(participants) &&
      participants.length > 0
    ) {
      // Если группа не выбрана, но переданы конкретные участники
      for (const participantId of participants) {
        await prisma.trainingPlanAssignment.create({
          data: {
            trainingPlanId: trainingPlan.id,
            participantId,
          },
        });
      }
    }

    // Возвращаем созданный план с упражнениями
    const planWithExercises = await prisma.trainingPlan.findUnique({
      where: { id: trainingPlan.id },
      include: { exercises: true },
    });
    return { trainingPlan: planWithExercises };
  } catch (error) {
    console.error("Ошибка при создании плана:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании тренировочного плана",
    });
  }
});
