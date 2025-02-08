import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const { id } = event.context.params || {};
  const coachId = parseInt(id);

  if (isNaN(coachId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Неверный формат ID тренера",
    });
  }

  // Ищем пользователя с ролью COACH по указанному ID
  const coach = await prisma.user.findFirst({
    where: {
      id: coachId,
      role: "COACH",
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
    },
  });

  if (!coach) {
    throw createError({
      statusCode: 404,
      statusMessage: "Тренер не найден",
    });
  }

  return coach;
});
