<template>
  <AdminNavbar />
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Daftar Produk</h3>
      <button class="btn btn-primary" @click="openAddModal">
        Tambah Produk
      </button>
    </div>
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Nama</th>
          <th>Kategori</th>
          <th>Harga</th>
          <th>Total Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product, idx) in products" :key="product.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.category }}</td>
          <td>Rp{{ product.price.toLocaleString() }}</td>
          <td>{{ product.stock != null ? product.stock : 0 }}</td>
          <td>
            <button
              class="btn btn-sm btn-warning me-2"
              @click="openEditModal(product)"
            >
              Edit
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="confirmDelete(product)"
            >
              Delete
            </button>
          </td>
        </tr>
        <tr v-if="products.length === 0">
          <td colspan="6" class="text-center">Tidak ada produk</td>
        </tr>
      </tbody>
    </table>

    <!-- SimpleModal Tambah/Edit Produk -->
    <SimpleModal
      id="productModal"
      :title="isEdit ? 'Edit Produk' : 'Tambah Produk'"
      :visible="showModal"
      @update:visible="showModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <form @submit.prevent="isEdit ? updateProduct() : addProduct()">
          <div class="mb-3">
            <label>Nama Produk</label>
            <input
              v-model="modalProduct.name"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label>Kategori</label>
            <input
              v-model="modalProduct.category"
              type="text"
              class="form-control"
              required
            />
          </div>
          <div class="mb-3">
            <label>Harga</label>
            <input
              v-model.number="modalProduct.price"
              type="number"
              class="form-control"
              required
              min="0"
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

    <!-- SimpleModal Konfirmasi Hapus -->
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
          Yakin ingin menghapus produk <b>{{ deleteTarget?.name }}</b
          >?
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">
            Batal
          </button>
          <button class="btn btn-danger" @click="deleteProduct">Hapus</button>
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
      products: [],
      showModal: false,
      isEdit: false,
      modalProduct: {
        id: null,
        name: "",
        category: "",
        price: 0,
      },
      showDeleteConfirm: false,
      deleteTarget: null,
      notifStore: useNotificationStore(),
    };
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await axios.get("http://localhost:3001/api/products");
        this.products = res.data;
      } catch (err) {
        this.notifStore.show("error", "Gagal mengambil data produk");
      }
    },
    openAddModal() {
      this.isEdit = false;
      this.modalProduct = { id: null, name: "", category: "", price: 0 };
      this.showModal = true;
    },
    openEditModal(product) {
      this.isEdit = true;
      this.modalProduct = { ...product };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async addProduct() {
      try {
        await axios.post("http://localhost:3001/api/products", {
          name: this.modalProduct.name,
          category: this.modalProduct.category,
          price: this.modalProduct.price,
        });
        this.notifStore.show("success", "Produk berhasil ditambah");
        this.showModal = false;
        this.fetchProducts();
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal menambah produk"
        );
      }
    },
    async updateProduct() {
      try {
        await axios.put(
          `http://localhost:3001/api/products/${this.modalProduct.id}`,
          {
            name: this.modalProduct.name,
            category: this.modalProduct.category,
            price: this.modalProduct.price,
          }
        );
        this.notifStore.show("success", "Produk berhasil diupdate");
        this.showModal = false;
        this.fetchProducts();
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal mengupdate produk"
        );
      }
    },
    confirmDelete(product) {
      this.deleteTarget = product;
      this.showDeleteConfirm = true;
    },
    async deleteProduct() {
      try {
        await axios.delete(
          `http://localhost:3001/api/products/${this.deleteTarget.id}`
        );
        this.notifStore.show("success", "Produk berhasil dihapus");
        this.showDeleteConfirm = false;
        this.fetchProducts();
      } catch (err) {
        this.notifStore.show(
          "error",
          err.response?.data?.error || "Gagal menghapus produk"
        );
      }
    },
  },
  mounted() {
    this.fetchProducts();
  },
};
</script>
