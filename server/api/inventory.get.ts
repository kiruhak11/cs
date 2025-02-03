// server/api/inventory.get.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

export default defineEventHandler(async (event) => {
  // Получаем заголовок авторизации
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

  let userId: number;
  try {
    const decoded = jwt.verify(token, secret) as { id: number };
    userId = decoded.id;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: неверный токен",
    });
  }

  // Получаем предметы инвентаря для пользователя вместе с информацией о предмете (loot)
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { userId },
    include: {
      loot: true,
    },
  });

  return inventoryItems;
});
