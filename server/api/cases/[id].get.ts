// server/api/cases/[id].get.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = Number(event.context.params?.id);
  const currentCase = await prisma.case.findUnique({
    where: { id },
  });
  if (!currentCase) {
    throw createError({ statusCode: 404, statusMessage: "Кейс не найден" });
  }
  return currentCase;
});
