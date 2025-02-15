<template>
  <div>
    <FrogModal />
    <NuxtLayout />
  </div>
</template>

<script lang="ts" setup>
const { user, loading, error, fetchUser } = useUser();

useSeoMeta({
  titleTemplate: (title) =>
    title ? `${title} | Палн тренировок` : "План тренировок",
});

onMounted(() => {
  fetchUser();
});
</script>
<style lang="scss" src="~/assets/styles/index.scss"></style>
