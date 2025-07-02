<template>
  <div class="mb-3 border rounded p-3 bg-light">
    <h6 class="mb-2">Tulis Ulasan</h6>

    <!-- Pilih Bintang -->
    <div class="mb-2">
      <i
        v-for="n in 5"
        :key="n"
        class="bi"
        :class="[
          n <= rating ? 'bi-star-fill text-warning' : 'bi-star',
          'fs-5',
          'me-1',
          'cursor-pointer',
        ]"
        @click="rating = n"
      ></i>
    </div>

    <!-- Komentar -->
    <textarea
      v-model="comment"
      class="form-control mb-2"
      rows="2"
      placeholder="Tulis komentar Anda..."
    ></textarea>

    <!-- Tombol -->
    <div class="d-flex justify-content-end">
      <button class="btn btn-secondary btn-sm me-2" @click="clearForm">
        Clear
      </button>
      <button
        class="btn btn-primary btn-sm"
        :disabled="rating === 0 || comment.trim() === ''"
        @click="submit"
      >
        Submit
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useUserStore } from "../stores/UserStore";
import { useNotificationStore } from "../stores/NotificationStore";

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true,
  },
});
const emit = defineEmits(["submit-review"]);

const rating = ref(0);
const comment = ref("");

function clearForm() {
  rating.value = 0;
  comment.value = "";
}

async function submit() {
  const notif = useNotificationStore();
  const userStore = useUserStore();
  try {
    await axios.post("http://localhost:3001/api/reviews", {
      userId: userStore.id,
      productId: props.productId,
      rating: rating.value,
      comment: comment.value,
    });
    notif.show("success", "Ulasan berhasil dikirim");
    emit("submit-review");
    clearForm();
  } catch (error) {
    notif.show("error", error.response?.data?.error || "Gagal mengirim ulasan");
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
