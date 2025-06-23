<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <div class="flex-grow-1">
      <router-view />
    </div>
    <Footer />
  </div>
</template>

<script>
import Footer from './components/Footer.vue';
export default {
  components: { Footer },
};
</script>
