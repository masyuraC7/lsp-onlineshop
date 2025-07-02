<template>
  <div v-if="loading" class="yt-loading-bar">
    <div class="yt-loading-bar-inner"></div>
    <div class="yt-loading-bar-glow"></div>
  </div>
</template>
<script setup>
import { useLoadingStore } from "../stores/LoadingStore";
import { computed } from "vue";
const loadingStore = useLoadingStore();
const loading = computed(() => loadingStore.loading);
</script>
<style scoped>
.yt-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px; /* lebih ramping */
  z-index: 30000;
  pointer-events: none;
  background: transparent;
}
.yt-loading-bar-inner {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #00c6ff 0%, #0072ff 100%);
  box-shadow: 0 0 6px 1px #00c6ff66, 0 0 2px #0072ff;
  border-radius: 1.5px;
  transform: scaleX(0.2);
  transform-origin: left;
  animation: yt-bar-grow 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
.yt-loading-bar-glow {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 198, 255, 0.10) 0%,
    rgba(0, 114, 255, 0.06) 100%
  );
  filter: blur(3px);
  pointer-events: none;
}
@keyframes yt-bar-grow {
  0% {
    transform: scaleX(0.2);
    opacity: 0.7;
  }
  50% {
    transform: scaleX(0.7);
    opacity: 1;
  }
  100% {
    transform: scaleX(1);
    opacity: 0.7;
  }
}
</style>
