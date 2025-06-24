<template>
  <div
    class="modal fade"
    :id="id"
    tabindex="-1"
    :aria-labelledby="id + 'Label'"
    aria-hidden="true"
    ref="modalEl"
  >
    <div :class="['modal-dialog', 'modal-dialog-centered', sizeClass]">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="id + 'Label'">{{ title }}</h5>
          <button
            v-if="closable"
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div class="modal-body">
          <slot name="body" />
        </div>

        <div class="modal-footer" v-if="buttons && buttons.length">
          <button
            v-for="(btn, i) in buttons"
            :key="i"
            :class="['btn', btn.class || 'btn-secondary']"
            @click="handleAction(btn)"
            :data-bs-dismiss="btn.dismiss ? 'modal' : null"
          >
            {{ btn.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from "bootstrap";

export default {
  props: {
    id: { type: String, required: true },
    title: { type: String, required: true },
    size: { type: String, default: "md" },
    closable: { type: Boolean, default: true },
    buttons: {
      type: Array,
      default: () => [],
    },
    visible: { type: Boolean, default: false }, // <- Tambahkan ini
  },
  computed: {
    sizeClass() {
      return `modal-dialog-${this.size}`;
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.showModal();
      } else {
        this.hideModal();
      }
    },
  },
  mounted() {
    this.modalInstance = new Modal(this.$refs.modalEl, {
      backdrop: "static",
      keyboard: false,
    });

    this.$refs.modalEl.addEventListener("hidden.bs.modal", () => {
      this.$emit("update:visible", false);

      document.activeElement?.blur();
    });
  },
  methods: {
    showModal() {
      this.modalInstance.show();
    },
    hideModal() {
      this.modalInstance.hide();
    },
    handleAction(btn) {
      if (typeof btn.action === "function") {
        btn.action();
      }
    },
  },
};
</script>
