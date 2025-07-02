<template>
  <AdminNavbar />
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Daftar Kategori</h3>
      <button class="btn btn-primary" @click="openAddModal">
        Tambah Kategori
      </button>
    </div>
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Nama Kategori</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(cat, idx) in categories" :key="cat.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ cat.name }}</td>
          <td>
            <button
              class="btn btn-sm btn-warning me-2"
              @click="openEditModal(cat)"
            >
              Edit
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="confirmDelete(cat)"
            >
              Delete
            </button>
          </td>
        </tr>
        <tr v-if="categories.length === 0">
          <td colspan="3" class="text-center">Tidak ada kategori</td>
        </tr>
      </tbody>
    </table>
    <!-- Modal Tambah/Edit Kategori -->
    <SimpleModal
      id="categoryModal"
      :title="isEdit ? 'Edit Kategori' : 'Tambah Kategori'"
      :visible="showModal"
      @update:visible="showModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <form @submit.prevent="isEdit ? updateCategory() : addCategory()">
          <div class="mb-3">
            <label>Nama Kategori</label>
            <input
              v-model="modalCategory.name"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="showModal = false"
            >
              Batal
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? "Simpan" : "Tambah" }}
            </button>
          </div>
        </form>
      </template>
    </SimpleModal>
    <!-- Modal Konfirmasi Hapus -->
    <SimpleModal
      id="deleteConfirmModal"
      title="Konfirmasi Hapus"
      :visible="showDeleteConfirm"
      @update:visible="showDeleteConfirm = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div>
          Yakin ingin menghapus kategori <b>{{ deleteTarget?.name }}</b>?
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">
            Batal
          </button>
          <button class="btn btn-danger" @click="deleteCategory">Hapus</button>
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
      categories: [],
      showModal: false,
      isEdit: false,
      modalCategory: { id: null, name: "" },
      showDeleteConfirm: false,
      deleteTarget: null,
      notifStore: useNotificationStore(),
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await axios.get("http://localhost:3001/api/categories");
        this.categories = res.data;
      } catch (err) {
        this.notifStore.show("error", "Gagal mengambil data kategori");
      }
    },
    openAddModal() {
      this.isEdit = false;
      this.modalCategory = { id: null, name: "" };
      this.showModal = true;
    },
    openEditModal(cat) {
      this.isEdit = true;
      this.modalCategory = { ...cat };
      this.showModal = true;
    },
    async addCategory() {
      try {
        await axios.post("http://localhost:3001/api/categories", {
          name: this.modalCategory.name,
        });
        this.notifStore.show("success", "Kategori berhasil ditambah");
        this.showModal = false;
        this.fetchCategories();
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal menambah kategori"
        );
      }
    },
    async updateCategory() {
      try {
        await axios.put(
          `http://localhost:3001/api/categories/${this.modalCategory.id}`,
          { name: this.modalCategory.name }
        );
        this.notifStore.show("success", "Kategori berhasil diupdate");
        this.showModal = false;
        this.fetchCategories();
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal mengupdate kategori"
        );
      }
    },
    confirmDelete(cat) {
      this.deleteTarget = cat;
      this.showDeleteConfirm = true;
    },
    async deleteCategory() {
      try {
        await axios.delete(
          `http://localhost:3001/api/categories/${this.deleteTarget.id}`
        );
        this.notifStore.show("success", "Kategori berhasil dihapus");
        this.showDeleteConfirm = false;
        this.fetchCategories();
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal menghapus kategori"
        );
      }
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
</script>
