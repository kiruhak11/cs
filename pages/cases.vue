<template>
  <div class="cases-grid">
    <CaseCard
      v-for="caseItem in cases"
      :key="caseItem.id"
      :caseItem="caseItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#imports";
interface Case {
  id: number;
  name: string;
  image: string;
  rarity: string;
  price: number;
  createdAt: string;
}
const cases = ref<Case[]>([]);
const router = useRouter();

// Функция для получения данных пользователя по токену

onMounted(async () => {
  const data = await $fetch<Case[]>("/api/cases");
  cases.value = data;
});
</script>

<style scoped>
.cases-grid {
  padding: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.account-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.account-container h1 {
  text-align: center;
  margin-bottom: 20px;
}

.account-container p {
  font-size: 16px;
  line-height: 1.5;
}

.logout-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>
