<template>
  <div class="account-container">
    <h1>Личный кабинет</h1>
    <div v-if="loading">
      <p>Загрузка данных...</p>
    </div>
    <div v-else-if="user">
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p v-if="user.username"><strong>Username:</strong> {{ user.username }}</p>
      <p v-if="user.name"><strong>Имя:</strong> {{ user.name }}</p>
      <p v-if="user.phone"><strong>Телефон:</strong> {{ user.phone }}</p>
      <p><strong>Активен:</strong> {{ user.isActive ? "Да" : "Нет" }}</p>
      <p>
        <strong>Дата регистрации:</strong>
        {{ new Date(user.createdAt).toLocaleString() }}
      </p>
      <button @click="handleLogout" class="logout-btn">Выйти</button>
    </div>
    <div v-else>
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
import { onMounted } from "vue";
import { useRouter } from "#imports";

const { user, loading, error, fetchUser } = useUser();
const router = useRouter();

function handleLogout() {
  localStorage.removeItem("token");
  // Обновляем данные пользователя после выхода
  user.value = null;
  router.push("/login");
}
</script>

<style scoped>
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

.error {
  color: red;
  margin-top: 10px;
}
</style>
