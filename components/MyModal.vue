<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <header class="modal-header">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <button class="modal-close" @click="closeModal">×</button>
      </header>
      <div class="modal-body">
        <p>{{ modalText }}</p>
      </div>
      <footer class="modal-footer">
        <button class="full" @click="handleButtonClick">
          {{ modalButtonText }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modalTitle: {
    type: String,
    default: "Заголовок",
  },
  modalText: {
    type: String,
    default: "Основной текст",
  },
  modalButtonText: {
    type: String,
    default: "Закрыть",
  },
  onButtonClick: {
    type: Function,
    default: null,
  },
});

const closeModal = () => {
  const [, close] = useFrogModal();
  close();
};

const handleButtonClick = () => {
  if (typeof props.onButtonClick === "function") {
    props.onButtonClick();
  }
  closeModal();
};
</script>

<style scoped>
.full {
  padding: 8px 16px;
  background: var(--pl-primary);
  color: var(--pl-background);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--pl-shadow);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--pl-background);
  color: var(--pl-text);
  border-radius: 12px;
  box-shadow: 0 10px 20px var(--pl-shadow);
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  background: var(--pl-primary);
  color: var(--pl-text);
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--pl-border);
}

.modal-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--pl-background);
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--pl-text);
  transition: color 0.2s;

  color: var(--pl-background);
}

.modal-close:hover {
  color: var(--pl-primary);
}

.modal-body {
  padding: 20px;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.modal-footer {
  padding: 16px;
  text-align: right;
  border-top: 1px solid var(--pl-border);
}

.modal-button:hover {
  background: var(--pl-primary);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
