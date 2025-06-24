import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    id: null,
    nama: null,
    username: null,
    role: null,
  }),
  getters: {
    user(state) {
      return {
        id: state.id,
        nama: state.nama,
        username: state.username,
        role: state.role,
      };
    },
    isAuthenticated(state) {
      return !!state.id && !!state.role;
    },
  },
  actions: {
    setUser(data) {
      this.id = data.id;
      this.nama = data.nama;
      this.username = data.username;
      this.role = data.role;

      // Simpan ke localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: this.id,
          nama: this.nama,
          username: this.username,
          role: this.role,
        })
      );
    },
    clearUser() {
      this.id = null;
      this.nama = null;
      this.username = null;
      this.role = null;
      localStorage.removeItem("user");
    },
    initFromLocalStorage() {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const data = JSON.parse(savedUser);
        this.setUser(data);
      }
    },
  },
});
