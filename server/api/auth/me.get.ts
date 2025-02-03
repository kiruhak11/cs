// server/api/auth/me.get.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
// Секретный ключ для JWT (лучше задавать через переменные окружения)
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

  try {
    // Проверка токена
    const decoded = jwt.verify(token, secret) as { id: number; email: string };
    // Поиск пользователя по id
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "Пользователь не найден",
      });
    }
    // Возвращаем данные пользователя (без пароля)
    const { password, ...userData } = user;
    return userData;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }
});
