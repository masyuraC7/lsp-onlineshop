<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="modal fade show d-block"
      :id="id"
      tabindex="-1"
      role="dialog"
      :aria-labelledby="id + 'Label'"
      aria-modal="true"
      style="background: rgba(0, 0, 0, 0.5)"
    >
      <div
        :class="['modal-dialog', 'modal-dialog-centered', sizeClass]"
        role="document"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="id + 'Label'">{{ title }}</h5>
            <button
              v-if="closable"
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="$emit('update:visible', false)"
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
              @click="onButtonClick(btn)"
            >
              {{ btn.label }}
            </button>
          </div>
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  size: { type: String, default: 'md' },
  closable: { type: Boolean, default: true },
  buttons: { type: Array, default: () => [] },
  visible: { type: Boolean, default: false },
});
const emit = defineEmits(['update:visible', 'button-click']);

const sizeClass = computed(() => `modal-dialog-${props.size}`);

function onButtonClick(btn) {
  emit('button-click', btn);
  if (typeof btn.action === 'function') btn.action();
  if (btn.dismiss) emit('update:visible', false);
}
</script>

<style scoped>
.modal.fade.show.d-block {
  display: block;
  z-index: 1050;
}
.modal-backdrop {
  display: none;
}
/* Animasi fade in/out modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}
</style>
