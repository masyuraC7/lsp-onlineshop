<template>
  <div>
    <AdminNavbar v-if="userRole === 'admin' || userRole === 'subadmin'" />
    <CustomerNavbar v-else />
    <div class="container mt-4 mb-5" style="max-width: 700px">
      <h3 class="mb-4 text-center">Profil Pengguna</h3>
      <div v-if="!editMode">
        <div class="row g-3">
          <div class="col-md-6">
            <table class="table table-borderless mb-0">
              <tbody>
                <tr>
                  <th>Nama Lengkap</th>
                  <td>{{ user.namaLengkap }}</td>
                </tr>
                <tr>
                  <th>Username</th>
                  <td>{{ user.username }}</td>
                </tr>
                <tr>
                  <th>Email</th>
                  <td>{{ user.email }}</td>
                </tr>
                <tr>
                  <th>Tanggal Lahir</th>
                  <td>{{ formatDate(user.tglLahir) }}</td>
                </tr>
                <tr>
                  <th>Jenis Kelamin</th>
                  <td>{{ formatGender(user.jenisKelamin) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-md-6">
            <table class="table table-borderless mb-0">
              <tbody>
                <tr>
                  <th>Alamat</th>
                  <td>{{ user.alamat }}</td>
                </tr>
                <tr>
                  <th>Kota</th>
                  <td>{{ user.kota }}</td>
                </tr>
                <tr>
                  <th>No HP</th>
                  <td>{{ user.noHp }}</td>
                </tr>
                <tr>
                  <th>Bank</th>
                  <td>{{ user.bank }}</td>
                </tr>
                <tr>
                  <th>No Rekening</th>
                  <td>{{ user.noRek }}</td>
                </tr>
                <tr>
                  <th>Role</th>
                  <td>{{ user.role }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-end mt-3">
          <button class="btn btn-outline-primary" @click="editMode = true">
            Edit Profile
          </button>
          <button
            class="btn btn-outline-secondary"
            @click="showPasswordModal = true"
          >
            Ubah Password
          </button>
        </div>
      </div>
      <form v-else @submit.prevent="saveProfile">
        <div class="row g-3">
          <div class="col-md-6">
            <BaseInput
              v-model="editUser.namaLengkap"
              label="Nama Lengkap"
              :error="errors.namaLengkap"
              placeholder="Masukkan nama lengkap"
            />
            <BaseInput
              v-model="editUser.username"
              label="Username"
              :error="errors.username"
              placeholder="Masukkan username"
            />
            <BaseInput
              v-model="editUser.email"
              label="Email"
              :error="errors.email"
              placeholder="Masukkan email"
              type="email"
            />
            <BaseInput
              v-model="editUser.tglLahir"
              label="Tanggal Lahir"
              :error="errors.tglLahir"
              type="date"
            />
            <BaseSelect
              v-model="editUser.jenisKelamin"
              label="Jenis Kelamin"
              :error="errors.jenisKelamin"
              placeholder="Pilih jenis kelamin"
            >
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </BaseSelect>
          </div>
          <div class="col-md-6">
            <BaseTextarea
              v-model="editUser.alamat"
              label="Alamat"
              :error="errors.alamat"
              placeholder="Masukkan alamat lengkap"
              rows="3"
            />
            <BaseInput
              v-model="editUser.kota"
              label="Kota"
              :error="errors.kota"
              placeholder="Masukkan kota"
            />
            <BaseInput
              v-model="editUser.noHp"
              label="No HP"
              :error="errors.noHp"
              placeholder="Masukkan no HP"
              type="tel"
            />
            <BaseInput
              v-model="editUser.bank"
              label="Bank"
              :error="errors.bank"
              placeholder="Masukkan nama bank"
            />
            <BaseInput
              v-model="editUser.noRek"
              label="No Rekening"
              :error="errors.noRek"
              placeholder="Masukkan nomor rekening"
            />
            <BaseInput
              v-model="editUser.role"
              label="Role"
              :error="''"
              disabled
            />
          </div>
        </div>
        <div class="d-flex gap-2 justify-content-end mt-3">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading || cooldown > 0"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            <span v-else-if="cooldown > 0">Tunggu {{ cooldown }} detik...</span>
            <span v-else>Simpan</span>
          </button>
          <button type="button" class="btn btn-secondary" @click="resetEdit">
            Reset
          </button>
          <button
            type="button"
            class="btn btn-outline-dark"
            @click="editMode = false"
          >
            Kembali
          </button>
        </div>
      </form>
    </div>
    <SimpleModal
      id="changePasswordModal"
      title="Ubah Password"
      :visible="showPasswordModal"
      @update:visible="showPasswordModal = $event"
      :buttons="[]"
    >
      <template #body>
        <form @submit.prevent="submitPasswordChange">
          <div class="mb-3">
            <label>Password Lama</label>
            <input
              v-model="passwordForm.oldPassword"
              type="password"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label>Password Baru</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label>Konfirmasi Password Baru</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="form-control"
              required
            />
          </div>
          <div class="d-flex gap-2 justify-content-end">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showPasswordModal = false"
              :disabled="passwordLoading"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="passwordLoading || passwordCooldown > 0"
            >
              <span
                v-if="passwordLoading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              <span v-else-if="passwordCooldown > 0"
                >Tunggu {{ passwordCooldown }} detik...</span
              >
              <span v-else>Ubah Password</span>
            </button>
          </div>
        </form>
      </template>
    </SimpleModal>
  </div>
</template>

<script setup>
import CustomerNavbar from "../components/CustomerNavbar.vue";
import AdminNavbar from "../components/AdminNavbar.vue";
import SimpleModal from "../components/SimpleModal.vue";
import BaseInput from "../components/BaseInput.vue";
import BaseTextarea from "../components/BaseTextarea.vue";
import BaseSelect from "../components/BaseSelect.vue";
import axios from "axios";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";
import { ref, computed, reactive, watch, onMounted } from "vue";
import {
  validateRequiredFields,
  validateEmail,
} from "../utils/validateForm.js";

const userStore = useUserStore();
const notifStore = useNotificationStore();
const user = ref({});
const editUser = ref({});
const editMode = ref(false);
const showPasswordModal = ref(false);
const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const userId = ref(null);
const loading = ref(false);
const cooldown = ref(0);
let cooldownInterval = null;
const passwordLoading = ref(false);
const passwordCooldown = ref(0);
let passwordCooldownInterval = null;
const errors = reactive({});

const userRole = computed(() => userStore.user?.role || "");

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
function formatGender(gender) {
  if (!gender) return "";
  if (gender === "L" || gender === "Laki-laki") return "Laki-laki";
  if (gender === "P" || gender === "Perempuan") return "Perempuan";
  return gender;
}

async function fetchUser() {
  userId.value = userStore.id;
  try {
    const res = await axios.get(
      `http://localhost:3001/api/users/${userId.value}`
    );
    const u = res.data;
    u.jenisKelamin = formatGender(u.jenisKelamin);
    user.value = u;
  } catch (err) {
    notifStore.show("error", "Gagal mengambil data user");
  }
}

function resetEdit() {
  editUser.value = { ...user.value };
  notifStore.show("success", "Edit mode telah direset");
}

async function saveProfile() {
  loading.value = true;
  cooldown.value = 0;
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  // Validasi reusable
  const requiredFields = [
    "namaLengkap",
    "username",
    "email",
    "tglLahir",
    "jenisKelamin",
    "alamat",
    "kota",
    "noHp",
    "bank",
    "noRek",
  ];
  const newErrors = validateRequiredFields(editUser.value, requiredFields, {
    namaLengkap: "Nama lengkap harus diisi",
    username: "Username harus diisi",
    email: "Email harus diisi",
    tglLahir: "Tanggal lahir harus diisi",
    jenisKelamin: "Jenis kelamin harus dipilih",
    alamat: "Alamat harus diisi",
    kota: "Kota harus diisi",
    noHp: "No HP harus diisi",
    bank: "Bank harus diisi",
    noRek: "Nomor rekening harus diisi",
  });
  Object.assign(errors, newErrors);
  const emailError = validateEmail(editUser.value.email);
  if (emailError) errors.email = emailError;
  if (Object.keys(errors).some((k) => errors[k])) {
    notifStore.show("warning", "Lengkapi form dengan benar.");
    loading.value = false;
    return;
  }
  const editUserToSave = { ...editUser.value };
  if (editUserToSave.jenisKelamin === "Laki-laki")
    editUserToSave.jenisKelamin = "L";
  else if (editUserToSave.jenisKelamin === "Perempuan")
    editUserToSave.jenisKelamin = "P";
  try {
    await axios.put(
      `http://localhost:3001/api/users/${userId.value}`,
      editUserToSave
    );
    user.value = { ...editUser.value };
    user.value.jenisKelamin = formatGender(user.value.jenisKelamin);
    editMode.value = false;
    notifStore.show("success", "Profil berhasil diperbarui");
  } catch (err) {
    notifStore.show("error", "Gagal update profil");
    cooldown.value = 3;
    cooldownInterval = setInterval(() => {
      if (cooldown.value > 0) cooldown.value--;
      if (cooldown.value === 0) clearInterval(cooldownInterval);
    }, 1000);
  } finally {
    loading.value = false;
  }
}

async function submitPasswordChange() {
  if (
    !passwordForm.oldPassword ||
    !passwordForm.newPassword ||
    !passwordForm.confirmPassword
  ) {
    notifStore.show("warning", "Semua field password harus diisi.");
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    notifStore.show("warning", "Password baru dan konfirmasi tidak cocok.");
    return;
  }
  passwordLoading.value = true;
  passwordCooldown.value = 0;
  try {
    await axios.put(
      `http://localhost:3001/api/users/${userId.value}/password`,
      {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      }
    );
    notifStore.show("success", "Password berhasil diubah!");
    showPasswordModal.value = false;
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    passwordForm.confirmPassword = "";
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal mengubah password"
    );
    passwordCooldown.value = 3;
    passwordCooldownInterval = setInterval(() => {
      if (passwordCooldown.value > 0) passwordCooldown.value--;
      if (passwordCooldown.value === 0) clearInterval(passwordCooldownInterval);
    }, 1000);
  } finally {
    passwordLoading.value = false;
  }
}

watch(editMode, (val) => {
  if (val) {
    editUser.value = { ...user.value };
  }
});

onMounted(() => {
  fetchUser();
});
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
</style>
