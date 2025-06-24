<template>
  <div
    class="position-fixed end-0"
    style="z-index: 1055; max-width: 350px; top: 60px; right: 1rem"
  >
    <transition-group name="slide-fade" tag="div">
      <div
        v-for="n in notifStore.notifications"
        :key="n.id"
        :class="[
          'alert',
          alertClass(n.type),
          'd-flex',
          'flex-column',
          'mb-2',
          'shadow',
        ]"
      >
        <div class="d-flex w-100 align-items-center justify-content-between">
          <div class="d-flex align-items-center">
            <i :class="iconClass(n.type)" class="me-2"></i>
            <span>{{ n.message }}</span>
          </div>
          <button
            type="button"
            class="btn-close ms-3"
            aria-label="Close"
            @click="remove(n.id)"
          ></button>
        </div>

        <!-- Progress bar -->
        <div class="progress mt-2 w-100" style="height: 4px">
          <div
            class="progress-bar"
            :style="{ width: progressMap[n.id] + '%' }"
          ></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useNotificationStore } from "../stores/NotificationStore.js";
import { watch, reactive, onUnmounted } from "vue";

export default {
  setup() {
    const notifStore = useNotificationStore();
    const progressMap = reactive({}); // Store width per notifikasi
    const intervalMap = {}; // Store interval ID per notifikasi

    const startProgress = (notif) => {
      if (intervalMap[notif.id]) return; // prevent multiple intervals

      const duration = notif.duration || 4000;
      const steps = 100;
      const stepTime = duration / steps;
      let current = 0;

      progressMap[notif.id] = 100;

      intervalMap[notif.id] = setInterval(() => {
        current++;
        progressMap[notif.id] = 100 - current;

        if (current >= steps) {
          clearInterval(intervalMap[notif.id]);
          delete progressMap[notif.id];
          delete intervalMap[notif.id];
        }
      }, stepTime);
    };

    watch(
      () => notifStore.notifications,
      (newVal) => {
        newVal.forEach((notif) => {
          if (!(notif.id in progressMap)) {
            startProgress(notif);
          }
        });
      },
      { immediate: true, deep: true }
    );

    const remove = (id) => {
      clearInterval(intervalMap[id]);
      delete intervalMap[id];
      delete progressMap[id];
      notifStore.remove(id);
    };

    onUnmounted(() => {
      Object.values(intervalMap).forEach(clearInterval);
    });

    const alertClass = (type) =>
      ({
        success: "alert-success",
        warning: "alert-warning",
        error: "alert-danger",
      }[type] || "alert-primary");

    const iconClass = (type) =>
      ({
        success: "bi bi-check-circle-fill text-success",
        warning: "bi bi-exclamation-triangle-fill text-warning",
        error: "bi bi-x-circle-fill text-danger",
      }[type] || "bi bi-info-circle-fill text-primary");

    return {
      notifStore,
      progressMap,
      alertClass,
      iconClass,
      remove,
    };
  },
};
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.progress-bar {
  background-color: rgba(0, 0, 0, 0.25);
  transition: width 0.1s linear;
}
</style>
