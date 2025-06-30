<template>
  <AdminNavbar />
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Daftar Pengguna</h3>
    </div>
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>ID</th>
          <th>Nama Lengkap</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Tanggal Daftar</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(user, idx) in users" :key="user.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ user.id }}</td>
          <td>{{ user.namaLengkap || user.full_name }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>{{ formatDate(user.created_at) }}</td>
          <td>
            <button class="btn btn-sm btn-info me-2" @click="viewUser(user)">
              Lihat
            </button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(user)">
              Delete
            </button>
          </td>
        </tr>
        <tr v-if="users.length === 0">
          <td colspan="8" class="text-center">Tidak ada data pengguna</td>
        </tr>
      </tbody>
    </table>
    <!-- Modal detail user -->
    <SimpleModal
      id="viewUserModal"
      title="Detail User"
      :visible="showViewModal"
      @update:visible="showViewModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div v-if="viewTarget">
          <table class="table table-sm table-borderless mb-0">
            <tbody>
              <tr v-for="(val, key) in userFields(viewTarget)" :key="key">
                <th class="text-end" style="width: 140px">{{ key }}</th>
                <td>{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </SimpleModal>
    <!-- Modal konfirmasi hapus -->
    <SimpleModal
      id="deleteUserModal"
      title="Konfirmasi Hapus User"
      :visible="showDeleteModal"
      @update:visible="showDeleteModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div>
          Yakin ingin menghapus user <b>{{ deleteTarget?.username }}</b
          >?
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="showDeleteModal = false">
            Batal
          </button>
          <button class="btn btn-danger" @click="deleteUser">Hapus</button>
        </div>
      </template>
    </SimpleModal>
  </div>
</template>

<script>
import AdminNavbar from "../components/AdminNavbar.vue";
import SimpleModal from "../components/SimpleModal.vue";
import axios from "axios";
import { useNotificationStore } from "../stores/NotificationStore";

export default {
  components: { AdminNavbar, SimpleModal },
  data() {
    return {
      users: [],
      showDeleteModal: false,
      deleteTarget: null,
      notifStore: useNotificationStore(),
      showViewModal: false,
      viewTarget: null,
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await axios.get("http://localhost:3001/api/users");
        this.users = res.data;
      } catch (err) {
        this.users = [];
      }
    },
    formatDate(str) {
      if (!str) return "";
      // Support timestamp, string, Date
      const d = typeof str === "number" ? new Date(str * 1000) : new Date(str);
      return d.toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
    viewUser(user) {
      this.viewTarget = user;
      this.showViewModal = true;
    },
    confirmDelete(user) {
      this.deleteTarget = user;
      this.showDeleteModal = true;
    },
    async deleteUser() {
      if (!this.deleteTarget) return;
      try {
        await axios.delete(
          `http://localhost:3001/api/users/${this.deleteTarget.id}`
        );
        this.notifStore.add({
          title: "Sukses",
          message: `User ${this.deleteTarget.username} berhasil dihapus`,
          type: "success",
        });
        this.showDeleteModal = false;
        this.fetchUsers();
      } catch (err) {
        this.notifStore.add({
          title: "Gagal",
          message: `Gagal menghapus user ${this.deleteTarget.username}`,
          type: "danger",
        });
      }
    },
    userFields(user) {
      // Tampilkan semua field kecuali password
      const exclude = ["password"];
      const map = {
        id: "ID",
        namaLengkap: "Nama Lengkap",
        full_name: "Nama Lengkap",
        username: "Username",
        email: "Email",
        tglLahir: "Tanggal Lahir",
        birth_date: "Tanggal Lahir",
        jenisKelamin: "Jenis Kelamin",
        gender: "Jenis Kelamin",
        alamat: "Alamat",
        address: "Alamat",
        kota: "Kota",
        city: "Kota",
        noHp: "No HP",
        phone: "No HP",
        bank: "Bank",
        bank_name: "Bank",
        noRek: "No Rekening",
        bank_account: "No Rekening",
        role: "Role",
        created_at: "Tanggal Daftar",
      };
      const result = {};
      for (const key in user) {
        if (exclude.includes(key)) continue;
        let label = map[key] || key;
        let val = user[key];
        if (key === "created_at" || key === "tglLahir" || key === "birth_date")
          val = this.formatDate(val);
        result[label] = val;
      }
      return result;
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
