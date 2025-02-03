<template>
  <div class="case-page">
    <h1>{{ currentCase.name }}</h1>
    <img :src="currentCase.image" :alt="currentCase.name" class="case-image" />
    <p>Редкость: {{ currentCase.rarity }}</p>
    <p>Цена: {{ currentCase.price }} ₽</p>

    <button
      @click="openCase"
      class="open-case-btn"
      :disabled="isAnimating || hasOpened"
    >
      {{
        isAnimating ? "Открытие..." : hasOpened ? "Кейс открыт" : "Открыть кейс"
      }}
    </button>

    <div v-if="isAnimating" class="animation-container">
      <!-- Пример анимации прокрутки: можно добавить свои эффекты -->
      <div class="spinner"></div>
    </div>

    <div v-if="openedLoot && !isAnimating" class="opened-loot">
      <h3>Поздравляем! Вам выпал предмет:</h3>
      <img :src="openedLoot.image" :alt="openedLoot.name" class="loot-image" />
      <p>{{ openedLoot.name }} ({{ openedLoot.rarity }})</p>
      <p>Цена: {{ openedLoot.price }} ₽</p>
      <NuxtLink to="/inventory">Перейти в инвентарь</NuxtLink>
    </div>

    <div v-if="error" class="error">{{ error }}</div>
    <h2>Возможные предметы:</h2>
    <ul class="loot-list">
      <li v-for="item in loots" :key="item.id">
        <img :src="item.image" :alt="item.name" class="loot-image" />
        <p>
          {{ item.name }} ({{ item.rarity }}) – Вероятность:
          {{ item.probability }}%
          <span v-if="item.price">Цена: {{ item.price }} ₽</span>
        </p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "#imports";

interface Case {
  id: number;
  name: string;
  image: string;
  rarity: string;
  price: number;
  createdAt: string;
}

interface Loot {
  id: number;
  name: string;
  image: string;
  rarity: string;
  price: number;
  probability: number;
  caseId: number;
}

const route = useRoute();
const router = useRouter();
const caseId = Number(route.params.id);

const currentCase = ref<Case>({
  id: caseId,
  name: "",
  image: "",
  rarity: "",
  price: 0,
  createdAt: "",
});
const loots = ref<Loot[]>([]);
const openedLoot = ref<Loot | null>(null);
const error = ref("");
const isAnimating = ref(false);
const hasOpened = ref(false);

async function fetchCaseData() {
  try {
    currentCase.value = await $fetch(`/api/cases/${caseId}`);
    loots.value = await $fetch(`/api/cases/${caseId}/loots`);
  } catch (err) {
    error.value = "Ошибка загрузки данных кейса";
  }
}

async function openCase() {
  error.value = "";
  const token = localStorage.getItem("token");
  if (!token) {
    error.value = "Пользователь не авторизован";
    router.push("/login");
    return;
  }

  // Запускаем анимацию прокрутки
  isAnimating.value = true;
  hasOpened.value = false;
  openedLoot.value = null;

  // Имитируем анимацию прокрутки (например, 3 секунды)
  setTimeout(async () => {
    try {
      const result: { loot: Loot } = await $fetch("/api/cases/open", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: { caseId },
      });
      openedLoot.value = result.loot;
      hasOpened.value = true;
      useUser().fetchUser();
    } catch (err) {
      error.value = "Ошибка при открытии кейса";
    } finally {
      isAnimating.value = false;
    }
  }, 3000);
}

onMounted(fetchCaseData);
</script>

<style scoped>
.case-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
}

.case-image {
  max-width: 300px;
  display: block;
  margin-bottom: 20px;
}

.loot-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.loot-list li {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  width: 150px;
}

.loot-image {
  max-width: 100%;
  height: auto;
}

.open-case-btn {
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.open-case-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.animation-container {
  margin-top: 20px;
  text-align: center;
}

/* Пример простой анимации-сценария с использованием спиннера */
.spinner {
  margin: 0 auto;
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.opened-loot {
  margin-top: 20px;
  padding: 15px;
  border: 2px solid #2ecc71;
  border-radius: 8px;
  background-color: #ecf9f1;
}

.error {
  color: red;
  margin-top: 20px;
}
</style>
