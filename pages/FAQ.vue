<template>
  <div class="guide-page">
    <!-- Если пользователь авторизован, выводим персональное руководство -->
    <div
      v-if="user && (user.role === 'COACH' || user.role === 'PARTICIPANT')"
      class="personal-guide"
    >
      <h1 class="page-title">
        {{
          user.role === "COACH"
            ? "Руководство для тренера"
            : "Руководство для участника"
        }}
      </h1>
      <div class="guide-content">
        <template v-if="user.role === 'COACH'">
          <h2>Регистрация и управление аккаунтом</h2>
          <p>
            Тренер регистрируется на сайте самостоятельно, заполняя форму
            регистрации. После входа в личный кабинет вы можете создавать
            аккаунты для учеников – каждому автоматически генерируется логин и
            пароль, а также привязываются они к вашему аккаунту.
          </p>
          <h2>Создание тренировочных планов</h2>
          <p>
            Вы можете создавать индивидуальные и групповые тренировочные планы.
            План включает выбор дня недели, подробное описание, список
            упражнений с указанием нагрузки и возможность редактирования. Вы
            также можете назначать план для текущей или следующей недели, а
            система автоматически определит актуальность плана.
          </p>
          <h2>Управление группами и учениками</h2>
          <p>
            Объединяйте учеников в группы и назначайте им тренировки. При
            добавлении нового ученика в группу система автоматически связывает
            его с уже созданными тренировочными планами, чтобы он сразу получил
            доступ к актуальным занятиям.
          </p>
          <h2>Дополнительный функционал</h2>
          <p>
            Помимо базовых функций, сайт включает интеграцию с SEO‑оптимизацией,
            адаптивный дизайн для всех устройств, удобную админ-панель для
            управления контентом и систему аналитики для контроля эффективности
            тренировочного процесса.
          </p>
        </template>
        <template v-else>
          <h2>Как использовать сайт</h2>
          <p>
            В личном кабинете участника вы можете просматривать свой план
            тренировок, отмечать достижения и получать обновления от тренера.
            Сайт разработан с акцентом на простоту и удобство: все необходимые
            функции легко доступны, а интерфейс интуитивно понятен.
          </p>
          <h2>Выполнение тренировок</h2>
          <p>
            Выбирайте тренировку, следите за списком упражнений, и отправляйте
            отчёты о выполнении – всё это находится в вашем личном кабинете.
          </p>
          <h2>Управление данными</h2>
          <p>
            Редактируйте свои личные данные, изменяйте настройки и получайте
            консультации через встроенный онлайн-чат.
          </p>
        </template>
      </div>
    </div>

    <!-- Если пользователь не авторизован, выводим общие разделы с переключением -->
    <div v-else class="full-guide">
      <h2 class="page-subtitle">Полное руководство по сайту</h2>
      <div class="cards">
        <div
          class="card"
          :class="{ active: activeCard === 'coach' }"
          @click="activeCard = 'coach'"
        >
          <div class="card-header">
            <h3>Тренер</h3>
          </div>
          <div class="card-content">
            <p>
              Вы тренер? Узнайте, как регистрироваться, создавать аккаунты для
              учеников, формировать и управлять тренировочными планами, а также
              объединять учеников в группы для эффективного контроля
              тренировочного процесса.
            </p>
          </div>
        </div>
        <div
          class="card"
          :class="{ active: activeCard === 'participant' }"
          @click="activeCard = 'participant'"
        >
          <div class="card-header">
            <h3>Участник</h3>
          </div>
          <div class="card-content">
            <p>
              Вы участник? Узнайте, как использовать сайт для просмотра и
              выполнения тренировок, отмечать достижения и редактировать личные
              данные через удобный личный кабинет.
            </p>
          </div>
        </div>
      </div>
      <div class="full-guide-content">
        <template v-if="activeCard === 'coach'">
          <h3>Регистрация</h3>
          <p>
            Для регистрации как тренер перейдите на страницу
            <NuxtLink to="/register">Регистрация</NuxtLink> и заполните форму.
            После регистрации получите доступ к управлению учениками и созданию
            тренировочных планов.
          </p>
          <h3>Добавление учеников</h3>
          <p>
            Создавайте аккаунты для учеников на странице
            <NuxtLink to="/coach/participants">Управление участниками</NuxtLink
            >. Новые ученики автоматически получают данные для входа, которые
            можно изменить при первом входе.
          </p>
          <h3>Создание тренировочных планов</h3>
          <p>
            Формируйте планы тренировок на странице
            <NuxtLink to="/coach/create-training-plan">Создать план</NuxtLink> с
            выбором дня недели, описанием, списком упражнений и назначением для
            текущей или следующей недели.
          </p>
          <h3>Управление группами</h3>
          <p>
            Объединяйте учеников в группы и назначайте им соответствующие планы
            на странице
            <NuxtLink to="/coach/groups">Управление группами</NuxtLink>. Новые
            участники, добавленные в группу, автоматически получают план.
          </p>
        </template>
        <template v-else-if="activeCard === 'participant'">
          <h3>Как использовать сайт</h3>
          <p>
            Для доступа к тренировочным планам войдите на страницу
            <NuxtLink to="/participant/dashboard">Панель участника</NuxtLink> и
            ознакомьтесь с индивидуальным расписанием.
          </p>
          <h3>Выполнение тренировок</h3>
          <p>
            Просматривайте список упражнений, отмечайте выполнение и отправляйте
            отчёты тренеру.
          </p>
          <h3>Управление данными</h3>
          <p>
            Редактируйте свои личные данные и следите за прогрессом в личном
            кабинете <NuxtLink to="/account">Личный кабинет</NuxtLink>.
          </p>
        </template>
      </div>
    </div>

    <!-- Блок FAQ -->
    <div class="faq-section">
      <h1 class="page-title">Часто задаваемые вопросы</h1>
      <div class="faq-item" v-for="(faq, index) in faqs" :key="index">
        <h2 class="question">{{ faq.question }}</h2>
        <p class="answer">{{ faq.answer }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { NuxtLink } from "#components";
const { user } = useUser();
const activeCard = ref("coach");

const faqs = ref([
  {
    question: "Как зарегистрироваться на сайте?",
    answer:
      "Нажмите на кнопку 'Регистрация' в верхнем правом углу и заполните форму. Для тренеров регистрация открыта самостоятельно, а участники получают данные от тренера.",
  },
  {
    question: "Как добавить учеников в группу?",
    answer:
      "В панели тренера перейдите в раздел 'Управление группами', выберите группу и добавьте учеников через удобный интерфейс.",
  },
  {
    question: "Как просматривать план тренировок?",
    answer:
      "Участники могут перейти в личный кабинет и выбрать вкладку с планом тренировок, где отображаются как общий, так и текущий план.",
  },
  {
    question: "Как изменить пароль?",
    answer:
      "Перейдите в личный кабинет, выберите 'Изменить пароль' и следуйте инструкциям.",
  },
  // Добавьте больше FAQ по необходимости
]);
</script>

<style scoped lang="scss">
.guide-page {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
  font-family: "Roboto", sans-serif;
  color: var(--pl-text);
  background: var(--pl-background);

  .page-title {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
    color: var(--pl-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .page-subtitle {
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: var(--pl-primary);
  }

  .personal-guide {
    .guide-content {
      margin-bottom: 40px;
      h2 {
        font-size: 1.4rem;
        margin: 10px 0;
        color: var(--pl-primary);
      }
      p {
        font-size: 1rem;
        margin: 5px 0 15px;
      }
    }
  }

  .cards {
    display: flex;
    justify-content: space-around;
    gap: 20px;
    margin-bottom: 20px;
    .card {
      flex: 1;
      background: #fff;
      border: 1px solid var(--pl-border);
      border-radius: 8px;
      box-shadow: 0 2px 4px var(--pl-box-shadow);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
      text-align: center;
      padding: 20px;
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 8px var(--pl-box-shadow-hover);
      }
      &.active {
        border-color: var(--pl-primary);
      }
      .card-header {
        margin-bottom: 10px;
        h3 {
          font-size: 1.4rem;
          color: var(--pl-primary);
        }
      }
      .card-content {
        font-size: 0.95rem;
        color: var(--pl-text);
      }
    }
  }

  .full-guide-content {
    margin-bottom: 40px;
    h3 {
      font-size: 1.3rem;
      color: var(--pl-primary);
      margin: 10px 0;
    }
    p {
      font-size: 1rem;
      margin: 5px 0 15px;
    }
    a {
      color: var(--pl-link);
      text-decoration: none;
      font-weight: bold;
      transition: color 0.3s;
      &:hover {
        color: var(--pl-link-hover);
      }
    }
  }

  .faq-section {
    margin-top: 40px;
    .faq-item {
      margin-bottom: 20px;
      .question {
        font-size: 1.1rem;
        font-weight: bold;
        margin-bottom: 5px;
        color: var(--pl-primary);
      }
      .answer {
        font-size: 1rem;
        color: var(--pl-text);
      }
    }
  }
}

/* Стили для кастомных дропдаунов */
.custom-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding: 5px 10px;
  font-size: 0.9rem;
  border: 1px solid var(--pl-border);
  border-radius: 4px;
  background-color: #fff;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%204%205'%3E%3Cpath%20fill='%23666'%20d='M2%205L0%200h4L2%205z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 8px 10px;
}

@media (max-width: 600px) {
  .guide-page {
    padding: 15px;
    .page-title {
      font-size: 1.8rem;
    }
    .cards {
      flex-direction: column;
    }
  }
}
</style>
