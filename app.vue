<template>
  <div>
    <NuxtLayout />
  </div>
</template>

<script lang="ts" setup>
const { user, loading, error, fetchUser } = useUser();
onMounted(() => {
  fetchUser();
});
</script>
