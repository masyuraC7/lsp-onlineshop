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
        tabindex="0"
        @mouseenter="pause(n.id)"
        @mouseleave="resume(n.id)"
        @focus="pause(n.id)"
        @blur="resume(n.id)"
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
    const progressMap = reactive({});
    const timerMap = {}; 
    const remainingMap = {};
    const totalMap = {}; 
    const pausedAtMap = {}; 

    const TICK = 80;

    const startProgress = (notif) => {
      if (timerMap[notif.id]) return;
      const total = notif.duration || 4000;
      totalMap[notif.id] = total;
      remainingMap[notif.id] = total;
      progressMap[notif.id] = 100;
      let lastUpdate = Date.now();
      timerMap[notif.id] = setInterval(() => {
        const now = Date.now();
        const elapsed = now - lastUpdate;
        lastUpdate = now;
        remainingMap[notif.id] -= elapsed;
        if (remainingMap[notif.id] < 0) remainingMap[notif.id] = 0;
        progressMap[notif.id] =
          (remainingMap[notif.id] / totalMap[notif.id]) * 100;
        if (remainingMap[notif.id] <= 0) {
          clearInterval(timerMap[notif.id]);
          delete timerMap[notif.id];
          delete progressMap[notif.id];
          delete remainingMap[notif.id];
          delete totalMap[notif.id];
          delete pausedAtMap[notif.id];
          notifStore.remove(notif.id);
        }
      }, TICK);
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
      clearInterval(timerMap[id]);
      delete timerMap[id];
      delete progressMap[id];
      delete remainingMap[id];
      delete totalMap[id];
      delete pausedAtMap[id];
      notifStore.remove(id);
    };

    const pause = (id) => {
      if (timerMap[id]) {
        clearInterval(timerMap[id]);
        timerMap[id] = null;
        pausedAtMap[id] = Date.now();
      }
    };
    const resume = (id) => {
      if (!timerMap[id] && remainingMap[id] > 0) {
        let lastUpdate = Date.now();
        timerMap[id] = setInterval(() => {
          const now = Date.now();
          const elapsed = now - lastUpdate;
          lastUpdate = now;
          remainingMap[id] -= elapsed;
          if (remainingMap[id] < 0) remainingMap[id] = 0;
          progressMap[id] = (remainingMap[id] / totalMap[id]) * 100;
          if (remainingMap[id] <= 0) {
            clearInterval(timerMap[id]);
            delete timerMap[id];
            delete progressMap[id];
            delete remainingMap[id];
            delete totalMap[id];
            delete pausedAtMap[id];
            notifStore.remove(id);
          }
        }, TICK);
      }
    };

    onUnmounted(() => {
      Object.values(timerMap).forEach(clearInterval);
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
      pause,
      resume,
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
