<template>
  <div class="coach-groups">
    <h1 class="page-title">Список групп</h1>
    <div v-if="groups.length" class="groups-grid">
      <NuxtLink
        v-for="group in groups"
        :key="group.id"
        :to="`/coach/group/${group.id}/add-participants`"
        class="group-card"
      >
        <h2 class="group-name">{{ group.name }}</h2>
      </NuxtLink>
    </div>
    <div v-else class="empty-state">
      <p>Группы не найдены</p>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
    <div>
      <NuxtLink to="/coach/create-group" class="btn">Создать группу</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#imports";

interface Group {
  id: number;
  name: string;
}

const groups = ref<Group[]>([]);
const error = ref("");
const router = useRouter();

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
    groups.value = data;
  } catch (err) {
    error.value = "Ошибка загрузки групп";
  }
}

onMounted(() => {
  fetchGroups();
});
</script>

<style scoped lang="scss">
.btn {
  display: flex;
  justify-content: center;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: var(--pl-primary);
  color: var(--pl-background);
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--pl-primary-hover);
  }
}
.coach-groups {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--pl-background);
  color: var(--pl-text);

  .page-title {
    text-align: center;
    font-size: 2rem;
    color: var(--pl-primary);
    margin-bottom: 30px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .groups-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }

  .group-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: var(--pl-background);
    border: 1px solid var(--pl-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px var(--pl-box-shadow);
    text-decoration: none;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    color: var(--pl-text);

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px var(--pl-box-shadow-hover);
    }

    .group-name {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
      text-align: center;
      color: var(--pl-primary);
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
    margin-top: 20px;
    text-align: center;
  }
}

@media (max-width: 600px) {
  .coach-groups {
    padding: 10px;

    .page-title {
      font-size: 1.8rem;
    }
  }
}
</style>
