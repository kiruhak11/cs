// server/api/auth/login.post.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
// Используйте переменную окружения для секретного ключа JWT
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    return { error: "Email и пароль обязательны для входа" };
  }

  // Ищем пользователя по email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Пользователь не найден" };
  }

  // Сравниваем переданный пароль с хэшированным паролем в базе
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Неверный пароль" };
  }

  // Генерируем JWT-токен (в данном примере срок действия 1 час)
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    {
      expiresIn: "1h",
    }
  );

  // Можно вернуть только необходимые данные о пользователе
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      phone: user.phone,
      role: user.role,
      firstLogin: user.firstLogin,
      coachId: user.coachId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
});
