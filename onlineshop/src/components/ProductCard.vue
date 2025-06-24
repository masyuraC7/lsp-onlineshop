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
      <div v-if="isLoggedIn && (role === 'customer' || role === 'subAdmin')">
        <ReviewForm
          :productId="productId"
          @submit-review="handleReviewSubmit"
        />
      </div>
      <div>
        <p class="mb-1"><strong>Ulasan:</strong></p>
        <ReviewBox
          v-for="(review, i) in updatedReviews"
          :key="i"
          :review="review"
        />
        <p
          v-if="!updatedReviews || updatedReviews.length === 0"
          class="text-muted"
        >
          Belum ada ulasan
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import ReviewBox from "./ReviewBox.vue";
import ReviewForm from "./ReviewForm.vue";
import { useNotificationStore } from "../stores/NotificationStore";
import { useUserStore } from "../stores/UserStore";

export default {
  components: { ReviewBox, ReviewForm },
  props: [
    "productId",
    "image",
    "title",
    "description",
    "price",
    "stock",
    "reviews",
    "isLoggedIn",
    "role",
  ],
  data() {
    return {
      updatedReviews: this.reviews,
    };
  },
  mounted() {
    this.loadReviews();
  },
  watch: {
    reviews(newVal) {
      this.updatedReviews = newVal;
    },
  },
  methods: {
    async loadReviews() {
      try {
        const res = await axios.get(
          `http://localhost:3001/api/reviews/${this.productId}`
        );
        this.updatedReviews = res.data;
      } catch (err) {
        console.error("Gagal memuat ulasan:", err);
      }
    },
    async handleAddToCart() {
      const notificationStore = useNotificationStore();
      const userStore = useUserStore();

      if (!this.isLoggedIn) {
        this.$emit("login-required");
        return;
      }

      try {
        await axios.post("http://localhost:3001/api/cart/add", {
          userId: userStore.id,
          productId: this.productId,
          quantity: 1,
        });

        notificationStore.show(
          "success",
          "Produk berhasil ditambahkan ke keranjang"
        );
      } catch (error) {
        notificationStore.show(
          "error",
          error.response?.data?.error || "Gagal menambahkan ke keranjang"
        );
      }
    },
    async handleReviewSubmit() {
      await this.loadReviews();
    },
  },
};
</script>
