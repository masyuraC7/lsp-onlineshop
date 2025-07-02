<template>
  <AdminNavbar />
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3>Daftar Stok Produk</h3>
      <button class="btn btn-primary" @click="openAddModal">Tambah Stok</button>
    </div>
    <table class="table table-striped table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Produk</th>
          <th>Jumlah</th>
          <th>Supplier</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(stock, idx) in stocks" :key="stock.id">
          <td>{{ idx + 1 }}</td>
          <td>{{ stock.product_name }}</td>
          <td>{{ stock.quantity }}</td>
          <td>{{ stock.supplier }}</td>
          <td>
            <button
              class="btn btn-sm btn-warning me-2"
              @click="openEditModal(stock)"
            >
              Edit
            </button>
            <button class="btn btn-sm btn-danger" @click="confirmDelete(stock)">
              Delete
            </button>
          </td>
        </tr>
        <tr v-if="stocks.length === 0">
          <td colspan="5" class="text-center">Tidak ada data stok</td>
        </tr>
      </tbody>
    </table>

    <!-- SimpleModal Tambah/Edit Stok -->
    <SimpleModal
      id="stockModal"
      :title="isEdit ? 'Edit Stok' : 'Tambah Stok'"
      :visible="showModal"
      @update:visible="showModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <form @submit.prevent="isEdit ? updateStock() : addStock()">
          <div class="mb-3">
            <label>Produk</label>
            <select
              v-model="modalStock.product_id"
              class="form-select"
              required
              :disabled="isEdit"
            >
              <option value="" disabled>Pilih Produk</option>
              <option v-for="prod in products" :key="prod.id" :value="prod.id">
                {{ prod.name }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label>Jumlah</label>
            <input
              v-model.number="modalStock.quantity"
              type="number"
              class="form-control"
              required
              min="0"
            />
          </div>
          <div class="mb-3">
            <label>Supplier</label>
            <input
              v-model="modalStock.supplier"
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
          Yakin ingin menghapus stok produk
          <b>{{ deleteTarget?.product_name }}</b
          >?
        </div>
        <div class="d-flex justify-content-end gap-2 mt-3">
          <button class="btn btn-secondary" @click="showDeleteConfirm = false">
            Batal
          </button>
          <button class="btn btn-danger" @click="deleteStock">Hapus</button>
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

const stocks = ref([]);
const products = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const modalStock = ref({
  id: null,
  product_id: "",
  quantity: 0,
  supplier: "",
});
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const notifStore = useNotificationStore();

async function fetchStocks() {
  try {
    const res = await axios.get("http://localhost:3001/api/stocks");
    stocks.value = res.data;
  } catch (err) {
    notifStore.show("error", "Gagal mengambil data stok");
  }
}

async function fetchProducts() {
  try {
    const res = await axios.get("http://localhost:3001/api/products");
    products.value = res.data;
  } catch (err) {
    products.value = [];
  }
}

function openAddModal() {
  isEdit.value = false;
  modalStock.value = { id: null, product_id: "", quantity: 0, supplier: "" };
  showModal.value = true;
}

function openEditModal(stock) {
  isEdit.value = true;
  modalStock.value = { ...stock };
  showModal.value = true;
}

async function addStock() {
  try {
    await axios.post("http://localhost:3001/api/stocks", {
      product_id: modalStock.value.product_id,
      quantity: modalStock.value.quantity,
      supplier: modalStock.value.supplier,
    });
    notifStore.show("success", "Stok berhasil ditambah");
    showModal.value = false;
    fetchStocks();
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal menambah stok"
    );
  }
}

async function updateStock() {
  try {
    await axios.put(`http://localhost:3001/api/stocks/${modalStock.value.id}`, {
      product_id: modalStock.value.product_id,
      quantity: modalStock.value.quantity,
      supplier: modalStock.value.supplier,
    });
    notifStore.show("success", "Stok berhasil diupdate");
    showModal.value = false;
    fetchStocks();
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal mengupdate stok"
    );
  }
}

function confirmDelete(stock) {
  deleteTarget.value = stock;
  showDeleteConfirm.value = true;
}

async function deleteStock() {
  try {
    await axios.delete(
      `http://localhost:3001/api/stocks/${deleteTarget.value.id}`
    );
    notifStore.show("success", "Stok berhasil dihapus");
    showDeleteConfirm.value = false;
    fetchStocks();
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal menghapus stok"
    );
  }
}

onMounted(() => {
  fetchStocks();
  fetchProducts();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
}
.modal {
  z-index: 1100;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
}
</style>
