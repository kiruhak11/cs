<template>
  <div class="coach-participants">
    <h1 class="page-title">Список участников</h1>
    <div v-if="participants.length" class="participants-grid">
      <div
        v-for="participant in participants"
        :key="participant.id"
        class="participant-card"
      >
        <div class="participant-info">
          <h2 class="participant-name">
            {{ participant.name || participant.email }}
          </h2>
          <p class="participant-email">{{ participant.email }}</p>
        </div>
        <button class="delete-btn" @click="deleteParticipant(participant.id)">
          Удалить
        </button>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>У вас пока нет участников</p>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="message" class="success-message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#imports";

interface Participant {
  id: number;
  name: string | null;
  email: string;
}

const participants = ref<Participant[]>([]);
const error = ref("");
const message = ref("");
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
    participants.value = data;
  } catch (err) {
    error.value = "Ошибка загрузки участников";
  }
}

async function deleteParticipant(participantId: number) {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  if (!window.confirm("Вы действительно хотите удалить этого участника?"))
    return;
  try {
    await $fetch(`/api/coach/participants/${participantId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    message.value = "Участник успешно удалён";
    await fetchParticipants();
  } catch (err) {
    error.value = "Ошибка при удалении участника";
  }
}

onMounted(() => {
  fetchParticipants();
});
</script>

<style scoped lang="scss">
.coach-participants {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--pl-background);
  color: var(--pl-text);

  .page-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 30px;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .participants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }

  .participant-card {
    background: #fff;
    border: 1px solid var(--pl-border);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px var(--pl-box-shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px var(--pl-box-shadow-hover);
    }

    .participant-info {
      margin-bottom: 20px;

      .participant-name {
        font-size: 1.4rem;
        margin-bottom: 5px;
        color: var(--pl-text);
        font-weight: 600;
      }

      .participant-email {
        font-size: 1rem;
        color: var(--pl-link);
      }
    }

    .delete-btn {
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

  .empty-state {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 20px;
    color: var(--pl-text);
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

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .coach-participants {
    padding: 10px;
    .page-title {
      font-size: 1.8rem;
    }
  }
}
</style>
