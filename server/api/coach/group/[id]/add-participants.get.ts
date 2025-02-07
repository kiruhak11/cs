import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Проверяем заголовок Authorization
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
        statusMessage: "Forbidden: только тренеры могут получать данные группы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получаем параметр id группы
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: id группы обязателен",
    });
  }
  const groupId = Number(id);

  try {
    // Находим группу по groupId и включаем список участников
    const group = await prisma.participantGroup.findUnique({
      where: { id: groupId },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!group) {
      throw createError({
        statusCode: 404,
        statusMessage: "Группа не найдена",
      });
    }
    // Проверяем, что группа принадлежит текущему тренеру
    if (group.coachId !== coachId) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: группа не принадлежит тренеру",
      });
    }
    return group.participants;
  } catch (error) {
    console.error("Ошибка при получении участников группы:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при получении участников группы",
    });
  }
});
