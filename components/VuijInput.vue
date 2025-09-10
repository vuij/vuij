<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';

import VuijCtrl from './VuijCtrl.vue';
import VuijInputTag from './VuijInputTag.vue';
import VuijIconed from './VuijIconed.vue';

const iconedRef = useTemplateRef('iconedRef');
const inputRef = useTemplateRef('inputRef');
defineExpose({iconedRef, inputRef}); // to use in parent

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
  label: String,
  //error, nativeValidity,
  error: String,
  icon: [String,Boolean],//svg,img,component?
  iconRight: Boolean,
  dataIcon: String,
  loading: {
    type: Boolean,
    default: false
  },
});

const emit = defineEmits(['update:modelValue', 'input', 'focusin', 'keydown']);

const localValue = ref<any>(props.modelValue ?? props.value);

watch(() => props.modelValue, (value) => {
  localValue.value = value;
  emit('update:modelValue', value);
})

const onInput = (event: Event) => {
  const inp: EventTarget | null = event.target;
  const value = inp instanceof HTMLInputElement ? inp.value : undefined;
  localValue.value = value;
  emit('input', event);
}
</script>

<template>
  <VuijCtrl :label="label" :error="error" ctrlClass="vuij-ctrl_input">
      <template v-if="$slots.prepend" #prepend>
        <slot name="prepend"></slot>
      </template>
      
      <VuijIconed 
        ref="iconedRef" 
        :icon="icon" 
        :iconRight="iconRight" 
        :dataIcon="dataIcon" 
        :loading="loading" 
        class="vuij-iconed_input" 
        :class="{'vuij-formel vuij-input vuij-input_stretch': !!$slots.stretch}"
      >
        <template v-if="$slots.icon" #icon="slotIconProps">
          <slot name="icon" v-bind="slotIconProps"></slot>
        </template>
        <template v-if="$slots.stretch" #prepend>
          <slot name="stretch"></slot>
        </template>
        <VuijInputTag 
            v-bind="$attrs" 
            ref="inputRef" 
            :type="type" 
            :value="value" 
            :modelValue="localValue" 
            @input="onInput" 
            @update:modelValue="value => emit('update:modelValue', value)"
            @focusin="(event: FocusEvent) => emit('focusin', event)"
            @keydown="(event: KeyboardEvent) => emit('keydown', event)" 
            :naked="!!$slots.stretch"
          />
      </VuijIconed>

      <template v-if="$slots.append" #append>
        <slot name="append"></slot>
      </template>
  </VuijCtrl>
</template>