<template>
  <div class="inventory-container">
    <h1>Инвентарь пользователя</h1>
    <div v-if="inventoryItems.length">
      <div class="inventory-controls">
        <button @click="sellAllItems" class="sell-all-btn">
          Продать все за
        </button>
      </div>
      <div class="inventory-list">
        <div
          class="inventory-item"
          v-for="item in inventoryItems"
          :key="item.id"
        >
          <img
            :src="item.loot.image"
            :alt="item.loot.name"
            class="loot-image"
          />
          <div class="item-details">
            <h2>{{ item.loot.name }}</h2>
            <p>Редкость: {{ item.loot.rarity }}</p>
            <p>Цена: {{ item.loot.price }} ₽</p>
            <p>
              Дата получения: {{ new Date(item.acquiredAt).toLocaleString() }}
            </p>
            <button @click="sellItem(item.id)" class="sell-btn">Продать</button>
          </div>
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
import { useUser } from "~/composables/useUser";

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
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Пользователь не авторизован");
    return;
  }
  try {
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
    if (response.salePrice) {
      alert(`Предмет успешно продан. Вы получили ${response.salePrice} ₽`);
    } else {
      alert(response.message || "Предмет успешно продан.");
    }
    useUser().fetchUser();
    inventoryItems.value = inventoryItems.value.filter(
      (item) => item.id !== itemId
    );
  } catch (err) {
    console.error("Ошибка при продаже предмета:", err);
    alert("Ошибка при продаже предмета");
  }
}

async function sellAllItems() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Пользователь не авторизован");
    return;
  }
  let totalSale = 0;
  // Последовательно продаем каждый предмет
  for (const item of [...inventoryItems.value]) {
    try {
      const response: { salePrice?: number; message?: string } = await $fetch(
        "/api/inventory/sell",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: { itemId: item.id },
        }
      );
      if (response.salePrice) {
        totalSale += response.salePrice;
      }
    } catch (err) {
      console.error(`Ошибка при продаже предмета ID ${item.id}:`, err);
    }
  }
  alert(`Все предметы проданы. Вы получили ${totalSale} ₽`);
  useUser().fetchUser();
  // Обновляем инвентарь — предполагаем, что после продажи он станет пустым
  inventoryItems.value = [];
}

onMounted(fetchInventory);
</script>

<style scoped>
.inventory-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.inventory-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.sell-all-btn {
  padding: 10px 20px;
  background-color: #27ae60;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sell-all-btn:hover {
  background-color: #1e8449;
}

.inventory-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.inventory-item {
  display: flex;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  width: calc(50% - 20px);
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

.sell-btn {
  margin-top: 10px;
  padding: 5px 10px;
  background-color: #e67e22;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.sell-btn:hover {
  background-color: #d35400;
}

.error {
  color: red;
  margin-top: 20px;
}
</style>
