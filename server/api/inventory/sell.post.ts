// server/api/inventory/sell.post.ts
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || "supersecret";

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

  // Получение id предмета из тела запроса
  const body = await readBody(event);
  const { itemId } = body;
  if (!itemId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Не передан идентификатор предмета",
    });
  }

  // Получаем предмет из инвентаря (с проверкой, что он принадлежит пользователю)
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: itemId },
    include: { loot: true },
  });
  if (!inventoryItem || inventoryItem.userId !== userId) {
    throw createError({
      statusCode: 404,
      statusMessage: "Предмет не найден или не принадлежит пользователю",
    });
  }

  const salePrice = inventoryItem.loot.price;

  // Удаляем предмет из инвентаря и обновляем баланс пользователя
  await prisma.$transaction(
    async (tx: {
      inventoryItem: { delete: (arg0: { where: { id: any } }) => any };
      user: {
        update: (arg0: {
          where: { id: number };
          data: { balance: { increment: number } };
        }) => any;
      };
    }) => {
      await tx.inventoryItem.delete({ where: { id: itemId } });
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: salePrice } },
      });
    }
  );

  return { message: "Предмет успешно продан", salePrice };
});
