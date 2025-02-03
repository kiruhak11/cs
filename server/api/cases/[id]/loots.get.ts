// server/api/cases/[id]/loots.get.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const caseId = Number(event.context.params?.id);
  const loots = await prisma.loot.findMany({
    where: { caseId },
  });
  return loots;
});
