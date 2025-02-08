<template>
  <div class="coach-plans">
    <h1 class="page-title">Тренировочные планы</h1>
    <div v-if="plans.length" class="cards-grid">
      <div v-for="plan in plans" :key="plan.id" class="plan-card">
        <div class="card-header">
          <span class="plan-id">#{{ plan.id }}</span>
          <span class="plan-day">
            <template v-if="editing[plan.id]?.isEditing">
              <select
                class="custom-select"
                v-model="editing[plan.id].dayOfWeek"
              >
                <option
                  v-for="day in daysOfWeek"
                  :key="day.value"
                  :value="day.value"
                >
                  {{ day.label }}
                </option>
              </select>
            </template>
            <template v-else>
              {{ getRussianDay(plan.dayOfWeek) }}
            </template>
          </span>
        </div>
        <div class="card-body">
          <p class="plan-details">{{ plan.details }}</p>
          <p class="plan-group">
            <strong>Группа:</strong>
            <template v-if="editing[plan.id]?.isEditing">
              <select class="custom-select" v-model="editing[plan.id].groupId">
                <option :value="null">Без группы</option>
                <option v-for="grp in groupsList" :key="grp.id" :value="grp.id">
                  {{ grp.name }}
                </option>
              </select>
            </template>
            <template v-else>
              {{ plan.group ? plan.group.name : "-" }}
            </template>
          </p>
          <p class="plan-week">
            <strong>Неделя:</strong>
            <template v-if="editing[plan.id]?.isEditing">
              <select class="custom-select" v-model="editing[plan.id].weekType">
                <option value="current">Текущая неделя</option>
                <option value="next">Следующая неделя</option>
              </select>
            </template>
            <template v-else>
              {{ getWeekLabel(plan.plannedFor) }}
            </template>
          </p>
          <p class="plan-status">
            <strong>Статус:</strong> {{ plan.active ? "Активен" : "Отключен" }}
          </p>
          <!-- Блок упражнений -->
          <div class="exercises-section">
            <h3>Упражнения</h3>
            <template v-if="editing[plan.id]?.isEditing">
              <div
                v-for="(ex, index) in editing[plan.id].exercises"
                :key="index"
                class="exercise-row"
              >
                <input
                  type="text"
                  v-model="ex.load"
                  placeholder="Нагрузка"
                  class="exercise-input"
                />
                <input
                  type="text"
                  v-model="ex.exercise"
                  placeholder="Упражнение"
                  class="exercise-input"
                />
                <button
                  class="btn small-btn delete-btn"
                  @click="removeExercise(plan.id, index)"
                >
                  Удалить
                </button>
              </div>
              <button
                class="btn add-exercise-btn"
                @click="addExercise(plan.id)"
              >
                Добавить упражнение
              </button>
            </template>
            <template v-else>
              <div v-if="plan.exercises && plan.exercises.length">
                <table class="exercises-table">
                  <thead>
                    <tr>
                      <th>Нагрузка</th>
                      <th>Упражнение</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(exercise, idx) in plan.exercises"
                      :key="exercise.id || idx"
                    >
                      <td>{{ exercise.load }}</td>
                      <td>{{ exercise.exercise }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else>
                <p>Нет упражнений</p>
              </div>
            </template>
          </div>
          <div class="actions">
            <template v-if="editing[plan.id]?.isEditing">
              <button
                class="btn save-btn"
                @click="savePlan(plan)"
                :disabled="loadingPlan"
              >
                Сохранить
              </button>
              <button class="btn cancel-btn" @click="cancelEdit(plan)">
                Отмена
              </button>
            </template>
            <template v-else>
              <button
                class="btn toggle-btn"
                @click="togglePlan(plan)"
                :disabled="loadingPlan"
              >
                {{ plan.active ? "Отключить" : "Включить" }}
              </button>
              <button
                class="btn edit-btn"
                @click="editPlan(plan)"
                :disabled="loadingPlan"
              >
                Редактировать
              </button>
              <button
                class="btn delete-btn"
                @click="
                  openModal(
                    'Удалить план',
                    'Вы действительно хотите удалить этот план?',
                    'Удалить',
                    () => deletePlan(plan)
                  )
                "
                :disabled="loadingPlan"
              >
                Удалить
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>Нет тренировочных планов</p>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#imports";
import { useUser } from "~/composables/useUser";
import { Body } from "#components";

// Интерфейсы
interface Group {
  id: number;
  name: string;
}

interface Exercise {
  id?: number;
  load: string;
  exercise: string;
}

interface TrainingPlan {
  id: number;
  dayOfWeek: string;
  details: string;
  groupId?: number | null;
  group?: Group | null;
  active: boolean;
  exercises: Exercise[];
  plannedFor: string; // ISO строка
}

const router = useRouter();
const { user, fetchUser } = useUser();
const plans = ref<TrainingPlan[]>([]);
const groupsList = ref<Group[]>([]);
const error = ref("");
const message = ref("");
const loadingPlan = ref(false);

// Объект для режима редактирования плана
const editing = ref<{
  [planId: number]: {
    isEditing: boolean;
    dayOfWeek: string;
    groupId: number | null;
    exercises: Exercise[];
    weekType: string; // "current", "next"
  };
}>({});

// Опции для дней недели
const daysOfWeek = [
  { value: "Monday", label: "Понедельник" },
  { value: "Tuesday", label: "Вторник" },
  { value: "Wednesday", label: "Среда" },
  { value: "Thursday", label: "Четверг" },
  { value: "Friday", label: "Пятница" },
  { value: "Saturday", label: "Суббота" },
  { value: "Sunday", label: "Воскресенье" },
];

// Словарь для перевода дней
const daysMap: Record<string, string> = {
  Monday: "Понедельник",
  Tuesday: "Вторник",
  Wednesday: "Среда",
  Thursday: "Четверг",
  Friday: "Пятница",
  Saturday: "Суббота",
  Sunday: "Воскресенье",
};
const getRussianDay = (englishDay: string): string =>
  daysMap[englishDay] || englishDay;

// Функция определения типа недели на основе plannedFor
function determineWeekType(plannedFor: string): string {
  const planDate = new Date(plannedFor);
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mondayThisWeek = new Date(now);
  mondayThisWeek.setDate(now.getDate() + diffToMonday);
  mondayThisWeek.setHours(0, 0, 0, 0);
  const mondayNextWeek = new Date(mondayThisWeek);
  mondayNextWeek.setDate(mondayThisWeek.getDate() + 7);
  if (planDate >= mondayThisWeek && planDate < mondayNextWeek) {
    return "current";
  } else if (planDate >= mondayNextWeek) {
    return "next";
  } else {
    return "outdated";
  }
}

function getWeekLabel(plannedFor: string): string {
  const weekType = determineWeekType(plannedFor);
  if (weekType === "current") return "Текущая неделя";
  if (weekType === "next") return "Следующая неделя";
  return "Устарел";
}

async function fetchExercisesForPlan(plan: TrainingPlan) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const exercisesData = await $fetch(
      `/api/coach/training-plan/${plan.id}/exercises`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    plan.exercises = Array.isArray(exercisesData) ? exercisesData : [];
  } catch (err) {
    console.error(`Ошибка загрузки упражнений для плана ${plan.id}:`, err);
  }
}

