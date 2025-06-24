import { defineStore } from "pinia";

let idCounter = 0;

export const useNotificationStore = defineStore("notification", {
  state: () => ({
    notifications: [],
  }),
  actions: {
    show(type, message, duration = 4000) {
      const id = ++idCounter;
      this.notifications.unshift({ id, type, message, duration });

      setTimeout(() => this.remove(id), duration);
    },
    remove(id) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
});
