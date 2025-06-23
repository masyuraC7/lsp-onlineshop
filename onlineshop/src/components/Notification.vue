<template>
  <transition name="slide-fade">
    <div
      v-if="internalVisible"
      :class="[
        'alert',
        alertType,
        'd-flex',
        'align-items-center',
        'justify-content-between',
        'position-fixed',
        'top-0',
        'end-0',
        'm-3',
        'shadow',
      ]"
      role="alert"
      style="z-index: 1055; min-width: 280px"
    >
      <div class="d-flex align-items-center">
        <i :class="iconClass" class="me-2"></i>
        <span>{{ message }}</span>
      </div>
      <button
        type="button"
        class="btn-close ms-3"
        aria-label="Close"
        @click="close"
      ></button>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    type: { type: String, default: "success" },
    message: { type: String, required: true },
    duration: { type: Number, default: 4000 },
  },
  data() {
    return {
      internalVisible: true,
      timer: null,
    };
  },
  computed: {
    alertType() {
      return (
        {
          success: "alert-success",
          warning: "alert-warning",
          error: "alert-danger",
        }[this.type] || "alert-primary"
      );
    },
    iconClass() {
      return (
        {
          success: "bi bi-check-circle-fill text-success",
          warning: "bi bi-exclamation-triangle-fill text-warning",
          error: "bi bi-x-circle-fill text-danger",
        }[this.type] || "bi bi-info-circle-fill text-primary"
      );
    },
  },
  methods: {
    close() {
      this.internalVisible = false;
      this.$emit("closed"); // opsional, beri tahu parent kalau ditutup
    },
  },
  mounted() {
    this.timer = setTimeout(() => {
      this.close();
    }, this.duration);
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
};
</script>
