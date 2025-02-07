<template>
  <div class="participant-dashboard" v-if="user">
    <h1 class="welcome">Добро пожаловать, {{ user.name || user.email }}</h1>
    <div v-if="activeTab === 'general'" class="tab-content">
      <h2 class="section-title">Общий план</h2>
      <div v-if="trainingPlans.length" class="plans-grid">
        <div
          v-for="plan in sortedTrainingPlans"
          :key="plan.id"
          class="plan-card"
        >
          <div class="plan-header">
            <span class="plan-day">{{ getRussianDay(plan.dayOfWeek) }}</span>
          </div>
          <div class="plan-body">
            <p class="plan-details">{{ plan.details }}</p>
            <!-- Таблица упражнений -->
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
      <div v-else class="empty-state">
        <p>На данный момент тренировочные планы не назначены.</p>
      </div>
    </div>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
  <div v-else class="loading-container">
    <p>Загрузка данных...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUser } from "~/composables/useUser";
import { useRouter } from "#imports";

interface Exercise {
  id: number;
  load: string;
  exercise: string;
}

interface TrainingPlan {
  id: number;
  dayOfWeek: string; // ожидаем английское название, например "Monday"
  details: string;
  exercises: Exercise[];
}

const { user, fetchUser } = useUser();
const router = useRouter();
const activeTab = ref<"general" | "today">("general");
const trainingPlans = ref<TrainingPlan[]>([]);
const achievementText = ref("");
const message = ref("");
const error = ref("");

// Словарь для перевода английских названий дней на русский
const daysMap: Record<string, string> = {
  Monday: "Понедельник",
  Tuesday: "Вторник",
  Wednesday: "Среда",
  Thursday: "Четверг",
  Friday: "Пятница",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};
const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const sortedTrainingPlans = computed(() => {
  return trainingPlans.value
    .slice()
    .sort(
      (a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek)
    );
});

// Функция для получения русского названия дня
const getRussianDay = (englishDay: string): string => {
  return daysMap[englishDay] || englishDay;
};

const currentDayEnglish = new Date().toLocaleDateString("en-US", {
  weekday: "long",
});

// Фильтрация планов для "Сегодня"
// Если план назначен на текущий день (на английском), он отображается в закладке "Сегодня"
const todayPlans = computed(() => {
  return trainingPlans.value.filter(
    (plan) => plan.dayOfWeek === currentDayEnglish
  );
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

async function submitAchievement() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    await $fetch("/api/participant/submit-achievement", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: { achievement: achievementText.value },
    });
    message.value = "Достижения отправлены тренеру";
    achievementText.value = "";
  } catch (err) {
    console.error("Ошибка отправки достижений:", err);
    error.value = "Ошибка отправки достижений";
  }
}

onMounted(() => {
  fetchUser();
  fetchTrainingPlans();
});
</script>

<style scoped lang="scss">
.participant-dashboard {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: var(--pl-background);
  color: var(--pl-text);
  font-family: "Roboto", sans-serif;
}

.loading-container {
  text-align: center;
  font-size: 1.2rem;
  padding: 20px;
}

.welcome {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--pl-primary);
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  button {
    flex: 1;
    padding: 10px;
    font-size: 1rem;
    cursor: pointer;
    background: var(--pl-border);
    border: none;
    border-radius: 4px;
    transition: background-color 0.3s;
    &.active {
      background-color: var(--pl-primary);
      color: #fff;
    }
    &:hover:not(.active) {
      background-color: var(--pl-border);
    }
  }
}

.tab-content {
  border: 1px solid var(--pl-border);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  background: var(--pl-background);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  text-align: center;
  color: var(--pl-primary);
}

.plans-grid {
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
      font-size: 1rem;
      margin-bottom: 10px;
    }
    .exercises {
      .exercises-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.9rem;
        th,
        td {
          border: 1px solid var(--pl-border);
          padding: 8px;
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

.achievement-text {
  width: 100%;
  height: 100px;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid var(--pl-border);
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
}

.submit-btn {
  padding: 12px 20px;
  font-size: 1rem;
  background-color: var(--pl-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: block;
  margin: 0 auto;
  &:hover {
    background-color: var(--pl-primary-hover);
  }
}

.message {
  color: var(--pl-primary);
  text-align: center;
  margin-top: 10px;
  font-weight: bold;
}

.error {
  color: var(--pl-accent);
  text-align: center;
  margin-top: 10px;
  font-weight: bold;
}

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .participant-dashboard {
    padding: 10px;
  }
  .welcome {
    font-size: 1.8rem;
  }
  .section-title {
    font-size: 1.3rem;
  }
  .plans {
    grid-template-columns: 1fr;
  }
}
</style>
