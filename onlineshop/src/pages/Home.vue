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
              :image="p.image"
              :title="p.title"
              :description="p.description"
              :price="p.price"
              :stock="p.stock"
              :reviews="p.reviews"
              :isLoggedIn="isLoggedIn"
            />
          </div>
        </template>
      </div>
    </div>
  </div>

  <SimpleModal
    id="loginPromptModal"
    title="Login Diperlukan"
    :buttons="[
      { label: 'Lihat-lihat Dulu', class: 'btn-secondary', dismiss: true },
      { label: 'Login Sekarang', class: 'btn-primary', action: goToLogin },
    ]"
  >
    <template #body>
      Untuk menambahkan produk ke keranjang, silakan login terlebih dahulu.
    </template>
  </SimpleModal>
</template>

<script>
import axios from "axios";
import * as bootstrap from "bootstrap";
import Navbar from "../components/Navbar.vue";
import ProductCard from "../components/ProductCard.vue";
import SimpleModal from "../components/SimpleModal.vue";

export default {
  components: { Navbar, ProductCard, SimpleModal },
  data() {
    return {
      isLoggedIn: false,
      kategori: "",
      produk: [],
      kategoriList: [],
      searchQuery: "",
    };
  },
  methods: {
    goToLogin() {
      const modalEl = document.getElementById("loginPromptModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }

      // Pindah ke halaman login setelah animasi sedikit delay
      setTimeout(() => {
        this.$router.push("/login");
      }, 200); // Delay kecil agar modal sempat tertutup
    },
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
    this.ambilKategori();
    this.ambilProduk();
  },
  computed: {
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
};
</script>
