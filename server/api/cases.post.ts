// server/api/cases.post.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // Всегда используем readBody для получения данных из запроса
  const body = await readBody(event);

  try {
    const newCase = await prisma.case.create({
      data: {
        name: body.name,
        image: body.image,
        rarity: body.rarity,
        price: body.price,
      },
    });
    return newCase;
  } catch (error) {
    // Для удобства отладки выводим дополнительные данные об ошибке
    return { error: "Ошибка при создании кейса", details: error };
  }
});
