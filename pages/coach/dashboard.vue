<template>
  <div class="coach-dashboard" v-if="user">
    <h1>Добро пожаловать, тренер {{ user.name || user.email }}</h1>
    <div class="stats">
      <div class="stat-card" v-for="(stat, index) in stats" :key="index">
        <div @click="stat.title==='Групп' ? router.push('/coach/groups') : stat.title==='Участников' ? router.push('/coach/participants') : router.push('/coach/plans')">
        <h2>{{ stat.title }}</h2>
        <p>{{ stat.value }}</p>
        </div>
      </div>
    </div>
    <div class="actions">
      <NuxtLink to="/coach/create-training-plan" class="btn"
        >Создать план</NuxtLink
      >
      <NuxtLink to="/coach/groups" class="btn">Управление группами</NuxtLink>
      <NuxtLink to="/coach/create-participant" class="btn"
        >Создать участника</NuxtLink
      >
      <NuxtLink to="/coach/participants" class="btn"
        >Управление участниками</NuxtLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const { user, fetchUser } = useUser();
const router = useRouter();
const stats = ref<{ title: string; value: number }[]>([]);

async function fetchStats() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    // Загружаем реальные данные статистики с API
    const data = await $fetch("/api/coach/dashboard-stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    stats.value = [
      { title: "Групп", value: data.groups },
      { title: "Участников", value: data.participants },
      { title: "Планов", value: data.plans },
    ];
  } catch (err) {
    console.error("Ошибка загрузки статистики:", err);
  }
}

onMounted(async () => {
  await fetchUser();
  await fetchStats();
});
</script>

<style scoped lang="scss">
.coach-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--pl-background);
  color: var(--pl-text);
  font-family: "Roboto", sans-serif;

  h1 {
    text-align: center;
    font-size: 2rem;
    color: var(--pl-primary);
    margin-bottom: 30px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
  }

  .stats {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 40px;
    gap: 40px;

    .stat-card {
      background: var(--pl-background);
      border: 1px solid var(--pl-border);
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--pl-box-shadow);
      padding: 20px;
      width: 200px;
      text-align: center;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px var(--pl-box-shadow-hover);
      }

      h2 {
        font-size: 1.5rem;
        margin-bottom: 10px;
        color: var(--pl-text);
      }

      p {
        font-size: 2rem;
        font-weight: bold;
        color: var(--pl-primary);
      }
    }
  }

  .actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;

    .btn {
      background-color: var(--pl-primary);
      color: #fff;
      padding: 15px 25px;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      font-size: 1rem;
      font-weight: bold;
      text-transform: uppercase;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: var(--pl-primary-hover);
      }
    }
  }
}

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .coach-dashboard {
    padding: 10px;

    h1 {
      font-size: 1.8rem;
    }

    .stats {
      flex-direction: column;
      align-items: center;
    }

    .actions {
      flex-direction: column;

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  }
}
</style>
