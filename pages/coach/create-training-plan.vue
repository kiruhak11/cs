<template>
  <div class="create-plan">
    <h1 class="page-title">Создать тренировочный план</h1>
    <form @submit.prevent="handleCreate">
      <label for="day">День недели:</label>
      <select id="day" v-model="form.dayOfWeek" required>
        <option value="Monday">Понедельник</option>
        <option value="Tuesday">Вторник</option>
        <option value="Wednesday">Среда</option>
        <option value="Thursday">Четверг</option>
        <option value="Friday">Пятница</option>
        <option value="Saturday">Суббота</option>
        <option value="Sunday">Воскресенье</option>
      </select>

      <label for="details">Описание плана:</label>
      <textarea id="details" v-model="form.details" required></textarea>

      <h2>Упражнения</h2>
      <table class="exercises-table" v-if="!isSwapped">
        <thead>
          <tr>
            <th>Нагрузка</th>
            <th>Упражнение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in exercises" :key="index">
            <td>
              <input
                type="text"
                v-model="row.load"
                @input="checkLastRow"
                placeholder="Нагрузка"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="row.exercise"
                @input="checkLastRow"
                placeholder="Упражнение"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table class="exercises-table" v-else>
        <thead>
          <tr>
            <th>Упражнение</th>
            <th>Нагрузка</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in exercises" :key="index">
            <td>
              <input
                type="text"
                v-model="row.exercise"
                @input="checkLastRow"
                placeholder="Упражнение"
              />
            </td>
            <td>
              <input
                type="text"
                v-model="row.load"
                @input="checkLastRow"
                placeholder="Нагрузка"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <label class="select-label">Выберите участников:</label>
      <Multiselect
        v-model="selectedParticipants"
        :options="participantsList"
        :multiple="true"
        track-by="id"
        label="name"
        placeholder="Выберите участников"
      />

      <label class="select-label">Выберите группу участников:</label>
      <Multiselect
        v-model="selectedGroup"
        :options="groupsList"
        :multiple="false"
        track-by="id"
        label="name"
        placeholder="Выберите группу"
      />

      <div class="plan-option">
        <input type="checkbox" id="nextWeek" v-model="form.planForNextWeek" />
        <label for="nextWeek">Создать план для следующей недели</label>
      </div>

      <button type="submit" class="submit-btn">Создать план</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#imports";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

interface CreatePlanForm {
  dayOfWeek: string;
  details: string;
  planForNextWeek?: boolean;
}

interface Participant {
  id: number;
  name: string | null;
  email: string;
}

interface Group {
  id: number;
  name: string;
}

const form = ref<CreatePlanForm>({
  dayOfWeek: "Monday",
  details: "",
  planForNextWeek: false,
});

const selectedParticipants = ref<Participant[]>([]);
const selectedGroup = ref<Group | null>(null);
const participantsList = ref<Participant[]>([]);
const groupsList = ref<Group[]>([]);
const exercises = ref<{ load: string; exercise: string }[]>([
  { load: "", exercise: "" },
]);
const message = ref("");
const error = ref("");
const router = useRouter();
const { isSwapped, swapColumns } = useUser();
function checkLastRow() {
  const lastRow = exercises.value[exercises.value.length - 1];
  if (lastRow.load.trim() !== "" && lastRow.exercise.trim() !== "") {
    exercises.value.push({ load: "", exercise: "" });
  }
}

async function fetchParticipants() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const data = await $fetch("/api/coach/participants", {
      headers: { Authorization: `Bearer ${token}` },
    });
    participantsList.value = data;
  } catch (err) {
    error.value = "Ошибка загрузки участников";
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

async function handleCreate() {
  error.value = "";
  message.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  // Фильтруем упражнения, исключая пустые строки
  const filteredExercises = exercises.value.filter(
    (row) => row.load.trim() !== "" && row.exercise.trim() !== ""
  );
  try {
    await $fetch("/api/coach/create-training-plan", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: {
        ...form.value,
        participants: selectedParticipants.value.map((p) => p.id),
        groupId: selectedGroup.value ? selectedGroup.value.id : null,
        exercises: filteredExercises,
      },
    });
    message.value = "Тренировочный план создан успешно";
  } catch (err) {
    console.error("Ошибка при создании плана:", err);
    error.value = "Ошибка при создании плана";
  }
}

onMounted(() => {
  // Если сегодня суббота (6) или воскресенье (0), устанавливаем план для следующей недели автоматически
  const currentDay = new Date().getDay();
  if (currentDay === 6 || currentDay === 0) {
    form.value.planForNextWeek = true;
  }
  fetchParticipants();
  fetchGroups();
  swapColumns();
});
</script>

<style scoped>
.create-plan {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: var(--pl-background);
  color: var(--pl-text);
  border: 1px solid var(--pl-border);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--pl-box-shadow);
}

.page-title {
  text-align: center;
  font-size: 2rem;
  color: var(--pl-primary);
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

label {
  display: block;
  margin-top: 10px;
  font-weight: 600;
}

select,
textarea,
input[type="text"] {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid var(--pl-border);
  border-radius: 4px;
  box-sizing: border-box;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid var(--pl-border);
  padding: 8px;
  text-align: left;
}

.plan-option {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.plan-option input[type="checkbox"] {
  margin-right: 5px;
}

.submit-btn {
  margin-top: 20px;
  padding: 10px;
  font-size: 16px;
  background-color: var(--pl-primary);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: var(--pl-primary-hover);
}

.error {
  color: var(--pl-accent);
  margin-top: 10px;
}

.message {
  color: var(--pl-primary);
  margin-top: 10px;
}
</style>
