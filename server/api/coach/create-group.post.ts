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
        statusMessage: "Forbidden: только тренеры могут создавать группы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получаем данные из тела запроса
  const body = await readBody(event);
  const { name, participants } = body;
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: имя группы обязательно",
    });
  }

  try {
    const group = await prisma.participantGroup.create({
      data: {
        name,
        coachId,
        participants: {
          connect:
            participants && participants.length > 0
              ? participants.map((id: number) => ({ id }))
              : [],
        },
      },
    });
    return group;
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании группы",
    });
  }
});
