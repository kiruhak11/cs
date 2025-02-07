// server/api/participant/submit-achievement.post.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Извлекаем токен из заголовка Authorization
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

  // Верифицируем токен и получаем идентификатор участника
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

  // Получаем данные из тела запроса
  const body = await readBody(event);
  const { performance, notes } = body;

  try {
    // Создаем запись достижения; устанавливаем дату достижения как текущую
    const achievement = await prisma.achievement.create({
      data: {
        date: new Date(), // можно заменить на значение, переданное в теле, если требуется
        performance,
        notes,
        participantId,
      },
    });
    return achievement;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при отправке достижения",
    });
  }
});
