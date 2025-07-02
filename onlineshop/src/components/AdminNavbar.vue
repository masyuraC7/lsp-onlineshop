<template>
  <Navbar :titleWithLink="false" :showAccount="true">
    <template #right>
      <router-link
        to="/olshopv1/cpanel"
        class="nav-link d-inline text-white me-4"
        active-class="active"
        >Dashboard</router-link
      >
      <router-link
        to="/olshopv1/cpanel/products"
        class="nav-link d-inline text-white me-4"
        active-class="active"
        >Products</router-link
      >
      <router-link
        to="/olshopv1/cpanel/categories"
        class="nav-link d-inline text-white me-4"
        active-class="active"
        >Kategori</router-link
      >
      <router-link
        to="/olshopv1/cpanel/stocks"
        class="nav-link d-inline text-white me-4"
        active-class="active"
        >Stok</router-link
      >
      <router-link
        to="/olshopv1/transaction-history"
        class="nav-link d-inline text-white me-4"
        active-class="active"
        >Transaksi</router-link
      >
      <router-link
        to="/olshopv1/cpanel/users"
        class="nav-link d-inline text-white me-4"
        active-class="active"
        >Users</router-link
      >
    </template>
    <template #account-dropdown>
      <li>
        <router-link to="/olshopv1/profile" class="dropdown-item"
          >Profile</router-link
        >
      </li>
      <li>
        <button @click="handleLogout" class="dropdown-item">Logout</button>
      </li>
    </template>
  </Navbar>
</template>

<script setup>
import Navbar from "./Navbar.vue";
import { useUserStore } from "../stores/UserStore.js";
import { useNotificationStore } from "../stores/NotificationStore.js";
import { useRouter } from "vue-router";

const router = useRouter();
const userStore = useUserStore();
const notifStore = useNotificationStore();

function handleLogout() {
  userStore.clearUser();
  router.push("/login");
  notifStore.show("success", "Logout berhasil");
}
</script>

<style scoped>
.nav-link {
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #0d6efd !important;
  font-weight: 600;
}

.dropdown-menu .dropdown-item:hover,
.dropdown-menu .dropdown-item:focus {
  background-color: #0d6efd !important;
  color: #fff !important;
}
</style>
