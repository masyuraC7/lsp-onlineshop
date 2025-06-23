<template>
  <div>
    <Navbar />
    <div class="container mt-5" style="max-width: 400px">
      <h3 class="mb-4">Login</h3>
      <form>
        <div class="mb-3">
          <label for="username" class="form-label">Username/Email</label>
          <input
            type="text"
            class="form-control"
            placeholder="Masukkan username/email anda"
            id="username"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            placeholder="Masukkan password anda"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary w-100">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
export default { components: { Navbar } };
</script>
