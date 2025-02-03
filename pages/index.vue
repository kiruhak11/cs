<template>
  <div class="main">
    <h1>Welcom to my site</h1>
    <p v-if="user">Maybe go to <NuxtLink to="/cases">cases</NuxtLink>?</p>
    <p v-else-if="loading">Loading...</p>
    <p v-else>
      <NuxtLink to="/login">Login</NuxtLink> or
      <NuxtLink to="/register">register</NuxtLink>.
    </p>
  </div>
</template>
<script setup lang="ts">
const { user, loading, error, fetchUser } = useUser();
onMounted(() => fetchUser());
</script>
<style lang="scss">
.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  p {
    font-size: 1.2rem;
  }
}
</style>
