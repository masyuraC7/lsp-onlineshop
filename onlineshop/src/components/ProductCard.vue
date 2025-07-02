<template>
  <div class="card mb-4 shadow-sm">
    <img :src="image || defaultImage" class="card-img-top" alt="{{ title }}" />

    <div class="card-body">
      <h5 class="card-title">{{ title }}</h5>
      <p class="card-text">{{ description }}</p>
      <p>
        <strong>Rp {{ price.toLocaleString() }}</strong>
      </p>
      <p>Stok: {{ stock }}</p>
      <button class="btn btn-primary w-100" @click="showConfirmModal">
        Tambah ke Keranjang
      </button>
      <SimpleModal
        id="confirmAddCartModal"
        title="Konfirmasi"
        :visible="modalVisible"
        :buttons="modalButtons"
        @update:visible="modalVisible = $event"
        @button-click="handleModalButton"
      >
        <template #body>
          <div>
            Apakah Anda yakin ingin menambahkan produk ini ke keranjang?
            <div class="mt-3">
              <label for="qtyInput" class="form-label">Jumlah:</label>
              <input
                id="qtyInput"
                type="number"
                min="1"
                :max="stock"
                v-model.number="selectedQty"
                class="form-control"
                style="width: 120px; display: inline-block"
              />
              <span v-if="stock > 0" class="ms-2 text-muted"
                >(Stok: {{ stock }})</span
              >
            </div>
            <div class="mt-2">
              <strong
                >Total: Rp {{ (selectedQty * price).toLocaleString() }}</strong
              >
            </div>
          </div>
        </template>
      </SimpleModal>
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

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import ReviewBox from "./ReviewBox.vue";
import ReviewForm from "./ReviewForm.vue";
import SimpleModal from "./SimpleModal.vue";
import { useNotificationStore } from "../stores/NotificationStore";
import { useUserStore } from "../stores/UserStore";

const props = defineProps({
  productId: { type: [String, Number], required: true },
  image: { type: String, default: null },
  title: String,
  description: String,
  price: [String, Number],
  stock: { type: [String, Number], default: 0 },
  reviews: Array,
  isLoggedIn: { type: Boolean, default: false },
  role: String,
});
const emit = defineEmits(["login-required"]);

const updatedReviews = ref(props.reviews);
const defaultImage =
  "https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png";
const notifStore = useNotificationStore();
const userStore = useUserStore();
const modalVisible = ref(false);
const modalButtons = [
  { label: "Batal", class: "btn-secondary", dismiss: true },
  { label: "Ya, Tambahkan", class: "btn-primary", dismiss: true },
];
const selectedQty = ref(1);

onMounted(() => {
  loadReviews();
});

watch(
  () => props.reviews,
  (newVal) => {
    updatedReviews.value = newVal;
  }
);

async function loadReviews() {
  try {
    const res = await axios.get(
      `http://localhost:3001/api/reviews/${props.productId}`
    );
    updatedReviews.value = res.data;
  } catch (err) {
    console.error("Gagal memuat ulasan:", err);
  }
}

function showConfirmModal() {
  if (!props.isLoggedIn) {
    emit("login-required");
    return;
  }
  selectedQty.value = 1;
  modalVisible.value = true;
}

function handleModalButton(btn) {
  if (btn.label === "Ya, Tambahkan") {
    handleAddToCart();
  }
}

async function handleAddToCart() {
  if (Number(props.stock) <= 0) {
    notifStore.show("error", "Stok produk habis!");
    return;
  }
  if (selectedQty.value < 1 || selectedQty.value > Number(props.stock)) {
    notifStore.show("error", "Jumlah tidak valid!");
    return;
  }
  try {
    await axios.post("http://localhost:3001/api/cart/add", {
      userId: userStore.id,
      productId: props.productId,
      quantity: selectedQty.value,
    });
    notifStore.show("success", "Produk berhasil ditambahkan ke keranjang");
  } catch (error) {
    notifStore.show(
      "error",
      error.response?.data?.error || "Gagal menambahkan ke keranjang"
    );
  }
}

async function handleReviewSubmit() {
  await loadReviews();
}
</script>
