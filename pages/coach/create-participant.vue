<template>
  <div class="create-participant">
    <h1 class="page-title">Создать участника</h1>
    <form @submit.prevent="handleCreate" class="form-card">
      <div class="form-group">
        <label for="name">Имя и Фамилия</label>
        <input id="name" type="text" v-model="form.name" required />
      </div>
      <button type="submit" class="btn submit-btn">Создать участника</button>
    </form>
    <div v-if="message" class="message">{{ message }}</div>
    <div v-if="credentials" class="credentials">
      <button @click="copyCredentials" class="btn copy-btn">
        Скопировать логин и пароль
      </button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

interface CreateParticipantForm {
  name: string;
}

interface Credentials {
  username: string;
  password: string;
}

const form = ref<CreateParticipantForm>({ name: "" });
const message = ref("");
const error = ref("");
const credentials = ref<Credentials | null>(null);
const router = useRouter();

async function handleCreate() {
  error.value = "";
  message.value = "";
  credentials.value = null;
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const response = await $fetch("/api/coach/create-participant", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: { name: form.value.name },
    });
    if (response.username && response.password) {
      credentials.value = {
        username: response.username,
        password: response.password,
      };
      message.value = `Участник создан. Логин: ${response.username}@login.com, пароль: ${response.password}`;
    } else {
      error.value = "Ошибка: получены некорректные данные от сервера";
    }
  } catch (err) {
    error.value = "Ошибка при создании участника";
  }
}

async function copyCredentials() {
  if (credentials.value) {
    const textToCopy = `Логин: ${credentials.value.username}@login.com\nПароль: ${credentials.value.password}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      alert("Учётные данные скопированы в буфер обмена");
    } catch (err) {
      alert("Не удалось скопировать данные");
    }
  }
}
</script>

<style scoped lang="scss">
.create-participant {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  background: var(--pl-background);
  border: 1px solid var(--pl-border);
  border-radius: 12px;
  box-shadow: 0 4px 8px var(--pl-box-shadow);
  color: var(--pl-text);
  font-family: "Roboto", sans-serif;
  text-align: center;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 6px 12px var(--pl-box-shadow-hover);
  }

  .page-title {
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .form-card {
    display: flex;
    flex-direction: column;
    gap: 15px;
    text-align: left;

    .form-group {
      display: flex;
      flex-direction: column;

      label {
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
    transition: background-color 0.3s;
  }

  .submit-btn {
    background-color: var(--pl-primary);
    color: #fff;
    &:hover {
      background-color: var(--pl-primary-hover);
    }
  }

  .copy-btn {
    background-color: var(--pl-accent);
    color: #fff;
    margin-top: 20px;
    &:hover {
      background-color: var(--pl-accent-hover);
    }
  }

  .message {
    margin-top: 20px;
    color: var(--pl-primary);
    font-weight: bold;
  }

  .error {
    margin-top: 20px;
    color: var(--pl-accent);
    font-weight: bold;
  }
}

/* Адаптив для мобильных устройств */
@media (max-width: 600px) {
  .create-participant {
    margin: 20px auto;
    padding: 15px;

    .page-title {
      font-size: 1.8rem;
    }

    .form-group {
      input {
        font-size: 0.9rem;
        padding: 8px;
      }
    }

    .submit-btn,
    .copy-btn {
      padding: 10px;
      font-size: 0.9rem;
    }
  }
}
</style>
