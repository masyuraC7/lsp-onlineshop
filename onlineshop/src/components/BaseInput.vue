<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :placeholder="placeholder"
      v-model="modelValueProxy"
      @input="$emit('clear-error')"
      v-bind="$attrs"
    />
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
  type: { type: String, default: "text" },
  id: String,
});
const emit = defineEmits(["update:modelValue", "clear-error"]);

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
