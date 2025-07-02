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
          <th>Gambar</th>
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
          <td>
            <button class="btn btn-sm btn-info" @click="showImage(product)">
              Lihat Gambar
            </button>
          </td>
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
          <td colspan="7" class="text-center">Tidak ada produk</td>
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
            <select
              v-model="modalProduct.category"
              class="form-select"
              required
            >
              <option value="" disabled>Pilih kategori</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
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
          <div class="mb-3">
            <label class="form-label me-3">Input Gambar</label>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="imgModeLink"
                value="link"
                v-model="imageInputMode"
              />
              <label class="form-check-label" for="imgModeLink">Link</label>
            </div>
            <div class="form-check form-check-inline">
              <input
                class="form-check-input"
                type="radio"
                id="imgModeUpload"
                value="upload"
                v-model="imageInputMode"
              />
              <label class="form-check-label" for="imgModeUpload">Upload</label>
            </div>
          </div>
          <div class="mb-3" v-if="imageInputMode === 'link'">
            <label>Gambar (URL)</label>
            <input
              v-model="imageUrl"
              type="text"
              class="form-control"
              placeholder="Link gambar produk"
            />
            <div v-if="imageUrl" class="mt-2">
              <img
                :src="imageUrl"
                alt="Preview"
                style="max-width: 120px; max-height: 120px"
              />
            </div>
          </div>
          <div class="mb-3" v-if="imageInputMode === 'upload'">
            <label>Upload Gambar</label>
            <input
              type="file"
              class="form-control"
              accept="image/*"
              @change="onFileChange"
            />
            <div v-if="imagePreview" class="mt-2">
              <img
                :src="imagePreview"
                alt="Preview"
                style="max-width: 120px; max-height: 120px"
              />
            </div>
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary" @click="closeModal">
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

    <!-- Modal Lihat Gambar Produk -->
    <SimpleModal
      id="imageModal"
      title="Gambar Produk"
      :visible="showImageModal"
      @update:visible="showImageModal = $event"
      :closable="true"
      :buttons="[]"
    >
      <template #body>
        <div class="text-center">
          <template v-if="imageModalUrl">
            <img
              :src="imageModalUrl"
              alt="Gambar Produk"
              style="max-width: 100%; max-height: 70vh; object-fit: contain"
            />
          </template>
          <template v-else>
            <div class="text-muted py-4">Gambar kosong</div>
          </template>
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

const products = ref([]);
const showModal = ref(false);
const isEdit = ref(false);
const modalProduct = ref({
  id: null,
  name: "",
  category: "",
  price: 0,
  image: "",
});
const showDeleteConfirm = ref(false);
const deleteTarget = ref(null);
const categories = ref([]);
const imageUrl = ref(""); // for link mode
const imageFile = ref(null); // for upload mode
const imagePreview = ref(""); // preview for upload mode
const imageInputMode = ref("link"); // 'link' or 'upload'
const showImageModal = ref(false);
const imageModalUrl = ref("");
const notifStore = useNotificationStore();

async function fetchProducts() {
  try {
    const res = await axios.get("http://localhost:3001/api/products");
    products.value = res.data;
  } catch (err) {
    notifStore.show("error", "Gagal mengambil data produk");
  }
}

async function fetchCategories() {
  try {
    const res = await axios.get("http://localhost:3001/api/categories");
    categories.value = res.data;
  } catch (err) {
    notifStore.show("error", "Gagal mengambil kategori");
  }
}

function openAddModal() {
  isEdit.value = false;
  modalProduct.value = {
    id: null,
    name: "",
    category: "",
    price: 0,
    image: "",
  };
  imageUrl.value = "";
  imageFile.value = null;
  imagePreview.value = "";
  imageInputMode.value = "link";
  showModal.value = true;
}

