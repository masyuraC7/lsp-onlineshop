<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <textarea
      :id="id"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      v-model="modelValueProxy"
      @input="$emit('clear-error')"
      :rows="rows"
      v-bind="$attrs"
    ></textarea>
    <div class="invalid-feedback">{{ error }}</div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: String,
  label: String,
  error: String,
  placeholder: String,
  rows: { type: Number, default: 3 },
  id: String,
});
const emit = defineEmits(["update:modelValue", "clear-error"]);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
