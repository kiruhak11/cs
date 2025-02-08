<template>
  <div class="add-participants">
    <h1 class="page-title">Добавить участников в группу "{{ group?.name }}"</h1>
    <!-- Кнопка для удаления группы -->
    <div class="group-actions">
      <button
        class="delete-group-btn"
        @click="
          openModal(
            'Удалить группу',
            'Вы действительно хотите удалить эту группу?',
            'Удалить',
            () => deleteGroup()
          )
        "
      >
        Удалить группу
      </button>
    </div>

    <!-- Текущий список участников группы -->
    <div v-if="groupParticipants.length" class="participants-list">
      <h2>Текущие участники группы:</h2>
      <ul>
        <li
          v-for="participant in groupParticipants"
          :key="participant.id"
          class="participant-item"
        >
          <div class="participant-info">
            <span class="participant-name">{{
              participant.name || participant.email
            }}</span>
            <span class="participant-email">{{ participant.email }}</span>
          </div>
          <button
            class="delete-btn"
            @click="
              openModal(
                'Удалить участника',
                'Вы действительно хотите удалить этого участника?',
                'Удалить',
                () => removeParticipant(participant.id)
              )
            "
          >
            Удалить
          </button>
        </li>
      </ul>
    </div>
    <div v-else class="empty-state">
      <p>В группе пока нет участников.</p>
    </div>

    <!-- Сообщения -->
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="message" class="success-message">{{ message }}</div>

    <!-- Форма добавления новых участников с vue-multiselect -->
    <div v-if="participantsList.length" class="add-form">
      <Multiselect
        v-model="selectedParticipants"
        :options="participantsList"
        :multiple="true"
        track-by="id"
        label="name"
        placeholder="Выберите участников для добавления"
        class="multiselect"
      />
      <button class="add-btn" @click="handleAddParticipants">
        Добавить участников
      </button>
    </div>
    <div v-else class="empty-state">
      <p>Нет доступных участников для добавления.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "#imports";
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.css";

interface Participant {
  id: number;
  name: string | null;
  email: string;
}

interface Group {
  id: number;
  name: string | null;
}

const router = useRouter();
const route = useRoute();

const group = ref<Group | null>(null);
const groupParticipants = ref<Participant[]>([]);
const participantsList = ref<Participant[]>([]);
const selectedParticipants = ref<Participant[]>([]);
const message = ref("");
const error = ref("");

async function fetchGroup() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    // Получаем данные о группе
    const groupData = await $fetch(`/api/coach/group/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    group.value = groupData;
  } catch (err) {
    error.value = "Ошибка загрузки информации о группе";
  }
}

async function fetchGroupParticipants() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    // Получаем текущий список участников группы через GET‑эндпоинт
    const data = await $fetch(
      `/api/coach/group/${route.params.id}/add-participants`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    groupParticipants.value = data;
  } catch (err) {
    error.value = "Ошибка загрузки участников группы";
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

async function handleAddParticipants() {
  message.value = "";
  error.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    await $fetch(`/api/coach/group/${route.params.id}/add-participants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        participants: selectedParticipants.value.map((p) => p.id),
      },
    });
    message.value = "Участники успешно добавлены";
    await fetchGroup();
    await fetchGroupParticipants();
  } catch (err) {
    error.value = "Ошибка при добавлении участников";
  }
}

async function removeParticipant(participantId: number) {
  message.value = "";
  error.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    await $fetch(`/api/coach/group/${route.params.id}/remove-participant`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: { participantId },
    });
    message.value = "Участник успешно удалён";
    await fetchGroupParticipants();
  } catch (err) {
    error.value = "Ошибка при удалении участника";
  }
}

async function deleteGroup() {
  message.value = "";
  error.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    await $fetch(`/api/coach/group/${route.params.id}/delete`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    message.value = "Группа успешно удалена";
    console.log("Группа удалена");
    // После удаления перенаправляем на список групп
    router.push("/coach/groups");
  } catch (err) {
    console.error("Ошибка при удалении группы:", err);
    error.value = "Ошибка при удалении группы";
  }
}

onMounted(() => {
  fetchGroup();
  fetchGroupParticipants();
  fetchParticipants();
});
</script>

<style scoped lang="scss">
.add-participants {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: var(--pl-background);
  border: 1px solid var(--pl-border);
  border-radius: 8px;
  box-shadow: 0 2px 4px var(--pl-box-shadow);
  color: var(--pl-text);

  .page-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .group-actions {
    text-align: center;
    margin-bottom: 20px;
    .delete-group-btn {
      background-color: var(--pl-accent);
      color: #fff;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      &:hover {
        background-color: var(--pl-accent-hover);
      }
    }
  }

  .participants-list {
    margin-bottom: 20px;

    h2 {
      font-size: 1.5rem;
      margin-bottom: 10px;
      color: var(--pl-primary);
    }

    ul {
      list-style: none;
      padding: 0;

      .participant-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid var(--pl-border);
        transition: background-color 0.3s ease;

        &:hover {
          background-color: var(--background-color-hover);
        }

        .participant-info {
          display: flex;
          flex-direction: column;

          .participant-name {
            font-weight: 600;
            color: var(--pl-text);
          }

          .participant-email {
            font-size: 0.9rem;
            color: var(--pl-link);
          }
        }

        .delete-btn {
          background-color: var(--pl-accent);
          color: #fff;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          &:hover {
            background-color: var(--pl-accent-hover);
          }
        }
      }
    }
  }

  .add-form {
    margin-top: 20px;
    .multiselect {
      margin-bottom: 10px;
    }
    .add-btn {
      background-color: var(--pl-primary);
      color: #fff;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      &:hover {
        background-color: var(--pl-primary-hover);
      }
    }
  }

  .error-message {
    color: var(--pl-accent);
    text-align: center;
    margin-top: 20px;
  }

  .success-message {
    color: var(--pl-primary);
    text-align: center;
    margin-top: 20px;
  }
}

/* Адаптив */
@media (max-width: 600px) {
  .add-participants {
    padding: 15px;

    .page-title {
      font-size: 1.8rem;
    }

    .participants-list {
      h2 {
        font-size: 1.3rem;
      }
      .participant-item {
        flex-direction: column;
        align-items: flex-start;
        .delete-btn {
          align-self: flex-end;
          margin-top: 10px;
        }
      }
    }
  }
}
</style>
