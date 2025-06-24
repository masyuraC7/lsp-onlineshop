<template>
  <div id="app" class="d-flex flex-column min-vh-100">
    <div class="flex-grow-1">
      <router-view />
    </div>
    <Footer v-if="!$route.meta.hideFooter" />
    <Notification />
  </div>
</template>

<script>
import Footer from "./components/Footer.vue";
import Notification from "./components/Notification.vue";
export default {
  components: { Footer, Notification },
};
</script>
