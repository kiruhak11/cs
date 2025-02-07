<template>
  <div class="auth-container">
    <div class="card">
      <h1 class="title">Вход</h1>
      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="form.email" required />
        </div>
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            required
          />
        </div>
        <button type="submit" class="btn">Войти</button>
      </form>
      <p class="info-note">
        Если вы не тренер, логин и пароль необходимо получить у вашего тренера.
      </p>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-if="token" class="success">Вход выполнен</div>
    </div>
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

<style scoped lang="scss">
.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  background-color: var(--pl-background);
  padding: 20px;
}

.card {
  background: var(--pl-background);
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--pl-box-shadow);
  max-width: 400px;
  width: 100%;
  padding: 30px;
  text-align: center;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px var(--pl-box-shadow-hover);
  }
}

.title {
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--pl-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;

  .form-group {
    display: flex;
    flex-direction: column;

    label {
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 5px;
      color: var(--pl-text);
    }

    input {
      padding: 10px;
      font-size: 1rem;
      border: 1px solid var(--pl-border);
      border-radius: 6px;
      transition: border-color 0.3s ease;

      &:focus {
        border-color: var(--pl-primary);
        outline: none;
      }
    }
  }
}

.btn {
  padding: 12px;
  font-size: 1rem;
  background-color: var(--pl-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;

  &:hover {
    background-color: var(--pl-primary-hover);
  }
}

.info-note {
  margin-top: 15px;
  font-size: 0.9rem;
  color: var(--pl-text-hover);
  text-align: center;
}

.error {
  margin-top: 15px;
  font-size: 1rem;
  color: var(--pl-accent);
  font-weight: 600;
  text-align: center;
}

.success {
  margin-top: 15px;
  font-size: 1rem;
  color: var(--pl-primary);
  font-weight: 600;
  text-align: center;
}

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .card {
    padding: 20px;
  }

  .title {
    font-size: 1.8rem;
  }

  .form-group input {
    padding: 8px;
    font-size: 0.9rem;
  }

  .btn {
    padding: 10px;
    font-size: 0.9rem;
  }
}
</style>
