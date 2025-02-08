<template>
  <div class="account-container">
    <h1>Личный кабинет</h1>
    <div v-if="loading" class="loading">
      <p>Загрузка данных...</p>
    </div>
    <div v-else-if="user" class="account-card">
      <div class="user-info">
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p v-if="user.username">
          <strong>Username:</strong> {{ user.username }}
        </p>
        <p v-if="user.name"><strong>Имя:</strong> {{ user.name }}</p>
        <p v-if="user.role">
          <strong>Роль:</strong>
          {{ user.role === "COACH" ? "Тренер" : "Участник" }}
        </p>
        <p v-if="user.role === 'PARTICIPANT'">
          <strong>Тренер:</strong> {{ coachName() }}
        </p>
        <p>
          <strong>Дата регистрации:</strong>
          {{ new Date(user.createdAt).toLocaleString() }}
        </p>
      </div>
      <button @click="handleLogout" class="logout-btn">Выйти</button>
    </div>
    <div v-else class="guest">
      <p>
        Пользователь не аутентифицирован.
        <NuxtLink to="/login">Войдите</NuxtLink> или
        <NuxtLink to="/register">зарегистрируйтесь</NuxtLink>.
      </p>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useUser } from "~/composables/useUser";

const { user, loading, error, fetchUser } = useUser();
const router = useRouter();

// Реф для данных тренера
const coach = ref<{ id: number; name: string } | null>(null);

async function fetchCoach() {
  if (user.value && user.value.coachId) {
    const token = localStorage.getItem("token");
    try {
      // Предполагаем, что API для получения тренера по ID доступен по маршруту /api/coach/[id]
      const data = await $fetch(`/api/coach/${user.value.coachId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      coach.value = data as { id: number; name: string };
    } catch (e) {
      console.error("Ошибка загрузки тренера:", e);
    }
  }
}

function coachName(): string {
  return coach.value?.name || "Не указан";
}

function handleLogout() {
  localStorage.removeItem("token");
  user.value = null;
  router.push("/login");
}

onMounted(async () => {
  await fetchUser();
  // Если пользователь-участник, пытаемся получить данные тренера
  if (user.value && user.value.role === "PARTICIPANT" && user.value.coachId) {
    await fetchCoach();
  }
});
</script>

<style scoped lang="scss">
.account-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  color: var(--pl-text);

  h1 {
    text-align: center;
    margin-bottom: 20px;
    font-size: 2rem;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .loading {
    text-align: center;
    font-size: 1.2rem;
  }

  .account-card {
    background: var(--pl-background);
    border: 1px solid var(--pl-border);
    border-radius: 12px;
    box-shadow: 0 4px 8px var(--pl-box-shadow);
    padding: 20px;
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 6px 12px var(--pl-box-shadow-hover);
    }

    .user-info {
      p {
        font-size: 1rem;
        margin: 8px 0;
        strong {
          font-weight: 600;
          margin-right: 5px;
        }
      }
    }

    .logout-btn {
      display: block;
      width: 100%;
      margin-top: 20px;
      padding: 12px;
      font-size: 1rem;
      background-color: var(--pl-accent);
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: var(--pl-accent-hover);
      }
    }
  }

  .guest {
    text-align: center;
    font-size: 1.2rem;

    a {
      color: var(--pl-link);
      font-weight: bold;
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: var(--pl-link-hover);
      }
    }
  }

  .error {
    color: var(--pl-accent);
    text-align: center;
    margin-top: 20px;
    font-weight: bold;
  }
}

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .account-container {
    padding: 15px;

    h1 {
      font-size: 1.8rem;
    }

    .account-card {
      padding: 15px;

      .user-info p {
        font-size: 0.9rem;
      }

      .logout-btn {
        padding: 10px;
        font-size: 0.9rem;
      }
    }
  }
}
</style>
