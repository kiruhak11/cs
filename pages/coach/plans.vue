<template>
  <div class="coach-plans">
    <h1>Тренировочные планы</h1>
    <div v-if="plans.length">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>День недели</th>
            <th>Описание</th>
            <th>Группа</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in plans" :key="plan.id">
            <td>{{ plan.id }}</td>
            <td>{{ plan.dayOfWeek }}</td>
            <td>{{ plan.details }}</td>
            <td>{{ plan.group ? plan.group.name : '-' }}</td>
            <td>{{ plan.active ? 'Активен' : 'Отключен' }}</td>
            <td>
              <button @click="togglePlan(plan)" :disabled="loadingPlan">
                {{ plan.active ? 'Отключить' : 'Включить' }}
              </button>
              <!-- Кнопка для удаления плана -->
              <button @click="deletePlan(plan)" :disabled="loadingPlan">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>Нет тренировочных планов</p>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '#imports'

interface Group {
  id: number;
  name: string;
}

interface TrainingPlan {
  id: number;
  dayOfWeek: string;
  details: string;
  groupId?: number | null;
  group?: Group | null;
  active: boolean;
}

const plans = ref<TrainingPlan[]>([]);
const error = ref('');
const loadingPlan = ref(false);
const router = useRouter();

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
    plans.value = data;
  } catch (err) {
    error.value = "Ошибка загрузки планов";
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
      body: {
        planId: plan.id,
        active: !plan.active,
      },
    });
    // Обновляем статус плана локально
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
  // Подтверждение удаления
  if (!window.confirm(`Вы действительно хотите удалить план ID ${plan.id}?`)) {
    return;
  }
  loadingPlan.value = true;
  try {
    await $fetch(`/api/coach/training-plan/${plan.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // После удаления обновляем локальный список планов
    plans.value = plans.value.filter(p => p.id !== plan.id);
  } catch (err) {
    error.value = "Ошибка при удалении плана";
  } finally {
    loadingPlan.value = false;
  }
}

onMounted(() => {
  fetchPlans();
});
</script>

<style scoped>
.coach-plans {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}

.error {
  color: red;
  margin-top: 10px;
}

button {
  padding: 5px 10px;
  cursor: pointer;
  margin-right: 5px;
}
</style>
