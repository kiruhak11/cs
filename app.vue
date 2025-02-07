<template>
  <div>
    <NuxtLayout />
  </div>
</template>

<script lang="ts" setup>
const { user, loading, error, fetchUser } = useUser();

useSeoMeta({
  titleTemplate: (title) =>
    title ? `${title} | Personal Trainer` : "Personal Trainer",
});

onMounted(() => {
  fetchUser();
});
</script>
<style lang="scss" src="~/assets/styles/index.scss"></style>
