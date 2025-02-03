// server/api/cases/open.post.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

// Функция выбора лута с учетом вероятностей
function selectLoot(loots: Array<{ probability: number }>): number {
  const totalProbability = loots.reduce(
    (sum, loot) => sum + loot.probability,
    0
  );
  const random = Math.random() * totalProbability;
  let cumulative = 0;
  for (let i = 0; i < loots.length; i++) {
    cumulative += loots[i].probability;
    if (random <= cumulative) {
      return i;
    }
  }
  return loots.length - 1;
}

export default defineEventHandler(async (event) => {
  // Проверка авторизации
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

  // Получение caseId из тела запроса
  const body = await readBody(event);
  const { caseId } = body;
  if (!caseId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Не передан идентификатор кейса",
    });
  }

  // Получаем данные кейса
  const caseRecord = await prisma.case.findUnique({ where: { id: caseId } });
  if (!caseRecord) {
    throw createError({ statusCode: 404, statusMessage: "Кейс не найден" });
  }

  // Получаем данные пользователя (включая баланс)
  const userRecord = await prisma.user.findUnique({ where: { id: userId } });
  if (!userRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: "Пользователь не найден",
    });
  }

  // Проверка баланса
  if (userRecord.balance < caseRecord.price) {
    throw createError({
      statusCode: 400,
      statusMessage: "Недостаточно средств для открытия кейса",
    });
  }

  // Списываем цену кейса с баланса пользователя
  await prisma.user.update({
    where: { id: userId },
    data: { balance: userRecord.balance - caseRecord.price },
  });

  // Получаем возможный лут для кейса
  const loots = await prisma.loot.findMany({ where: { caseId } });
  if (!loots.length) {
    throw createError({
      statusCode: 404,
      statusMessage: "Предметы для данного кейса не найдены",
    });
  }

  // Выбираем случайный предмет с учетом вероятностей
  const index = selectLoot(loots);
  const selectedLoot = loots[index];

  // Добавляем выбранный предмет в инвентарь пользователя
  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      userId,
      lootId: selectedLoot.id,
    },
  });

  return {
    loot: selectedLoot,
    inventoryItem,
  };
});
