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

    <!-- Анимация прокрутки (реел) -->
    <div v-if="isAnimating" class="animation-container">
      <div class="animation-container-line"></div>
      <div
        class="loot-reel"
        :style="{ transform: `translateX(-${reelOffset}px)` }"
      >
        <div
          v-for="(item, index) in lootReelItems"
          :key="index"
          class="reel-item"
        >
          <img :src="item.image" :alt="item.name" />
        </div>
      </div>
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "#imports";
import { useUser } from "~/composables/useUser";

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

// Параметры для реела:
const itemWidth = 150; // ширина одного элемента в px
const containerWidth = 600; // ширина видимой области

// Чтобы создать эффект бесконечной прокрутки, повторяем массив loot несколько раз
const lootReelItems = computed(() => {
  // Если loots еще не загружены, вернуть пустой массив
  if (!loots.value.length) return [];
  // Повторяем массив, например, 3 раза
  return [...loots.value, ...loots.value, ...loots.value, ...loots.value];
});

// Управляем сдвигом реела
const reelOffset = ref(0);

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

  isAnimating.value = true;
  hasOpened.value = false;
  openedLoot.value = null;

  // Запускаем анимацию прокрутки.
  // Сначала запускаем "быструю" прокрутку: сбрасываем сдвиг в 0
  reelOffset.value = 0;

  // Имитируем предварительную анимацию (например, 1 секунда быстрого движения)
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Выполняем запрос на открытие кейса
  try {
    const result: { loot: Loot } = await $fetch("/api/cases/open", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: { caseId },
    });
    openedLoot.value = result.loot;
    hasOpened.value = true;
  } catch (err) {
    error.value = "Ошибка при открытии кейса";
    isAnimating.value = false;
    return;
  }

  // Находим индекс выбранного предмета в оригинальном массиве loots
  const originalIndex = loots.value.findIndex(
    (item) => item.id === openedLoot.value?.id
  );
  if (originalIndex === -1) {
    error.value = "Ошибка определения выпавшего предмета";
    isAnimating.value = false;
    return;
  }

  // Чтобы создать эффект бесконечной прокрутки,
  // используем средний блок повторений из lootReelItems.
  const repeatCount = 3; // число повторений (мы склеили массив 3 раза)
  const middleIndex = loots.value.length; // индекс начала второго (среднего) блока

  // Вычисляем целевой индекс: берем соответствующий элемент во втором блоке.
  const targetIndex = middleIndex + originalIndex;

  // Итоговый сдвиг: чтобы элемент оказался по центру,
  // нужно сместить так, чтобы его центр совпал с центром контейнера.
  // Вычисляем: targetOffset = targetIndex * itemWidth - (containerWidth / 2) + (itemWidth / 2)
  const targetOffset =
    targetIndex * itemWidth - containerWidth / 2 + itemWidth / 2;

  // Применяем CSS-переход к контейнеру реела.
  // Для этого устанавливаем transition в стиле через nextTick.
  // (Если необходимо, можно управлять этим через класс.)
  const reelEl = document.querySelector(".loot-reel") as HTMLElement;
  if (reelEl) {
    reelEl.style.transition = "transform 2s ease-out";
  }
  // Устанавливаем итоговый сдвиг
  reelOffset.value = targetOffset;

  // Даем время завершить анимацию
  await new Promise((resolve) => setTimeout(resolve, 2000));
  useUser().fetchUser();
  isAnimating.value = false;
}

onMounted(fetchCaseData);
</script>

<style scoped lang="scss">
.case-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  overflow: hidden;
  width: 600px; /* фиксированная ширина видимой области */
  border: 1px solid #ccc;
  border-radius: 8px;
  position: relative;

  &-line {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 1px;
    height: 100%;
    background-color: #ccc;
    z-index: 100;
  }
}
.loot-reel {
  display: flex;
  transition: transform 2s ease-out;
}
.reel-item {
  flex: 0 0 auto;
  width: 150px;
  height: 150px;
  display: flex;
  border: 1px solid #ccc;
  align-items: center;
  justify-content: center;
}
.reel-item img {
  max-width: 100%;
  max-height: 100%;
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
