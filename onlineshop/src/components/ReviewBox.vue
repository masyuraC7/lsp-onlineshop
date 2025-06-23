<template>
  <div class="review-box mb-2">
    <p class="mb-1">
      <strong>bintang ⭐ {{ review.rating }}/5</strong>
    </p>
    <p class="mb-1" v-if="review.comment">{{ review.comment }}</p>
    <small class="text-muted">{{ review.date }}</small>
  </div>
</template>

<script>
export default {
  props: ["review"],
};
</script>

<style scoped>
.review-box {
  background-color: #f0f0f0; /* abu-abu muda */
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #ccc;
}
</style>
