<template>
  <div class="index">
    <div v-if="loading" class="loading">
      <p>Загрузка данных...</p>
    </div>
    <div v-else-if="user">
      <!-- Для участников отображается план на сегодня -->
      <template v-if="user.role === 'PARTICIPANT'">
        <h1 class="welcome">Добро пожаловать, {{ user.name || user.email }}</h1>
        <h2 class="today-title">План на сегодня ({{ daysMap[currentDay] }})</h2>
        <div v-if="todayPlans.length" class="plans">
          <div v-for="plan in todayPlans" :key="plan.id" class="plan-card">
            <div class="plan-header">
              <span class="plan-day">{{ daysMap[plan.dayOfWeek] }}</span>
            </div>
            <div class="plan-body">
              <p class="plan-details">{{ plan.details }}</p>
              <!-- Если у плана есть упражнения, выводим их в виде таблицы -->
              <div
                v-if="plan.exercises && plan.exercises.length"
                class="exercises"
              >
                <table class="exercises-table">
                  <thead>
                    <tr>
                      <th>Нагрузка</th>
                      <th>Упражнение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="exercise in plan.exercises" :key="exercise.id">
                      <td>{{ exercise.load }}</td>
                      <td>{{ exercise.exercise }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="no-plan">
          <p>Сегодня нет тренировочного плана.</p>
        </div>
      </template>

      <!-- Для тренеров отображается краткая панель -->
      <template v-else-if="user.role === 'COACH'">
        <div class="coach-dashboard">
          <h1 class="welcome">
            Добро пожаловать, тренер {{ user.name || user.email }}
          </h1>
          <div class="coach-info">
            <p>Управляйте тренировочными планами, группами и участниками.</p>
            <NuxtLink to="/coach/dashboard" class="btn">
              Перейти в панель тренера
            </NuxtLink>
          </div>
        </div>
      </template>
    </div>
    <div v-else class="guest">
      <p>
        Пожалуйста, <NuxtLink to="/login">войдите</NuxtLink> или
        <NuxtLink to="/register">зарегистрируйтесь</NuxtLink>.
      </p>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "#imports";

interface Exercise {
  id: number;
  load: string;
  exercise: string;
}
const daysMap: Record<string, string> = {
  Monday: "Понедельник",
  Tuesday: "Вторник",
  Wednesday: "Среда",
  Thursday: "Четверг",
  Friday: "Пятница",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};
interface TrainingPlan {
  id: number;
  dayOfWeek: string;
  details: string;
  exercises: Exercise[];
}

const { user, fetchUser } = useUser();
const router = useRouter();
const loading = ref(true);
const trainingPlans = ref<TrainingPlan[]>([]);
const error = ref("");

const currentDay = new Date().toLocaleDateString("en-US", {
  weekday: "long",
});
// Вычисляем планы для текущего дня (предполагается, что dayOfWeek хранится на английском)
const todayPlans = computed(() => {
  return trainingPlans.value.filter((plan) => plan.dayOfWeek === currentDay);
});

async function fetchTrainingPlans() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const data = await $fetch("/api/participant/training-plans", {
      headers: { Authorization: `Bearer ${token}` },
    });
    trainingPlans.value = data;
  } catch (err) {
    console.error("Ошибка загрузки планов:", err);
    error.value = "Ошибка загрузки планов";
  }
}

onMounted(async () => {
  await fetchUser();
  await fetchTrainingPlans();
  loading.value = false;
});
</script>

<style scoped lang="scss">
.index {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--pl-background);
  color: var(--pl-text);

  .loading {
    text-align: center;
    font-size: 1.2rem;
  }

  .welcome {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--pl-text);
  }

  .today-title {
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .plans {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .plan-card {
    background: var(--pl-background);
    border: 1px solid var(--pl-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--pl-box-shadow);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px var(--pl-box-shadow-hover);
    }

    .plan-header {
      background-color: var(--pl-primary);
      padding: 10px;
      text-align: center;
      color: #fff;
      font-weight: bold;
      text-transform: uppercase;
    }

    .plan-body {
      padding: 15px;

      .plan-details {
        margin-bottom: 10px;
        font-size: 1rem;
      }

      .exercises {
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          th,
          td {
            padding: 8px;
            border: 1px solid var(--pl-border);
            text-align: left;
          }

          th {
            background-color: var(--pl-primary-hover);
            color: #fff;
          }
        }
      }
    }
  }

  .no-plan {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 20px;
  }

  .coach-dashboard {
    text-align: center;
    .coach-info {
      margin-top: 20px;
      p {
        font-size: 1.2rem;
      }
      .btn {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        background-color: var(--pl-primary);
        color: #fff;
        text-decoration: none;
        border-radius: 8px;
        transition: background-color 0.3s ease;
        &:hover {
          background-color: var(--pl-primary-hover);
        }
      }
    }
  }

  .guest {
    text-align: center;
    font-size: 1.2rem;
    a {
      color: var(--pl-link);
      font-weight: bold;
      &:hover {
        color: var(--pl-link-hover);
      }
    }
  }

  .error-message {
    color: var(--pl-accent);
    text-align: center;
    margin-top: 20px;
  }
}

/* Адаптив */
@media (max-width: 600px) {
  .index {
    padding: 10px;

    .welcome {
      font-size: 1.8rem;
    }

    .today-title {
      font-size: 1.3rem;
    }

    .plans {
      grid-template-columns: 1fr;
    }
  }
}
</style>
