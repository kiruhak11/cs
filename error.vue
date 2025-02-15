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
    <button class="back-btn" type="button" @click="$router.back()">
      <span class="visually-hidden">назад</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5M12 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup>
const error = useError();
</script>
<style scoped lang="scss">
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.back-btn {
  position: fixed;
  bottom: 20px;
  left: 20px;

  rotate: -180deg;
  padding: 10px;
  border-radius: 50%;
  background-color: #5026c5; // основной цвет сайта
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
}
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
