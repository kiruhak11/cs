<!-- components/Header.vue -->
<template>
  <header class="site-header">
    <div class="logo">
      <NuxtLink to="/">Мой Сайт</NuxtLink>
    </div>
    <nav class="nav-menu">
      <div v-if="user">баланс {{ user.balance }}</div>
      <NuxtLink to="/">Главная</NuxtLink>
      <NuxtLink to="/cases">Кейсы</NuxtLink>
      <NuxtLink to="/inventory">Инвентарь</NuxtLink>
      <div class="nav-menu" v-if="user">
        <NuxtLink to="/account">Личный кабинет</NuxtLink>
      </div>
      <div v-else-if="loading">Загрузка данных...</div>
      <div v-else>
        <NuxtLink to="/login">Вход</NuxtLink>
        <NuxtLink to="/register">Регистрация</NuxtLink>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { user, loading, error, fetchUser } = useUser();
onMounted(() => fetchUser());
</script>

<style scoped lang="scss">
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #3498db;
  padding: 10px 20px;
  color: #fff;

  .logo {
    font-size: 1.5rem;
    font-weight: bold;

    a {
      color: #fff;
      text-decoration: none;
      &:hover {
        color: #ecf0f1;
      }
    }
  }

  .nav-menu {
    display: flex;
    gap: 15px;

    a {
      color: #fff;
      text-decoration: none;
      font-size: 1rem;
      transition: color 0.3s;
      &:hover {
        color: #ecf0f1;
      }
    }
  }
}
</style>
