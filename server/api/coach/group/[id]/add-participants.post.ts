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
        statusMessage: "Forbidden: только тренеры могут изменять группы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получаем group id из параметров маршрута
  const { id } = event.context.params || {};
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: id группы обязателен",
    });
  }
  const groupId = Number(id);

  // Проверяем, что группа существует и принадлежит текущему тренеру
  const group = await prisma.participantGroup.findUnique({
    where: { id: groupId },
    include: { participants: true },
  });
  if (!group) {
    throw createError({
      statusCode: 404,
      statusMessage: "Группа не найдена",
    });
  }
  if (group.coachId !== coachId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: группа не принадлежит тренеру",
    });
  }

  // Извлекаем из тела запроса массив id участников, которых нужно добавить
  const body = await readBody(event);
  const { participants } = body; // ожидаем массив чисел
  if (
    !participants ||
    !Array.isArray(participants) ||
    participants.length === 0
  ) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Bad Request: participants обязателен и должен быть непустым массивом",
    });
  }

  try {
    const updatedGroup = await prisma.participantGroup.update({
      where: { id: groupId },
      data: {
        participants: {
          connect: participants.map((pid: number) => ({ id: pid })),
        },
      },
      select: {
        id: true,
        name: true,
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return updatedGroup;
  } catch (error) {
    console.error("Ошибка при обновлении группы:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при обновлении участников группы",
    });
  }
});
