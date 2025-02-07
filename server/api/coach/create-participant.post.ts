// server/api/coach/create-participant.post.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";
const saltRounds = 10; // Количество salt rounds для bcrypt

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
    // Декодируем токен и проверяем роль
    const decoded = jwt.verify(token, secret) as { id: number; role: string };
    if (decoded.role !== "COACH") {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden: только тренеры могут создавать участников",
      });
    }
    coachId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Извлекаем данные из тела запроса
  const body = await readBody(event);
  const { name } = body;
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request: имя участника обязательно",
    });
  }

  // Генерируем логин и пароль для участника
  const generatedLogin =
    name.toLowerCase().replace(/\s+/g, "") + Math.floor(Math.random() * 1000);
  const generatedPassword = Math.random().toString(36).slice(-8);
  // Хэшируем пароль
  const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds);

  try {
    // Создаем участника с ролью PARTICIPANT, устанавливаем firstLogin = true, связываем с тренером (coachId)
    const participant = await prisma.user.create({
      data: {
        name,
        username: generatedLogin,
        password: hashedPassword,
        email: `${generatedLogin}@login.com`, // можно генерировать email по-другому
        role: "PARTICIPANT",
        firstLogin: true,
        coachId: coachId,
      },
    });

    return {
      username: participant.username,
      password: generatedPassword, // возвращаем оригинальный пароль
      message: "Участник успешно создан",
    };
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Ошибка при создании участника",
    });
  }
});
