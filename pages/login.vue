<template>
  <div class="auth-container">
    <h1>Вход</h1>
    <form @submit.prevent="handleLogin">
      <label for="email">Email:</label>
      <input id="email" type="email" v-model="form.email" required />

      <label for="password">Пароль:</label>
      <input id="password" type="password" v-model="form.password" required />

      <button type="submit">Войти</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="token" class="success">Вход выполнен</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

interface LoginForm {
  email: string;
  password: string;
}
const router = useRouter();

const form = ref<LoginForm>({
  email: "",
  password: "",
});

const error = ref("");
const token = ref("");

async function handleLogin() {
  error.value = "";
  token.value = "";

  try {
    const response = await $fetch("/api/auth/login", {
      method: "POST",
      body: form.value,
    });
    if ("error" in response) {
      error.value = response.error;
    } else {
      if (response.token) {
        localStorage.setItem("token", response.token);
        router.push("/");
      }
    }
  } catch (err) {
    error.value = "Ошибка входа";
  }
}
</script>

<style scoped>
.auth-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.auth-container form {
  display: flex;
  flex-direction: column;
}

.auth-container label {
  margin-top: 10px;
}

.auth-container input {
  padding: 8px;
  font-size: 14px;
}

.auth-container button {
  margin-top: 20px;
  padding: 10px;
  font-size: 16px;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
  word-break: break-all;
}
</style>
