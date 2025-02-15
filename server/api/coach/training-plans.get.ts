// server/api/coach/training-plans.get.ts
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
  let coachId: number;
  try {
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "COACH") {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Forbidden: только тренеры могут получать тренировочные планы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  try {
    const plans = await prisma.trainingPlan.findMany({
      where: { coachId },
      include: {
        group: true,
        exercises: true,
        assignments: {
          select: {
            participant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    // Преобразуем assignments в participantAssignments для удобства на клиенте
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      participantAssignments: plan.assignments.map((a) => a.participant),
    }));
    return formattedPlans;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении тренировочных планов",
    });
  }
});