async function fetchPlans() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const data = await $fetch("/api/coach/training-plans", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Полученные планы:", data);
    plans.value = data.map((plan: any) => ({
      ...plan,
      exercises: Array.isArray(plan.exercises)
        ? plan.exercises
        : plan.exercises || [],
    }));
    // Для каждого плана подтягиваем упражнения
    await Promise.all(plans.value.map((plan) => fetchExercisesForPlan(plan)));
    console.log("Преобразованные планы:", plans.value);
  } catch (err) {
    error.value = "Ошибка загрузки планов";
  }
}

async function fetchGroups() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const data = await $fetch("/api/coach/groups", {
      headers: { Authorization: `Bearer ${token}` },
    });
    groupsList.value = data;
  } catch (err) {
    error.value = "Ошибка загрузки групп";
  }
}

async function togglePlan(plan: TrainingPlan) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  loadingPlan.value = true;
  try {
    await $fetch("/api/coach/disable-training-plan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: { planId: plan.id, active: !plan.active },
    });
    plan.active = !plan.active;
  } catch (err) {
    error.value = "Ошибка обновления статуса плана";
  } finally {
    loadingPlan.value = false;
  }
}

async function deletePlan(plan: TrainingPlan) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }

  loadingPlan.value = true;
  try {
    await $fetch(`/api/coach/training-plan/${plan.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    plans.value = plans.value.filter((p) => p.id !== plan.id);
  } catch (err) {
    error.value = "Ошибка при удалении плана";
  } finally {
    loadingPlan.value = false;
  }
}

function editPlan(plan: TrainingPlan) {
  editing.value[plan.id] = {
    isEditing: true,
    dayOfWeek: plan.dayOfWeek,
    groupId: plan.group ? plan.group.id : null,
    exercises: plan.exercises ? JSON.parse(JSON.stringify(plan.exercises)) : [],
    weekType: determineWeekType(plan.plannedFor),
  };
}

function cancelEdit(plan: TrainingPlan) {
  if (editing.value[plan.id]) {
    editing.value[plan.id].isEditing = false;
  }
}

function addExercise(planId: number) {
  if (editing.value[planId]) {
    editing.value[planId].exercises.push({ load: "", exercise: "" });
  }
}

function removeExercise(planId: number, index: number) {
  if (editing.value[planId]) {
    editing.value[planId].exercises.splice(index, 1);
  }
}

async function savePlan(plan: TrainingPlan) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  if (!editing.value[plan.id]) return;
  const updatedDay = editing.value[plan.id].dayOfWeek;
  const updatedGroupId = editing.value[plan.id].groupId;
  const updatedExercises = editing.value[plan.id].exercises;
  const updatedWeekType = editing.value[plan.id].weekType;
  loadingPlan.value = true;
  console.log("Сохраняем план", {
    planId: plan.id,
    dayOfWeek: updatedDay,
    groupId: updatedGroupId,
    exercises: updatedExercises,
    weekType: updatedWeekType,
  });
  try {
    await $fetch("/api/coach/update-training-plan", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        planId: plan.id,
        dayOfWeek: updatedDay,
        groupId: updatedGroupId,
        exercises: updatedExercises,
        weekType: updatedWeekType,
      },
    });
    await fetchPlans();
    editing.value[plan.id].isEditing = false;
    openModal(
      "Успех",
      `План #${
        plan.id
      } успешно обновлен:\nНагрузка   Упражнение${updatedExercises.map(
        (ex: any) => `\n${ex.load} ${ex.exercise}`
      )}`,
      "Oтлично"
    );
  } catch (err) {
    error.value = "Ошибка при обновлении плана";
  } finally {
    loadingPlan.value = false;
  }
}

onMounted(() => {
  fetchPlans();
  fetchGroups();
});
</script>

<style scoped lang="scss">
.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 5px 10px;
  font-size: 0.9rem;
  border: 1px solid var(--pl-border);
  border-radius: 4px;
  background-color: #fff;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%204%205'%3E%3Cpath%20fill='%23666'%20d='M2%205L0%200h4L2%205z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 8px 10px;
}

.coach-plans {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: var(--pl-background);
  color: var(--pl-text);
  font-family: "Roboto", sans-serif;

  .page-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 30px;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }

  .plan-card {
    background: var(--pl-background);
    border: 1px solid var(--pl-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--pl-box-shadow);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px var(--pl-box-shadow-hover);
    }

    .card-header {
      background-color: var(--pl-primary);
      padding: 10px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .plan-id {
        font-size: 0.9rem;
      }

      .plan-day {
        font-size: 1.1rem;
        font-weight: bold;
      }
    }

    .card-body {
      padding: 15px;

      .plan-details {
        font-size: 1rem;
        margin-bottom: 10px;
      }

      .plan-group,
      .plan-status,
      .plan-week {
        font-size: 0.9rem;
        margin-bottom: 10px;
      }

      .exercises-section {
        margin-top: 15px;

        h3 {
          font-size: 1.1rem;
          margin-bottom: 8px;
          color: var(--pl-primary);
        }

        .exercises-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          th,
          td {
            border: 1px solid var(--pl-border);
            padding: 8px;
            text-align: left;
            /* Добавляем перенос слов в ячейках */
            white-space: normal;
            overflow-wrap: break-word;
          }
          th {
            background-color: var(--pl-primary-hover);
            color: #fff;
          }
        }

        .exercise-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
          .exercise-input {
            flex: 1;
            padding: 5px;
            border: 1px solid var(--pl-border);
            border-radius: 4px;
            font-size: 0.9rem;
            /* Добавляем перенос слов в полях ввода */
            white-space: normal;
            overflow-wrap: break-word;
          }
          button {
            background-color: var(--pl-link);
            color: #fff;
            border: none;
            padding: 5px 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
            &:hover {
              background-color: var(--pl-link-hover);
            }
          }
        }

        .add-exercise-btn {
          background-color: var(--pl-primary);
          color: #fff;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s;
          &:hover {
            background-color: var(--pl-primary-hover);
          }
        }
      }

      .actions {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 15px;

        .btn {
          padding: 8px 12px;
          font-size: 0.85rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .toggle-btn {
          background-color: var(--pl-primary);
          color: #fff;
          &:hover {
            background-color: var(--pl-primary-hover);
          }
        }

        .edit-btn {
          background-color: var(--pl-accent);
          color: #fff;
          &:hover {
            background-color: var(--pl-accent-hover);
          }
        }

        .delete-btn {
          background-color: var(--pl-link);
          color: #fff;
          &:hover {
            background-color: var(--pl-link-hover);
          }
        }

        .save-btn {
          background-color: var(--pl-primary);
          color: #fff;
          &:hover {
            background-color: var(--pl-primary-hover);
          }
        }

        .cancel-btn {
          background-color: var(--pl-border);
          color: var(--pl-text);
          &:hover {
            background-color: var(--pl-border);
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 20px;
    color: var(--pl-text);
  }

  .error {
    color: var(--pl-accent);
    text-align: center;
    margin-top: 10px;
    font-weight: bold;
  }

  .message {
    color: var(--pl-primary);
    text-align: center;
    margin-top: 10px;
    font-weight: bold;
  }
}

@media (max-width: 600px) {
  .coach-plans {
    padding: 10px;
    .page-title {
      font-size: 1.8rem;
    }
    .cards-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
