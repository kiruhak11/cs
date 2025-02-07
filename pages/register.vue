<template>
  <div class="auth-container">
    <div class="card">
      <h1 class="title">Регистрация тренера</h1>
      <form @submit.prevent="handleRegister" class="form">
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
        <div class="form-group">
          <label for="name">Имя</label>
          <input id="name" type="text" v-model="form.name" required />
        </div>
        <button type="submit" class="btn submit-btn">Зарегистрироваться</button>
      </form>
      <div v-if="success" class="success">Регистрация прошла успешно</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

interface RegisterForm {
  email: string;
  password: string;
  name: string;
}

const router = useRouter();

const form = ref<RegisterForm>({
  email: "",
  password: "",
  name: "",
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
  display: block;
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background-color: var(--pl-primary);
  color: #fff;

  &:hover {
    background-color: var(--pl-primary-hover);
  }
}

.success {
  margin-top: 20px;
  color: var(--pl-primary);
  font-weight: bold;
  text-align: center;
}

.error {
  margin-top: 20px;
  color: var(--pl-accent);
  font-weight: bold;
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

  .submit-btn {
    padding: 10px;
    font-size: 0.9rem;
  }
}
</style>
