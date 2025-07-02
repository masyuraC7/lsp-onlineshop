<template>
  <img v-if="url" :src="url" :width="size" :height="size" alt="QR Code" />
</template>

<script setup>
import { ref, watch } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  value: { type: String, required: true },
  size: { type: Number, default: 200 },
});

const url = ref("");

async function generateQr(val) {
  url.value = await QRCode.toDataURL(val || "DUMMY", {
    width: props.size,
    margin: 2,
  });
}

watch(
  () => props.value,
  (newVal) => {
    generateQr(newVal);
  },
  { immediate: true }
);
</script>
