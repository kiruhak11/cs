// composables/useUser.ts
import { ref } from "vue";
import { useRouter } from "#imports";

export interface User {
  id: number;
  email: string;
  username?: string | null;
  name?: string | null;
  phone?: string | null;
  isActive: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

const user = ref<User | null>(null);
const loading = ref(false);
const error = ref("");

export function useUser() {
  const router = useRouter();

  async function fetchUser() {
    loading.value = true;
    const token = localStorage.getItem("token");
    if (!token) {
      user.value = null;
      loading.value = false;
      return;
    }

    try {
      const data = await $fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      user.value = data;
    } catch (err) {
      error.value = "Ошибка при получении данных пользователя";
      localStorage.removeItem("token");
      user.value = null;
      // При ошибке можно перенаправить на страницу логина
      router.push("/login");
    } finally {
      loading.value = false;
    }
  }

  function setUser(newUser: User | null) {
    user.value = newUser;
  }

  return { user, loading, error, fetchUser, setUser };
}
