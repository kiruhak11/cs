<template>
  <header class="header container">
    <div class="header-container">
      <!-- Логотип для десктопа -->
      <div class="logo" v-if="!isMobile">
        <div class="logo__text">
          <NuxtLink to="/">
            <h1>PowerLift School</h1>
          </NuxtLink>
        </div>
      </div>
      <!-- Горизонтальное меню для десктопа -->
      <nav v-if="!isMobile" class="nav-menu">
        <ul v-if="user?.role === 'COACH'">
          <li><NuxtLink to="/">Главная</NuxtLink></li>
          <li><NuxtLink to="/coach/dashboard">Панель тренера</NuxtLink></li>
          <li>
            <NuxtLink to="/coach/create-group">Создать группу</NuxtLink>
          </li>
          <li><NuxtLink to="/account">Личный кабинет</NuxtLink></li>
        </ul>
        <ul v-else-if="user?.role === 'PARTICIPANT'">
          <li><NuxtLink to="/">Главная</NuxtLink></li>
          <li>
            <NuxtLink to="/participant/dashboard">План тренировок</NuxtLink>
          </li>
          <li><NuxtLink to="/account">Личный кабинет</NuxtLink></li>
        </ul>
        <ul v-else>
          <li><NuxtLink to="/login">Вход</NuxtLink></li>
          <li><NuxtLink to="/register">Регистрация</NuxtLink></li>
        </ul>
      </nav>
      <!-- Переключатель темы для десктопа -->
      <Switcher v-if="!isMobile" />
      <!-- Гамбургер-меню для мобильных устройств -->
      <HamburgerMenu v-else />
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const { user, fetchUser } = useUser();
const { isMobile } = useDevice();

onMounted(() => {
  fetchUser();
});
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 16px 32px;
  border-radius: 0 0 16px 16px;
  background-color: var(--pl-background);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 16px var(--pl-box-shadow);
  transition: background-color 0.3s, box-shadow 0.3s;

  &:hover {
    background-color: var(--background-color-hover);
    box-shadow: 0 12px 24px var(--pl-box-shadow-hover);
  }

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    padding: 0 16px;

    &__text {
      padding-left: 16px;

      h1 {
        font-size: 1.8rem;
        font-weight: bold;
        color: var(--pl-text);
        text-transform: uppercase;
        letter-spacing: 1.5px;
        transition: color 0.3s;
      }

      h1:hover {
        color: var(--pl-text-hover);
      }
    }
  }

  .nav-menu {
    display: flex;
    align-items: center;
    gap: 20px;

    ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      align-items: center;
    }

    li {
      position: relative;
      margin: 0 16px;

      &:hover::after,
      &.active::after {
        content: "";
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--pl-accent);
        transition: width 0.3s ease;
      }

      &::after {
        width: 0;
      }
    }

    a {
      color: var(--pl-text);
      font-size: 1rem;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: none;
      transition: color 0.3s, letter-spacing 0.3s;

      &:hover {
        color: var(--pl-text-hover);
        letter-spacing: 1px;
      }
    }

    .dropdown {
      position: relative;
      display: inline-block;

      .dropbtn {
        background: none;
        border: none;
        color: inherit;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        padding: 0;
      }

      .dropdown-content {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 150px;
        background-color: var(--pl-primary-hover);
        z-index: 1;
        border-radius: 4px;
        box-shadow: 0 2px 4px var(--pl-box-shadow);

        a {
          display: block;
          padding: 10px;
          color: var(--pl-text);
          text-decoration: none;
          transition: background-color 0.3s;
          &:hover {
            background-color: var(--background-color-hover);
          }
        }
      }

      &:hover .dropdown-content {
        display: block;
      }
    }
  }

  .menu-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-around;
    width: 30px;
    height: 30px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    z-index: 1000;

    .bar {
      width: 100%;
      height: 3px;
      background-color: var(--pl-text);
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .bar.open:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .bar.open:nth-child(2) {
      opacity: 0;
    }

    .bar.open:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }
  }
}

/* Адаптив для мобильных устройств */
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--pl-primary);
    flex-direction: column;
    gap: 10px;
    padding: 10px 0;
    transform: translateY(-100%);
    transition: transform 0.3s ease-in-out;

    ul {
      flex-direction: column;
      align-items: center;
    }

    a {
      padding: 10px 20px;
      width: 100%;
    }

    .dropdown {
      width: 100%;
      .dropdown-content {
        position: static;
        display: none;
        width: 100%;
        box-shadow: none;
        a {
          padding: 10px 20px;
        }
      }
      &:hover .dropdown-content {
        display: block;
      }
    }
  }

  .nav-menu.open {
    transform: translateY(0);
  }
}
</style>