function openEditModal(product) {
  isEdit.value = true;
  modalProduct.value = { ...product };
  // Tentukan mode input gambar berdasarkan value image
  if (
    product.image &&
    (product.image.startsWith("http://") ||
      product.image.startsWith("https://"))
  ) {
    imageInputMode.value = "link";
    imageUrl.value = product.image;
    imageFile.value = null;
    imagePreview.value = product.image;
  } else if (
    product.image &&
    /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(product.image)
  ) {
    imageInputMode.value = "upload";
    imageUrl.value = "";
    imageFile.value = null;
    // Preview gambar upload dari server (pakai URL absolut)
    imagePreview.value = `${window.location.protocol}//${window.location.hostname}:3001/uploads/${product.image}`;
  } else {
    imageInputMode.value = "link";
    imageUrl.value = "";
    imageFile.value = null;
    imagePreview.value = "";
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  // Validasi file type dan size (misal max 2MB)
  if (!file.type.startsWith("image/")) {
    notifStore.show("error", "File harus berupa gambar");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    notifStore.show("error", "Ukuran gambar maksimal 2MB");
    return;
  }
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
}

async function addProduct() {
  // Validasi field kosong
  if (
    !modalProduct.value.name ||
    !modalProduct.value.category ||
    modalProduct.value.price === null ||
    modalProduct.value.price === undefined ||
    (imageInputMode.value === "link" && !imageUrl.value) ||
    (imageInputMode.value === "upload" && !imageFile.value)
  ) {
    notifStore.show("error", "Semua field harus diisi");
    return;
  }
  try {
    let imageToSave = "";
    if (imageInputMode.value === "link") {
      imageToSave = imageUrl.value;
    } else if (imageInputMode.value === "upload") {
      // Upload file ke backend
      const formData = new FormData();
      formData.append("image", imageFile.value);
      const uploadRes = await axios.post(
        "http://localhost:3001/api/products/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      imageToSave = uploadRes.data.filename; // backend harus return { filename: 'namafile.jpg' }
    }
    await axios.post("http://localhost:3001/api/products", {
      name: modalProduct.value.name,
      category: modalProduct.value.category,
      price: modalProduct.value.price,
      image: imageToSave,
    });
    notifStore.show("success", "Produk berhasil ditambah");
    showModal.value = false;
    fetchProducts();
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal menambah produk"
    );
  }
}

async function updateProduct() {
  // Validasi field kosong
  if (
    !modalProduct.value.name ||
    !modalProduct.value.category ||
    modalProduct.value.price === null ||
    modalProduct.value.price === undefined ||
    (imageInputMode.value === "link" && !imageUrl.value) ||
    (imageInputMode.value === "upload" &&
      !imageFile.value &&
      !modalProduct.value.image)
  ) {
    notifStore.show("error", "Semua field harus diisi");
    return;
  }
  try {
    let imageToSave = "";
    if (imageInputMode.value === "link") {
      imageToSave = imageUrl.value;
    } else if (imageInputMode.value === "upload") {
      if (imageFile.value) {
        // Jika user upload file baru, upload ke backend
        const formData = new FormData();
        formData.append("image", imageFile.value);
        const uploadRes = await axios.post(
          "http://localhost:3001/api/products/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageToSave = uploadRes.data.filename;
      } else if (modalProduct.value.image) {
        // Jika tidak upload baru, pakai nama file lama
        imageToSave = modalProduct.value.image;
      }
    }
    await axios.put(
      `http://localhost:3001/api/products/${modalProduct.value.id}`,
      {
        name: modalProduct.value.name,
        category: modalProduct.value.category,
        price: modalProduct.value.price,
        image: imageToSave,
      }
    );
    notifStore.show("success", "Produk berhasil diupdate");
    showModal.value = false;
    fetchProducts();
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal mengupdate produk"
    );
  }
}

function confirmDelete(product) {
  deleteTarget.value = product;
  showDeleteConfirm.value = true;
}

async function deleteProduct() {
  if (!deleteTarget.value) return;
  try {
    await axios.delete(
      `http://localhost:3001/api/products/${deleteTarget.value.id}`
    );
    notifStore.show("success", "Produk berhasil dihapus");
    showDeleteConfirm.value = false;
    fetchProducts();
  } catch (err) {
    notifStore.show(
      "error",
      err.response?.data?.error || "Gagal menghapus produk"
    );
  }
}

function showImage(product) {
  if (product.image) {
    if (/^https?:\/\//i.test(product.image)) {
      imageModalUrl.value = product.image;
    } else if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(product.image)) {
      imageModalUrl.value = `${window.location.protocol}//${window.location.hostname}:3001/uploads/${product.image}`;
    } else {
      imageModalUrl.value = "";
    }
  } else {
    imageModalUrl.value = "";
  }
  showImageModal.value = true;
}

onMounted(() => {
  fetchProducts();
  fetchCategories();
});
</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}

.form-check-inline {
  margin-right: 10px;
}
</style>
