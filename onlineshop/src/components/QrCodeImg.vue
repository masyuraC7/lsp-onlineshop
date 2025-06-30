<template>
  <img v-if="url" :src="url" :width="size" :height="size" alt="QR Code" />
</template>

<script>
import QRCode from "qrcode";
export default {
  name: "QrCodeImg",
  props: {
    value: { type: String, required: true },
    size: { type: Number, default: 200 },
  },
  data() {
    return { url: "" };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.generateQr(newVal);
      },
    },
  },
  methods: {
    async generateQr(val) {
      this.url = await QRCode.toDataURL(val || "DUMMY", {
        width: this.size,
        margin: 2,
      });
    },
  },
};
</script>
