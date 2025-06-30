<template>
  <div>
    <Navbar />
    <div class="container mt-5" style="max-width: 400px">
      <h3 class="mb-4">Login</h3>
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="identifier" class="form-label">Username/Email</label>
          <input
            v-model="form.identifier"
            @input="errors.identifier = ''"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errors.identifier }"
            placeholder="Masukkan username/email anda"
            id="identifier"
          />
          <div class="invalid-feedback">{{ errors.identifier }}</div>
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            v-model="form.password"
            @input="errors.password = ''"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            id="password"
            placeholder="Masukkan password anda"
          />
          <div class="invalid-feedback">{{ errors.password }}</div>
        </div>
        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          {{ loading ? "Memproses..." : "Login" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Navbar from "../components/Navbar.vue";
import { useNotificationStore } from "../stores/NotificationStore.js";
import { useUserStore } from "../stores/UserStore.js";

export default {
  components: { Navbar, Notification },
  data() {
    return {
      loading: false,
      form: {
        identifier: "",
        password: "",
      },
      notif: {
        visible: false,
        type: "success",
        message: "",
        duration: 4000,
      },
      errors: {},
    };
  },
  methods: {
    async handleLogin() {
      const notifStore = useNotificationStore();
      const userStore = useUserStore();
      this.errors = {};
      this.loading = true;

      if (!this.form.identifier)
        this.errors.identifier = "Username/email harus diisi";
      if (!this.form.password) this.errors.password = "Password harus diisi";

      if (Object.keys(this.errors).length > 0) {
        this.loading = false;
        return;
      }

      try {
        const res = await axios.post("http://localhost:3001/api/auth/login", {
          identifier: this.form.identifier, // email atau username
          password: this.form.password,
        });

        const { id, nama, username, role, message } = res.data;

        userStore.setUser({ id, nama, username, role });

        notifStore.show("success", message);

        if (role === "admin") this.$router.push("/olshopv1/cpanel");
        else if (role === "customer") this.$router.push("/olshopv1/products");
        else this.$router.push("/");
      } catch (err) {
        notifStore.show("error", err.response?.data?.error || "Login gagal");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
