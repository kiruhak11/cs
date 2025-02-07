// server/api/coach/participants.get.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Извлекаем заголовок Authorization
  const authHeader = getHeader(event, "authorization");
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: отсутствует заголовок Authorization",
    });
  }

  // Ожидаем схему "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: токен не передан",
    });
  }

  let coachId: number;
  try {
    // Декодируем токен и проверяем, что пользователь имеет роль COACH
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "COACH") {
      throw createError({
        statusCode: 403,
        statusMessage:
          "Forbidden: только тренеры могут получать список участников",
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
    // Получаем участников, привязанных к данному тренеру (по coachId)
    const participants = await prisma.user.findMany({
      where: {
        coachId: coachId,
        role: "PARTICIPANT",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return participants;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении участников",
    });
  }
});
