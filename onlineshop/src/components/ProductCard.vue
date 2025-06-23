<template>
  <div class="card mb-4 shadow-sm">
    <img
      :src="
        image ||
        'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'
      "
      class="card-img-top"
      alt="{{ title }}"
    />

    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-text">{{ description }}</p>
      <p>
        <strong>Rp {{ price.toLocaleString() }}</strong>
      </p>
      <p>Stok: {{ stock }}</p>
      <button class="btn btn-primary w-100" @click="handleAddToCart">
        Tambah ke Keranjang
      </button>
      <hr />
      <div>
        <p class="mb-1"><strong>Ulasan:</strong></p>
        <ReviewBox v-for="(review, i) in reviews" :key="i" :review="review" />
        <p v-if="!reviews || reviews.length === 0" class="text-muted">
          reviews
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import ReviewBox from "./ReviewBox.vue";
import * as bootstrap from "bootstrap";

export default {
  components: { ReviewBox },
  props: [
    "image",
    "title",
    "description",
    "price",
    "stock",
    "reviews",
    "isLoggedIn",
  ],
  methods: {
    handleAddToCart() {
      if (!this.isLoggedIn) {
        const modalEl = document.getElementById("loginPromptModal");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      } else {
        // logika tambah ke keranjang asli di sini
        alert("Produk ditambahkan ke keranjang!");
      }
    },
  },
};
</script>
