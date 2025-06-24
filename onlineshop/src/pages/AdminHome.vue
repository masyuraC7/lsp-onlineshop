<template>
  <AdminNavbar />

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
<script>
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar.vue";
import ProductCard from "../components/ProductCard.vue";
import { useUserStore } from "../stores/UserStore.js";

export default {
  components: { AdminNavbar, ProductCard },
  data() {
    return {
      kategori: "",
      produk: [],
      kategoriList: [],
      searchQuery: "",
    };
  },
  computed: {
    userStore() {
      return useUserStore();
    },
    isLoggedIn() {
      return this.userStore.isAuthenticated;
    },
    role() {
      return this.userStore.role;
    },
    produkTersaring() {
      return this.produk.filter((p) => {
        const cocokKategori =
          this.kategori === "" || p.category === this.kategori;
        const cocokSearch =
          this.searchQuery === "" ||
          p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(this.searchQuery.toLowerCase());
        return cocokKategori && cocokSearch;
      });
    },
  },
  methods: {
    async ambilProduk() {
      try {
        let url = "http://localhost:3001/api/products";
        if (this.kategori) {
          url += `?category=${encodeURIComponent(this.kategori)}`;
        }
        const res = await axios.get(url);
        this.produk = res.data;
      } catch (error) {
        console.error("Gagal mengambil produk:", error);
      }
    },
    async ambilKategori() {
      try {
        const res = await axios.get("http://localhost:3001/api/categories");
        this.kategoriList = res.data;
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    },
  },
  watch: {
    kategori() {
      this.ambilProduk(); // Refetch saat kategori berubah
    },
  },
  mounted() {
    this.userStore.initFromLocalStorage();
    this.ambilKategori();
    this.ambilProduk();
  },
};
</script>
