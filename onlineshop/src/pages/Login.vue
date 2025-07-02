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

<script setup>
import { ref, reactive } from "vue";
import axios from "axios";
import Navbar from "../components/Navbar.vue";
import { useNotificationStore } from "../stores/NotificationStore.js";
import { useUserStore } from "../stores/UserStore.js";
import { useRouter } from "vue-router";

const notifStore = useNotificationStore();
const userStore = useUserStore();
const router = useRouter();

const loading = ref(false);
const form = reactive({
  identifier: "",
  password: "",
});
const errors = reactive({});

async function handleLogin() {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  loading.value = true;

  if (!form.identifier) errors.identifier = "Username/email harus diisi";
  if (!form.password) errors.password = "Password harus diisi";

  if (Object.keys(errors).some((k) => errors[k])) {
    loading.value = false;
    return;
  }

  try {
    const res = await axios.post("http://localhost:3001/api/auth/login", {
      identifier: form.identifier,
      password: form.password,
    });
    const { id, nama, username, role, message } = res.data;
    userStore.setUser({ id, nama, username, role });
    notifStore.show("success", message);
    form.identifier = "";
    form.password = "";
    Object.keys(errors).forEach((k) => (errors[k] = ""));
    if (role === "admin") router.push("/olshopv1/cpanel");
    else if (role === "customer") router.push("/olshopv1/products");
    else router.push("/");
  } catch (err) {
    let msg = "Login gagal";
    if (err.response?.data?.error) msg = err.response.data.error;
    else if (err.message) msg = err.message;
    notifStore.show("error", msg);
  } finally {
    loading.value = false;
  }
}
</script>
