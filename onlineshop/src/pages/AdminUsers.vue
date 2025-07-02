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

<script setup>
import AdminNavbar from "../components/AdminNavbar.vue";
import SimpleModal from "../components/SimpleModal.vue";
import axios from "axios";
import { ref, onMounted } from "vue";
import { useNotificationStore } from "../stores/NotificationStore";

const users = ref([]);
const showDeleteModal = ref(false);
const deleteTarget = ref(null);
const notifStore = useNotificationStore();
const showViewModal = ref(false);
const viewTarget = ref(null);

const fetchUsers = async () => {
  try {
    const res = await axios.get("http://localhost:3001/api/users");
    users.value = res.data;
  } catch (err) {
    users.value = [];
    notifStore.show("error", "Gagal memuat data pengguna");
  }
};

function formatDate(str) {
  if (!str) return "";
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
}

function viewUser(user) {
  viewTarget.value = user;
  showViewModal.value = true;
}

function confirmDelete(user) {
  deleteTarget.value = user;
  showDeleteModal.value = true;
}

async function deleteUser() {
  if (!deleteTarget.value) return;
  try {
    await axios.delete(
      `http://localhost:3001/api/users/${deleteTarget.value.id}`
    );
    notifStore.show(
      "success",
      `User ${deleteTarget.value.username} berhasil dihapus`
    );
    showDeleteModal.value = false;
    fetchUsers();
  } catch (err) {
    notifStore.show(
      "error",
      `Gagal menghapus user ${deleteTarget.value.username}`
    );
  }
}

function userFields(user) {
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
      val = formatDate(val);
    result[label] = val;
  }
  return result;
}

onMounted(fetchUsers);
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>
