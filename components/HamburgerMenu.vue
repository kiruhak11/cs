<template>
  <div class="container">
    <!-- Гамбургер меню -->
    <div class="hamburger-menu" @click="toggleMenu">
      <div class="hamburger-menu-text">
        <h1>Powerlift</h1>
      </div>
      <div class="hamburger-menu-icon">
        <div class="bar" :class="{ open: isOpen }"></div>
        <div class="bar" :class="{ open: isOpen }"></div>
        <div class="bar" :class="{ open: isOpen }"></div>
      </div>
    </div>

    <!-- Мобильное меню -->
    <nav
      :class="{ 'mobile-nav-open': isOpen }"
      class="mobile-nav"
      @click="toggleMenu"
    >
      <ul>
        <div class="container">
          <div class="line"></div>
          <div class="logo">
            <div class="logo__text">
              <NuxtLink class="text" to="/">
                <h1>Главная</h1>
              </NuxtLink>
              <Switcher class="Switcher" />
            </div>
          </div>
          <div class="line"></div>
          <ul v-if="useUser().user?.value?.role === 'COACH'">
            <li>
              <NuxtLink class="link" to="/">Главная</NuxtLink>
            </li>
            <li><NuxtLink to="/coach/dashboard">Панель тренера</NuxtLink></li>
            <li>
              <NuxtLink to="/coach/create-training-plan">Создать план</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/coach/groups">Список групп</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/coach/create-group">Создать группу</NuxtLink>
            </li>
            <li><NuxtLink to="/account">Личный кабинет</NuxtLink></li>
          </ul>
          <ul v-else-if="useUser().user?.value?.role === 'PARTICIPANT'">
            <li><NuxtLink to="/">Главная</NuxtLink></li>
            <li>
              <NuxtLink to="/participant/dashboard">План тренировок</NuxtLink>
            </li>
            <li><NuxtLink to="/account">Личный кабинет</NuxtLink></li>
          </ul>
          <ul v-else>
            <li><NuxtLink to="/login">Вход</NuxtLink></li>
            <li><NuxtLink to="/register">Регистрация тренера</NuxtLink></li>
          </ul>
        </div>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";

const isOpen = ref(false);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

watch(isOpen, () => {
  if (isOpen.value) {
    document.body.classList.add("no-scroll");
  } else {
    document.body.classList.remove("no-scroll");
  }
});
onMounted(() => {
  useUser().fetchUser();
});
onBeforeUnmount(() => {
  document.body.classList.remove("no-scroll");
});
</script>
<style lang="scss" scoped>
.hamburger-menu {
  display: flex;
  flex-direction: row;
  &-icon {
    display: flex;
    flex-direction: column;
    margin-left: auto;
    cursor: pointer;
    z-index: 3;
  }
  .bar {
    width: 26px;
    height: 3px;
    background-color: var(--pl-text);
    margin: 4px;
    transition: all 0.3s ease;
  }

  .bar.open:nth-child(1) {
    transform: rotate(45deg) translate(15px);
    width: 30px;
  }

  .bar.open:nth-child(2) {
    opacity: 0;
  }

  .bar.open:nth-child(3) {
    transform: rotate(-45deg) translate(15px);
    width: 30px;
  }
}

.mobile {
  &-nav {
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-20px);
    transition: max-height 0.5s ease, opacity 0.5s ease, transform 0.5s ease;
    &-open {
      max-height: 500px;
      opacity: 1;
      transform: translateY(0);
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
    }

    li {
      font-size: 32px;
      height: 100%;
      width: 100%;
      border-radius: 10px;
      a {
        display: flex;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
        padding: 16px;
      }
    }
  }
}

/* Дополнительные стили для блокировки скролла */
.no-scroll {
  overflow: hidden;
}

.logo {
  display: flex;
  align-items: center;
  width: 100%;
  &__text {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    .text {
      display: flex;
      align-items: center;
      justify-self: self-start;
    }
    .Switcher {
      justify-self: self-end;
    }
  }
  h1 {
    color: var(--pl-text);
    transition: color 0.3s;
  }
}

.line {
  display: flex;
  height: 1px;
  margin: 10px 0;
  width: 100vw;
  background-color: var(--pl-text);
}
</style>
