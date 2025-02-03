<!-- components/CaseCard.vue -->
<template>
  <NuxtLink :to="`/case/${caseItem.id}`">
    <div class="case-card">
      <img :src="caseItem.image" :alt="caseItem.name" class="case-image" />
      <div class="case-details">
        <h2>{{ caseItem.name }}</h2>
        <p>Редкость: {{ caseItem.rarity }}</p>
        <p>Цена: {{ caseItem.price }} ₽</p>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Case {
  id: number;
  name: string;
  image: string;
  rarity: string;
  price: number;
  createdAt: string;
}

const props = defineProps<{
  caseItem: Case;
}>();
</script>

<style scoped lang="scss">
.case-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  width: 250px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  .case-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  .case-details {
    padding: 10px;
    h2 {
      font-size: 1.2rem;
      margin: 0 0 10px;
    }
    p {
      margin: 0;
      font-size: 0.9rem;
    }
  }
}
</style>
