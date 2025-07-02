<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <select
      :id="id"
      class="form-select"
      :class="{ 'is-invalid': error }"
      v-model="modelValueProxy"
      @change="$emit('clear-error')"
      v-bind="$attrs"
    >
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <slot />
    </select>
    <div class="invalid-feedback">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  error: String,
  placeholder: String,
  id: String,
});
const emit = defineEmits(["update:modelValue", "clear-error"]);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
