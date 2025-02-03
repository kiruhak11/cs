<template>
  <div class="inventory-container">
    <h1>Инвентарь пользователя</h1>
    <div v-if="inventoryItems.length">
      <div class="inventory-item" v-for="item in inventoryItems" :key="item.id">
        <img :src="item.loot.image" :alt="item.loot.name" class="loot-image" />
        <div class="item-details">
          <h2>{{ item.loot.name }}</h2>
          <p>Редкость: {{ item.loot.rarity }}</p>
          <p>Цена: {{ item.loot.price }} ₽</p>
          <p>
            Дата получения: {{ new Date(item.acquiredAt).toLocaleString() }}
          </p>
          <!-- Кнопка для продажи (функциональность продажи можно реализовать отдельно) -->
          <button @click="sellItem(item.id)">Продать</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Ваш инвентарь пуст.</p>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "#imports";

interface Loot {
  id: number;
  name: string;
  image: string;
  rarity: string;
  price: number;
  probability: number;
  caseId: number;
}

interface InventoryItem {
  id: number;
  acquiredAt: string;
  loot: Loot;
}

const inventoryItems = ref<InventoryItem[]>([]);
const error = ref("");
const router = useRouter();

async function fetchInventory() {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
    return;
  }
  try {
    const data = await $fetch("/api/inventory", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    inventoryItems.value = data;
  } catch (err) {
    console.error("Ошибка при загрузке инвентаря:", err);
    error.value = "Ошибка при загрузке инвентаря";
  }
}

async function sellItem(itemId: number) {
  // Получаем токен авторизации из localStorage
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Пользователь не авторизован");
    // Если нужно, можно перенаправить на страницу входа
    return;
  }

  try {
    // Отправляем запрос на продажу предмета
    const response: { salePrice?: number; message?: string } = await $fetch(
      "/api/inventory/sell",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: { itemId },
      }
    );
    if (!response) {
      return;
    }
    // Предполагается, что API возвращает объект с полем salePrice
    if (response.salePrice) {
      alert(`Предмет успешно продан. Вы получили ${response.salePrice} ₽`);
    } else {
      alert(response.message || "Предмет успешно продан.");
    }

    useUser().fetchUser();
    // Обновите состояние инвентаря, например, удалив проданный предмет из списка.
    // Если инвентарь хранится в реактивной переменной inventoryItems:
    inventoryItems.value = inventoryItems.value.filter(
      (item) => item.id !== itemId
    );
  } catch (err) {
    console.error("Ошибка при продаже предмета:", err);
    alert("Ошибка при продаже предмета");
  }
}

onMounted(fetchInventory);
</script>

<style scoped>
.inventory-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.inventory-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
}

.loot-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 20px;
}

.item-details h2 {
  margin: 0;
  font-size: 1.2rem;
}

.item-details p {
  margin: 5px 0;
}

button {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #e67e22;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #d35400;
}

.error {
  color: red;
  margin-top: 20px;
}
</style>
