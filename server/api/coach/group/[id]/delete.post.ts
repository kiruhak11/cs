import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Проверяем заголовок авторизации
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
    // Декодируем токен и проверяем, что роль - тренер
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "COACH") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: только тренеры могут удалять группы",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Извлекаем id группы из параметров маршрута
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

  // Удаляем группу
  try {
    await prisma.participantGroup.delete({
      where: { id: groupId },
    });
    return { message: "Группа успешно удалена" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при удалении группы",
    });
  }
});
