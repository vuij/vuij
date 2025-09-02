<template>
  <input 
    :type="type" 
    ref="input" 
    :class="naked ? 'vuij-inputtag vuij-inputtag_naked' : 'vuij-formel vuij-input vuij-inputtag'" 
    :value="localValue" 
    @input="onInput" 
    v-bind="$attrs"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const input = ref<HTMLInputElement | null>(null);
defineExpose({input}); // to use in parent

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Array],
    default: undefined,
  },
  value: [String, Number],
  type: {
    type: String,
    default: 'text',
    validator(value: string) {
      const validTypes = [
        'button', 'checkbox', 'color', 'date', 'datetime-local', 'email',
        'file', 'hidden', 'image', 'month', 'number', 'password', 'radio',
        'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week'
      ]
      return validTypes.includes(value)
    }
  },
  naked: {
    type: Boolean, 
    default: false,
  },
  //error, nativeValidity,
})

const emit = defineEmits(['update:modelValue', 'input'])

const localValue = ref<any>(props.modelValue ?? props.value);

watch(() => props.modelValue, (value) => {
  localValue.value = value;
  emit('update:modelValue', value);
})
//watch value if modelValue === undefined

const onInput = (event: Event) => {
  const inp: EventTarget | null = event.target;
  const value = inp instanceof HTMLInputElement ? inp.value : undefined;
  localValue.value = value;
  emit('input', event);
}
</script>