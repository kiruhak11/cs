<template>
  <div class="create-group">
    <h1 class="page-title">Создать группу участников</h1>
    <form @submit.prevent="handleCreate" class="group-form">
      <div class="form-field">
        <label for="groupName">Название группы:</label>
        <input type="text" id="groupName" v-model="form.name" required />
      </div>
      <div class="form-field">
        <label for="participants">Выберите участников:</label>
        <!-- Используем vue-multiselect для удобства -->
        <Multiselect
          v-model="selectedParticipants"
          :options="participantsList"
          :multiple="true"
          track-by="id"
          label="name"
          placeholder="Выберите участников"
          class="multiselect"
        />
      </div>
      <div class="form-field plan-option">
        <input type="checkbox" id="nextWeek" v-model="form.planForNextWeek" />
        <label for="nextWeek">Создать план для следующей недели</label>
      </div>
      <button type="submit" class="submit-btn">Создать группу</button>
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

interface CreateGroupForm {
  name: string;
  planForNextWeek?: boolean;
}

interface Participant {
  id: number;
  name: string | null;
  email: string;
}

const form = ref<CreateGroupForm>({ name: "", planForNextWeek: false });
const selectedParticipants = ref<Participant[]>([]);
const participantsList = ref<Participant[]>([]);
const message = ref("");
const error = ref("");
const router = useRouter();

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

async function handleCreate() {
  error.value = "";
  message.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    await $fetch("/api/coach/create-group", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        ...form.value,
        participants: selectedParticipants.value.map((p) => p.id),
      },
    });
    message.value = "Группа успешно создана";
    form.value.name = "";
    selectedParticipants.value = [];
  } catch (err) {
    console.error("Ошибка при создании группы:", err);
    error.value = "Ошибка при создании группы";
  }
}

onMounted(() => {
  fetchParticipants();
});
</script>

<style scoped lang="scss">
.create-group {
  max-width: 500px;
  margin: 40px auto;
  padding: 30px;
  background: var(--pl-background);
  border: 1px solid var(--pl-border);
  border-radius: 12px;
  box-shadow: 0 4px 8px var(--pl-box-shadow);
  color: var(--pl-text);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px var(--pl-box-shadow-hover);
  }

  .page-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .group-form {
    display: flex;
    flex-direction: column;
    gap: 15px;

    .form-field {
      display: flex;
      flex-direction: column;

      label {
        font-weight: 600;
        margin-bottom: 5px;
      }

      input[type="text"],
      select,
      textarea {
        padding: 10px;
        font-size: 1rem;
        border: 1px solid var(--pl-border);
        border-radius: 4px;
        transition: border-color 0.3s;

        &:focus {
          border-color: var(--pl-primary);
          outline: none;
        }
      }

      &.plan-option {
        flex-direction: row;
        align-items: center;
        input[type="checkbox"] {
          margin-right: 10px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .multiselect {
      .multiselect__tags {
        min-height: 40px;
      }
    }

    .submit-btn {
      margin-top: 20px;
      padding: 12px;
      font-size: 1rem;
      background-color: var(--pl-primary);
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: var(--pl-primary-hover);
      }
    }
  }

  .error {
    color: var(--pl-accent);
    text-align: center;
    margin-top: 10px;
  }

  .message {
    color: var(--pl-primary);
    text-align: center;
    margin-top: 10px;
  }
}

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .create-group {
    max-width: 90%;
    padding: 20px;

    .page-title {
      font-size: 1.8rem;
    }

    .group-form {
      gap: 10px;

      input[type="text"],
      select,
      textarea {
        font-size: 0.9rem;
        padding: 8px;
      }

      .submit-btn {
        padding: 10px;
        font-size: 0.9rem;
      }
    }
  }
}
</style>
