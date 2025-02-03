// server/api/cases.get.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const cases = await prisma.case.findMany();
    return cases;
  } catch (error) {
    // Можно добавить более подробную обработку ошибок
    return { error: "Ошибка при получении данных" };
  }
});
