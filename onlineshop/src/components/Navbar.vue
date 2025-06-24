<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark px-3">
    <div class="container-fluid">

      <router-link
        v-if="titleWithLink"
        to="/"
        class="navbar-brand d-flex align-items-center text-white text-decoration-none"
      >
        <img v-if="logo" :src="logo" alt="Logo" height="30" class="me-2" />
        Online Shop
      </router-link>

      <a
        v-else
        class="navbar-brand d-flex align-items-center text-white text-decoration-none"
      >
        <img v-if="logo" :src="logo" alt="Logo" height="30" class="me-2" />
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
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: ["logo, titleWithLink = true"],
};
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
</style>
