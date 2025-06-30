<template>
  <div>
    <Navbar />
    <div class="container mt-4 mb-5" style="max-width: 800px">
      <h3 class="mb-4 text-center">Form Registrasi</h3>
      <form @submit.prevent="submitForm">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="form-group">
              <label>Nama Lengkap</label>
              <input
                v-model="form.namaLengkap"
                @input="clearError('namaLengkap')"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.namaLengkap }"
                placeholder="Masukkan nama lengkap"
              />
              <div class="invalid-feedback">{{ errors.namaLengkap }}</div>
            </div>
            <div class="form-group">
              <label>Username</label>
              <input
                v-model="form.username"
                @input="clearError('username')"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.username }"
                placeholder="Masukkan username"
              />
              <div class="invalid-feedback">{{ errors.username }}</div>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="form.email"
                @input="clearError('email')"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.email }"
                placeholder="Masukkan email"
              />
              <div class="invalid-feedback">{{ errors.email }}</div>
            </div>
            <div class="form-group">
              <label>Password</label>
              <div class="input-group">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  @input="clearError('password')"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Masukkan password"
                />
                <span
                  class="input-group-text"
                  @click="showPassword = !showPassword"
                  style="cursor: pointer"
                >
                  <i
                    :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
                  ></i>
                </span>
                <div class="invalid-feedback">{{ errors.password }}</div>
              </div>
            </div>
            <div class="form-group">
              <label>Konfirmasi Password</label>
              <div class="input-group">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="form.confirmPassword"
                  @input="clearError('confirmPassword')"
                  class="form-control"
                  :class="{
                    'is-invalid': errors.confirmPassword || passwordMismatch,
                  }"
                  placeholder="Ulangi password"
                />
                <span
                  class="input-group-text"
                  @click="showConfirmPassword = !showConfirmPassword"
                  style="cursor: pointer"
                >
                  <i
                    :class="
                      showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                    "
                  ></i>
                </span>
                <div class="invalid-feedback">
                  {{
                    errors.confirmPassword ||
                    (passwordMismatch ? "Password tidak cocok" : "")
                  }}
                </div>
              </div>
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input
                v-model="form.tglLahir"
                @input="clearError('tglLahir')"
                type="date"
                class="form-control"
                :class="{ 'is-invalid': errors.tglLahir }"
              />
              <div class="invalid-feedback">{{ errors.tglLahir }}</div>
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select
                v-model="form.jenisKelamin"
                @input="clearError('jenisKelamin')"
                class="form-select"
                :class="{ 'is-invalid': errors.jenisKelamin }"
              >
                <option value="" disabled>Pilih jenis kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <div class="invalid-feedback">{{ errors.jenisKelamin }}</div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Alamat</label>
              <textarea
                v-model="form.alamat"
                @input="clearError('alamat')"
                class="form-control"
                :class="{ 'is-invalid': errors.alamat }"
                placeholder="Masukkan alamat lengkap"
                rows="3"
              ></textarea>
              <div class="invalid-feedback">{{ errors.alamat }}</div>
            </div>
            <div class="form-group">
              <label>Kota</label>
              <input
                v-model="form.kota"
                @input="clearError('kota')"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.kota }"
                placeholder="Contoh: Surabaya"
              />
              <div class="invalid-feedback">{{ errors.kota }}</div>
            </div>
            <div class="form-group">
              <label>No HP</label>
              <input
                v-model="form.noHp"
                @input="clearError('noHp')"
                type="tel"
                class="form-control"
                :class="{ 'is-invalid': errors.noHp }"
                placeholder="08xxxxxxxxxx"
              />
              <div class="invalid-feedback">{{ errors.noHp }}</div>
            </div>
            <div class="form-group">
              <label>Bank</label>
              <input
                v-model="form.bank"
                @input="clearError('bank')"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.bank }"
                placeholder="Contoh: BCA, BRI"
              />
              <div class="invalid-feedback">{{ errors.bank }}</div>
            </div>
            <div class="form-group">
              <label>No Rekening</label>
              <input
                v-model="form.noRek"
                @input="clearError('noRek')"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.noRek }"
                placeholder="Masukkan nomor rekening"
              />
              <div class="invalid-feedback">{{ errors.noRek }}</div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          ></span>
          {{ loading ? "Memproses..." : "Daftar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import Navbar from "../components/Navbar.vue";
import { useNotificationStore } from "../stores/NotificationStore.js";
import axios from "axios";

export default {
  components: { Navbar },
  data() {
    return {
      loading: false,
      showPassword: false,
      showConfirmPassword: false,
      passwordMismatch: false,
      form: {
        namaLengkap: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        tglLahir: "",
        jenisKelamin: "",
        alamat: "",
        kota: "",
        noHp: "",
        bank: "",
        noRek: "",
      },
      errors: {},
    };
  },
  watch: {
    "form.password": "validatePasswordMatch",
    "form.confirmPassword": "validatePasswordMatch",
  },
  methods: {
    clearError(field) {
      this.errors[field] = "";
    },
    submitForm() {
      const notifStore = useNotificationStore();
      this.errors = {};
      this.loading = true;
      // Validasi field wajib
      if (!this.form.namaLengkap)
        this.errors.namaLengkap = "Nama lengkap harus diisi";
      if (!this.form.username) this.errors.username = "Username harus diisi";
      if (!this.form.email) {
        this.errors.email = "Email harus diisi";
      } else if (!this.form.email.includes("@")) {
        this.errors.email = "Email tidak valid, harus mengandung @gmail.com";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email)) {
        this.errors.email = "Format email tidak valid";
      }
      if (!this.form.password) this.errors.password = "Password harus diisi";
      if (!this.form.confirmPassword)
        this.errors.confirmPassword = "Konfirmasi password harus diisi";
      if (!this.form.tglLahir)
        this.errors.tglLahir = "Tanggal lahir harus diisi";
      if (!this.form.jenisKelamin)
        this.errors.jenisKelamin = "Jenis kelamin harus dipilih";
      if (!this.form.alamat) this.errors.alamat = "Alamat harus diisi";
      if (!this.form.kota) this.errors.kota = "Kota harus diisi";
      if (!this.form.noHp) this.errors.noHp = "No HP harus diisi";
      if (!this.form.bank) this.errors.bank = "Bank harus diisi";
      if (!this.form.noRek) this.errors.noRek = "Nomor rekening harus diisi";
      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = "Password tidak cocok";
      }
      if (Object.keys(this.errors).some((k) => this.errors[k])) {
        this.loading = false;
        notifStore.show("warning", "Lengkapi form dengan benar.");
        return;
      }
      axios
        .post("http://localhost:3001/api/auth/register", this.form)
        .then((res) => {
          notifStore.show("success", res.data.message);
          this.$router.push("/login");
        })
        .catch((err) => {
          notifStore.show(
            "error",
            err.response?.data?.error || "Terjadi kesalahan saat mendaftar."
          );
        })
        .finally(() => {
          this.loading = false;
        });
    },
    validatePasswordMatch() {
      this.passwordMismatch =
        this.form.confirmPassword &&
        this.form.password !== this.form.confirmPassword;
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
</style>
