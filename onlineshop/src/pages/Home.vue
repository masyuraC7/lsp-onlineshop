<template>
  <div>
    <Navbar />
    <div class="container mt-4">
      <h2>Produk Tersedia</h2>
      <div class="row">
        <div class="col-md-4">
          <select class="form-select mb-3" v-model="kategori">
            <option value="">Semua Kategori</option>
            <option v-for="cat in kategoriList" :key="cat.id" :value="cat.name">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <input
            type="text"
            class="form-control"
            placeholder="Cari produk..."
            v-model="searchQuery"
          />
        </div>
      </div>
      <div class="row">
        <template v-if="produk.length === 0">
          <div class="col-12 text-center text-muted">
            <p>Belum ada produk tersedia.</p>
          </div>
        </template>

        <template v-else-if="produkTersaring.length === 0">
          <div class="col-12 text-center text-muted">
            <p>Produk tidak ditemukan untuk pencarian/kategori tersebut.</p>
          </div>
        </template>

        <template v-else>
          <div class="col-md-4" v-for="(p, i) in produkTersaring" :key="i">
            <ProductCard
              :product-id="p.id"
              :image="p.image"
              :title="p.name"
              :description="p.description"
              :price="p.price"
              :stock="p.stock"
              :reviews="p.reviews"
              @login-required="showLoginModal"
            />
          </div>
        </template>
      </div>
    </div>
  </div>

  <SimpleModal
    id="loginPromptModal"
    title="Login Diperlukan"
    :buttons="modalButtons"
    :visible="modalVisible"
    @update:visible="modalVisible = $event"
    @button-click="handleModalButton"
  >
    <template #body>
      Untuk menambahkan produk ke keranjang, silakan login terlebih dahulu.
    </template>
  </SimpleModal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import Navbar from "../components/Navbar.vue";
import ProductCard from "../components/ProductCard.vue";
import SimpleModal from "../components/SimpleModal.vue";
import { useNotificationStore } from "../stores/NotificationStore.js";
import { useRouter } from "vue-router";

const kategori = ref("");
const produk = ref([]);
const kategoriList = ref([]);
const searchQuery = ref("");
const modalVisible = ref(false);
const router = useRouter();
const notifStore = useNotificationStore();

const modalButtons = [
  { label: "Lihat-lihat Dulu", class: "btn-secondary", dismiss: true },
  {
    label: "Login Sekarang",
    class: "btn-primary",
    dismiss: true,
  },
];

function showLoginModal() {
  modalVisible.value = true;
}
function goToLogin() {
  setTimeout(() => {
    router.push("/login");
  }, 200);
}
async function ambilProduk() {
  try {
    let url = "http://localhost:3001/api/products";
    if (kategori.value) {
      url += `?category=${encodeURIComponent(kategori.value)}`;
    }
    const res = await axios.get(url);
    produk.value = res.data;
  } catch (error) {
    notifStore.show("error", "Gagal mengambil produk");
  }
}
async function ambilKategori() {
  try {
    const res = await axios.get("http://localhost:3001/api/categories");
    kategoriList.value = res.data;
  } catch (error) {
    notifStore.show("error", "Gagal mengambil kategori");
  }
}
function handleModalButton(btn) {
  if (btn.label === "Login Sekarang") {
    goToLogin();
  }
}
watch(kategori, ambilProduk);
onMounted(() => {
  ambilKategori();
  ambilProduk();
});
const produkTersaring = computed(() => {
  return produk.value.filter((p) => {
    const cocokKategori =
      kategori.value === "" || p.category === kategori.value;
    const cocokSearch =
      searchQuery.value === "" ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    return cocokKategori && cocokSearch;
  });
});
</script>
