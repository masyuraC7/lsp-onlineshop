<template>
  <div>
    <Navbar />
    <div class="container mt-4 mb-5" style="max-width: 800px">
      <h3 class="mb-4 text-center">Form Registrasi</h3>
      <form @submit.prevent="submitForm">
        <div class="row g-3">
          <div class="col-md-6">
            <BaseInput
              v-model="form.namaLengkap"
              label="Nama Lengkap"
              :error="errors.namaLengkap"
              placeholder="Masukkan nama lengkap"
              @clear-error="clearError('namaLengkap')"
            />
            <BaseInput
              v-model="form.username"
              label="Username"
              :error="errors.username"
              placeholder="Masukkan username"
              @clear-error="clearError('username')"
            />
            <BaseInput
              v-model="form.email"
              label="Email"
              :error="errors.email"
              placeholder="Masukkan email"
              @clear-error="clearError('email')"
            />
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
            <BaseInput
              v-model="form.tglLahir"
              label="Tanggal Lahir"
              :error="errors.tglLahir"
              type="date"
              @clear-error="clearError('tglLahir')"
            />
            <BaseSelect
              v-model="form.jenisKelamin"
              label="Jenis Kelamin"
              :error="errors.jenisKelamin"
              placeholder="Pilih jenis kelamin"
              @clear-error="clearError('jenisKelamin')"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </BaseSelect>
          </div>
          <div class="col-md-6">
            <BaseTextarea
              v-model="form.alamat"
              label="Alamat"
              :error="errors.alamat"
              placeholder="Masukkan alamat lengkap"
              rows="3"
              @clear-error="clearError('alamat')"
            />
            <BaseInput
              v-model="form.kota"
              label="Kota"
              :error="errors.kota"
              placeholder="Contoh: Surabaya"
              @clear-error="clearError('kota')"
            />
            <BaseInput
              v-model="form.noHp"
              label="No HP"
              :error="errors.noHp"
              placeholder="08xxxxxxxxxx"
              type="tel"
              @clear-error="clearError('noHp')"
            />
            <BaseInput
              v-model="form.bank"
              label="Bank"
              :error="errors.bank"
              placeholder="Contoh: BCA, BRI"
              @clear-error="clearError('bank')"
            />
            <BaseInput
              v-model="form.noRek"
              label="No Rekening"
              :error="errors.noRek"
              placeholder="Masukkan nomor rekening"
              @clear-error="clearError('noRek')"
            />
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

<script setup>
import { ref, reactive, watch } from "vue";
import Navbar from "../components/Navbar.vue";
import BaseInput from "../components/BaseInput.vue";
import BaseTextarea from "../components/BaseTextarea.vue";
import BaseSelect from "../components/BaseSelect.vue";
import { useNotificationStore } from "../stores/NotificationStore.js";
import axios from "axios";
import {
  validateRequiredFields,
  validateEmail,
} from "../utils/validateForm.js";
import { useRouter } from "vue-router";

const loading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const passwordMismatch = ref(false);
const notifStore = useNotificationStore();
const router = useRouter();

const form = reactive({
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
});

const errors = reactive({});

function clearError(field) {
  errors[field] = "";
}

function validatePasswordMatch() {
  passwordMismatch.value =
    form.confirmPassword && form.password !== form.confirmPassword;
}

watch(() => form.password, validatePasswordMatch);
watch(() => form.confirmPassword, validatePasswordMatch);

function submitForm() {
  loading.value = true;
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  // Validasi reusable
  const requiredFields = [
    "namaLengkap",
    "username",
    "email",
    "password",
    "confirmPassword",
    "tglLahir",
    "jenisKelamin",
    "alamat",
    "kota",
    "noHp",
    "bank",
    "noRek",
  ];
  const newErrors = validateRequiredFields(form, requiredFields, {
    namaLengkap: "Nama lengkap harus diisi",
    username: "Username harus diisi",
    email: "Email harus diisi",
    password: "Password harus diisi",
    confirmPassword: "Konfirmasi password harus diisi",
    tglLahir: "Tanggal lahir harus diisi",
    jenisKelamin: "Jenis kelamin harus dipilih",
    alamat: "Alamat harus diisi",
    kota: "Kota harus diisi",
    noHp: "No HP harus diisi",
    bank: "Bank harus diisi",
    noRek: "Nomor rekening harus diisi",
  });
  Object.assign(errors, newErrors);
  const emailError = validateEmail(form.email);
  if (emailError) errors.email = emailError;
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Password tidak cocok";
  }
  if (Object.keys(errors).some((k) => errors[k])) {
    loading.value = false;
    notifStore.show("warning", "Lengkapi form dengan benar.");
    return;
  }
  axios
    .post("http://localhost:3001/api/auth/register", form)
    .then((res) => {
      notifStore.show("success", res.data.message);
      // Reset form setelah sukses
      Object.keys(form).forEach((k) => (form[k] = ""));
      router.push("/login");
    })
    .catch((err) => {
      let msg = "Terjadi kesalahan saat mendaftar.";
      if (err.response?.data?.error) msg = err.response.data.error;
      else if (err.message) msg = err.message;
      notifStore.show("error", msg);
    })
    .finally(() => {
      loading.value = false;
    });
}
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
</style>
