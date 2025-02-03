<template>
  <div class="auth-container">
    <h1>Регистрация</h1>
    <form @submit.prevent="handleRegister">
      <label for="email">Email:</label>
      <input id="email" type="email" v-model="form.email" required />

      <label for="username">Username:</label>
      <input id="username" type="text" v-model="form.username" />

      <label for="password">Пароль:</label>
      <input id="password" type="password" v-model="form.password" required />

      <label for="name">Имя:</label>
      <input id="name" type="text" v-model="form.name" />

      <label for="phone">Телефон:</label>
      <input id="phone" type="text" v-model="form.phone" />

      <button type="submit">Зарегистрироваться</button>
    </form>

    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">Регистрация прошла успешно</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
interface RegisterForm {
  email: string;
  username: string;
  password: string;
  name: string;
  phone: string;
}

const form = ref<RegisterForm>({
  email: "",
  username: "",
  password: "",
  name: "",
  phone: "",
});

const error = ref("");
const success = ref(false);

async function handleRegister() {
  error.value = "";
  success.value = false;

  try {
    const response = await $fetch("/api/auth/register", {
      method: "POST",
      body: form.value,
    });
    if ("error" in response && response.error) {
      error.value = response.error;
    } else {
      success.value = true;
      if ("token" in response && response.token) {
        localStorage.setItem("token", response.token);
        router.push("/");
      }
    }
  } catch (err) {
    error.value = "Ошибка регистрации";
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
}
</style>
