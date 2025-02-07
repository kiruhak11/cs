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
        statusMessage: "Forbidden: только тренеры могут обновлять планы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  const body = await readBody(event);
  const { planId, active } = body;
  if (!planId || typeof active !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: planId и active (boolean) обязательны",
    });
  }
  try {
    // Дополнительно можно проверить, что план принадлежит данному тренеру
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: Number(planId) },
    });
    if (!plan || plan.coachId !== coachId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: план не принадлежит тренеру",
      });
    }
    const updatedPlan = await prisma.trainingPlan.update({
      where: { id: Number(planId) },
      data: { active },
    });
    return { plan: updatedPlan };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении статуса плана",
    });
  }
});
