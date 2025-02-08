<template>
  <div class="error-page">
    <div v-if="error.statusCode === 404" class="error-content">
      <h1>Страница не найдена (404)</h1>
      <p>Извините, но страница, которую вы ищете, не существует.</p>
    </div>
    <div v-else-if="error.statusCode === 500" class="error-content">
      <h1>Внутренняя ошибка сервера (500)</h1>
      <p>Произошла ошибка на сервере. Попробуйте зайти позже.</p>
    </div>
    <div v-else class="error-content">
      <h1>Ошибка {{ error.statusCode || "" }}</h1>
      <p>{{ error.message || "Что-то пошло не так." }}</p>
    </div>
    <NuxtLink class="home-link" to="/">Вернуться на главную</NuxtLink>
  </div>
</template>

<script setup>
const error = useError();
</script>
<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--pl-background);
  padding: 20px;
  text-align: center;

  .error-content {
    margin-bottom: 30px;

    h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
      color: #d32f2f; // основной акцент (например, красный)
    }

    p {
      font-size: 1.2rem;
      color: #555;
    }
  }

  .home-link {
    padding: 10px 20px;
    background-color: #5026c5; // основной цвет сайта
    color: #fff;
    border-radius: 4px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s;

    &:hover {
      background-color: #391b8b; // темный оттенок для hover
    }
  }
}
</style>
