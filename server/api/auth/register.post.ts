// server/api/auth/register.post.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";
export default defineEventHandler(async (event) => {
  // Используем readBody для получения данных из запроса
  const body = await readBody(event);
  const { email, username, password, name, phone } = body;

  // Простая валидация обязательных полей
  if (!email || !password) {
    return { error: "Email и пароль обязательны для регистрации" };
  }

  // Проверяем, существует ли уже пользователь с таким email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "Пользователь с таким email уже существует" };
  }

  // Хэшируем пароль
  const hashedPassword = await bcrypt.hash(password, 10);

  // Создаем пользователя
  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name,
        phone,
      },
    });
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, secret, {
      expiresIn: "1h",
    });
    return { token, newUser };
  } catch (error) {
    return { error: "Ошибка при регистрации пользователя", details: error };
  }
});
