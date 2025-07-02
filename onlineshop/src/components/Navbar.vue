<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <div class="container-fluid">
      <router-link
        v-if="titleWithLink"
        to="/"
        class="navbar-brand d-flex align-items-center text-white text-decoration-none"
      >
        <img v-if="logo" :src="urlLogo" alt="Logo" height="30" class="me-2" />
        Online Shop
      </router-link>

      <a
        v-else
        class="navbar-brand d-flex align-items-center text-white text-decoration-none"
      >
        <img v-if="logo" :src="urlLogo" alt="Logo" height="30" class="me-2" />
        Online Shop
      </a>

      <div class="ms-auto d-flex align-items-center">
        <slot name="right">
          <router-link
            to="/"
            class="nav-link d-inline text-white me-4"
            active-class="active"
            >Home</router-link
          >
          <router-link
            to="/login"
            class="nav-link d-inline text-white me-4"
            active-class="active"
            >Login</router-link
          >
          <router-link
            to="/register"
            class="nav-link d-inline text-white me-4"
            active-class="active"
            >Register</router-link
          >
        </slot>

        <div v-if="showAccount" class="nav-item dropdown ms-2">
          <a
            href="#"
            class="nav-link d-flex align-items-center px-2"
            :class="{ show: accountDropdownOpen }"
            id="accountDropdown"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="accountDropdownOpen ? 'true' : 'false'"
            @click.prevent="toggleAccountDropdown"
          >
            <i class="bi bi-person-circle me-1" style="font-size: 1.4rem"></i>
            <i
              :class="
                accountDropdownOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'
              "
              style="font-size: 1rem"
            ></i>
          </a>
          <ul
            class="dropdown-menu dropdown-menu-end"
            :class="{ show: accountDropdownOpen }"
            aria-labelledby="accountDropdown"
          >
            <slot name="account-dropdown">
              <li><a class="dropdown-item" href="#">Profile</a></li>
              <li><a class="dropdown-item" href="#">Logout</a></li>
            </slot>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  logo: { type: Boolean, default: false },
  urlLogo: { type: String, default: "" },
  titleWithLink: { type: Boolean, default: true },
  showAccount: { type: Boolean, default: false },
});

const accountDropdownOpen = ref(false);

function toggleAccountDropdown() {
  accountDropdownOpen.value = !accountDropdownOpen.value;
}

function handleClickOutside(event) {
  const nav =
    event.currentTarget?.querySelector("nav") ||
    document.querySelector("nav.navbar");
  if (accountDropdownOpen.value && nav && !nav.contains(event.target)) {
    accountDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.navbar {
  z-index: 1000 !important;
  position: relative;
}

.nav-link {
  transition: color 0.3s ease;
  color: #fff !important;
  font-size: 1rem;
  padding: 0.5rem 1rem;
}

.nav-link:hover,
.nav-link.active {
  color: #0d6efd !important;
  font-weight: 600;
}

.nav-item .bi-person-circle {
  font-size: 1.4rem;
}

.nav-item .bi-chevron-up,
.nav-item .bi-chevron-down {
  font-size: 1rem;
  margin-left: 0.2em;
}

.dropdown-menu {
  min-width: 150px;
}
</style>
