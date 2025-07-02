<template>
  <div class="review-box mb-2">
    <div class="d-flex align-items-center mb-1">
      <strong class="me-2">
        <span v-if="review.userName">
          {{ review.userName }}
        </span>
      </strong>
      <span>- bintang ⭐ {{ review.rating }}/5</span>
    </div>
    <p class="mb-1" v-if="review.comment">{{ review.comment }}</p>
    <small class="text-muted">{{ review.date }}</small>
  </div>
</template>

<script setup>
const props = defineProps({
  review: { type: Object, required: true },
});
</script>

<style scoped>
.review-box {
  background-color: #f0f0f0;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #ccc;
}
</style>
