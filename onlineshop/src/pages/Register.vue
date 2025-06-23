<template>
  <div>
    <Navbar />
    <div class="container mt-4 mb-5" style="max-width: 800px">
      <h3 class="mb-4 text-center">Form Registrasi</h3>
      <form @submit.prevent="submitForm">
        <div class="row g-3">
          <!-- Kolom Kiri -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Nama Lengkap</label>
              <input
                v-model="form.namaLengkap"
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

          <!-- Kolom Kanan -->
          <div class="col-md-6">
            <div class="form-group">
              <label>Alamat</label>
              <textarea
                v-model="form.alamat"
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
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.noRek }"
                placeholder="Masukkan nomor rekening"
              />
              <div class="invalid-feedback">{{ errors.noRek }}</div>
            </div>
          </div>
        </div>

        <button type="submit" class="btn btn-success mt-4 w-100">Daftar</button>
      </form>
    </div>
  </div>

  <Notification
    v-if="notifVisible"
    :type="notifType"
    :message="notifMessage"
    @closed="notifVisible = false"
  />
</template>

<script>
import Navbar from "../components/Navbar.vue";
import Notification from "../components/Notification.vue";
import axios from "axios";

export default {
  components: { Navbar, Notification },
  data() {
    return {
      showPassword: false,
      showConfirmPassword: false,
      passwordMismatch: false,
      notifVisible: false,
      notifMessage: "",
      notifType: "success",
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
    "form.namaLengkap"(val) {
      if (val) this.errors.namaLengkap = "";
    },
    "form.username"(val) {
      if (val) this.errors.username = "";
    },
    "form.email"(val) {
      if (val) this.errors.email = "";
    },
    "form.password"(val) {
      if (val) this.errors.password = "";
      this.validatePasswordMatch();
    },
    "form.confirmPassword"(val) {
      if (val) this.errors.confirmPassword = "";
      this.validatePasswordMatch();
    },
    "form.tglLahir"(val) {
      if (val) this.errors.tglLahir = "";
    },
    "form.jenisKelamin"(val) {
      if (val) this.errors.jenisKelamin = "";
    },
    "form.alamat"(val) {
      if (val) this.errors.alamat = "";
    },
    "form.kota"(val) {
      if (val) this.errors.kota = "";
    },
    "form.noHp"(val) {
      if (val) this.errors.noHp = "";
    },
    "form.bank"(val) {
      if (val) this.errors.bank = "";
    },
    "form.noRek"(val) {
      if (val) this.errors.noRek = "";
    },
  },
  methods: {
    submitForm() {
      this.errors = {};

      // Validasi field wajib
      if (!this.form.namaLengkap)
        this.errors.namaLengkap = "Nama lengkap harus diisi";
      if (!this.form.username) this.errors.username = "Username harus diisi";
      if (!this.form.email) {
        this.errors.email = "Email harus diisi";
      } else if (!this.form.email.includes("@")) {
        this.errors.email = "Email tidak valid, harus mengandung @mail";
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

      // Hentikan submit jika ada error
      if (Object.keys(this.errors).length > 0) return;

      // Jika lolos validasi
      axios
        .post("http://localhost:3001/api/register", this.form)
        .then((res) => {
          this.showNotif("success", res.data.message);
            this.$router.push("/login");
        })
        .catch((err) => {
          this.showNotif(
            "error",
            err.response.data.error || "Terjadi kesalahan saat mendaftar."
          );
        });
    },
    validatePasswordMatch() {
      // Cek hanya jika user sudah mulai mengetik konfirmasi password
      if (this.form.confirmPassword) {
        this.passwordMismatch =
          this.form.password !== this.form.confirmPassword;
      } else {
        this.passwordMismatch = false;
      }
    },
    showNotif(type = "success", msg) {
      this.notifMessage = msg;
      this.notifType = type;
      this.notifVisible = true;
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
</style>
