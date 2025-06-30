<template>
  <div>
    <CustomerNavbar />
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
            <div class="form-group">
              <label>Nama Lengkap</label>
              <input
                v-model="editUser.namaLengkap"
                type="text"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Username</label>
              <input
                v-model="editUser.username"
                type="text"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="editUser.email"
                type="email"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Tanggal Lahir</label>
              <input
                v-model="editUser.tglLahir"
                type="date"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Jenis Kelamin</label>
              <select v-model="editUser.jenisKelamin" class="form-select">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group">
              <label>Alamat</label>
              <textarea
                v-model="editUser.alamat"
                class="form-control"
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Kota</label>
              <input v-model="editUser.kota" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>No HP</label>
              <input v-model="editUser.noHp" type="tel" class="form-control" />
            </div>
            <div class="form-group">
              <label>Bank</label>
              <input v-model="editUser.bank" type="text" class="form-control" />
            </div>
            <div class="form-group">
              <label>No Rekening</label>
              <input
                v-model="editUser.noRek"
                type="text"
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label>Role</label>
              <input
                v-model="editUser.role"
                type="text"
                class="form-control"
                disabled
              />
            </div>
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

<script>
import CustomerNavbar from "../components/CustomerNavbar.vue";
import SimpleModal from "../components/SimpleModal.vue";
import axios from "axios";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";

export default {
  components: { CustomerNavbar, SimpleModal },
  data() {
    return {
      user: {},
      editUser: {},
      editMode: false,
      showPasswordModal: false,
      passwordForm: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      userId: null,
      notifStore: useNotificationStore(),
      userStore: useUserStore(),
      loading: false,
      cooldown: 0,
      cooldownInterval: null,
      passwordLoading: false,
      passwordCooldown: 0,
      passwordCooldownInterval: null,
    };
  },
  methods: {
    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    },
    formatGender(gender) {
      if (!gender) return "";
      if (gender === "L" || gender === "Laki-laki") return "Laki-laki";
      if (gender === "P" || gender === "Perempuan") return "Perempuan";
      return gender;
    },
    async fetchUser() {
      this.userId = this.userStore.id;
      try {
        const res = await axios.get(
          `http://localhost:3001/api/users/${this.userId}`
        );
        // Konversi gender ke string readable
        const user = res.data;
        user.jenisKelamin = this.formatGender(user.jenisKelamin);
        this.user = user;
      } catch (err) {
        this.notifStore.show("error", "Gagal mengambil data user");
      }
    },
    resetEdit() {
      this.editUser = { ...this.user };
      this.notifStore.show("success", "Edit mode telah direset");
    },
    async saveProfile() {
      this.loading = true;
      this.cooldown = 0;
      const editUserToSave = { ...this.editUser };
      if (editUserToSave.jenisKelamin === "Laki-laki")
        editUserToSave.jenisKelamin = "L";
      else if (editUserToSave.jenisKelamin === "Perempuan")
        editUserToSave.jenisKelamin = "P";

      try {
        await axios.put(
          `http://localhost:3001/api/users/${this.userId}`,
          editUserToSave
        );
        this.user = { ...this.editUser };
        this.user.jenisKelamin = this.formatGender(this.user.jenisKelamin);
        this.editMode = false;
        this.notifStore.show("success", "Profil berhasil diperbarui");
      } catch (err) {
        this.notifStore.show("error", "Gagal update profil");
        this.cooldown = 3;
        this.cooldownInterval = setInterval(() => {
          if (this.cooldown > 0) this.cooldown--;
          if (this.cooldown === 0) clearInterval(this.cooldownInterval);
        }, 1000);
      } finally {
        this.loading = false;
      }
    },
    async submitPasswordChange() {
      if (
        !this.passwordForm.oldPassword ||
        !this.passwordForm.newPassword ||
        !this.passwordForm.confirmPassword
      ) {
        this.notifStore.show("warning", "Semua field password harus diisi.");
        return;
      }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.notifStore.show(
          "warning",
          "Password baru dan konfirmasi tidak cocok."
        );
        return;
      }
      this.passwordLoading = true;
      this.passwordCooldown = 0;
      try {
        await axios.put(
          `http://localhost:3001/api/users/${this.userId}/password`,
          {
            oldPassword: this.passwordForm.oldPassword,
            newPassword: this.passwordForm.newPassword,
          }
        );
        this.notifStore.show("success", "Password berhasil diubah!");
        this.showPasswordModal = false;
        this.passwordForm = {
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal mengubah password"
        );
        this.passwordCooldown = 3;
        this.passwordCooldownInterval = setInterval(() => {
          if (this.passwordCooldown > 0) this.passwordCooldown--;
          if (this.passwordCooldown === 0)
            clearInterval(this.passwordCooldownInterval);
        }, 1000);
      } finally {
        this.passwordLoading = false;
      }
    },
  },
  watch: {
    editMode(val) {
      if (val) {
        this.editUser = { ...this.user };
      }
    },
  },
  mounted() {
    this.fetchUser();
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 15px;
}
</style>
