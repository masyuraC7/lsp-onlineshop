<template>
  <CustomerNavbar />

  <div class="container mt-4">
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
              :productId="p.id"
              :image="p.image"
              :title="p.name"
              :description="p.description"
              :price="p.price"
              :stock="p.stock"
              :reviews="p.reviews"
              :isLoggedIn="isLoggedIn"
              :role="role"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import ProductCard from "../components/ProductCard.vue";
import { useUserStore } from "../stores/UserStore.js";
import CustomerNavbar from "../components/CustomerNavbar.vue";
import { useNotificationStore } from "../stores/NotificationStore.js";

const kategori = ref("");
const produk = ref([]);
const kategoriList = ref([]);
const searchQuery = ref("");

const userStore = useUserStore();
const notifStore = useNotificationStore();
const isLoggedIn = computed(() => userStore.isAuthenticated);
const role = computed(() => userStore.role);

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

watch(kategori, ambilProduk);

onMounted(() => {
  userStore.initFromLocalStorage();
  ambilKategori();
  ambilProduk();
});
</script>
