<template>
    <VuijInput 
        :label="label" 
        ref="inpRef" 
        :type="type" 
        v-model="localValue" 
        v-bind="$attrs" 
        :readonly="!filterable" 
        @focusin="handleFocusin" 
        @input="handleInput" 
        @keydown.down="handleDown" 
    >
        <template v-if="$slots.prepend" #prepend>
            <slot name="prepend"></slot>
        </template>
        
        <template v-if="$slots.icon" #icon="slotIconProps">
          <slot name="icon" v-bind="slotIconProps"></slot>
        </template>

        <template v-if="$slots.stretch" #stretch>
            <slot name="stretch"></slot>
        </template>

        <template #append>
            <slot name="append"></slot>

            <VuijMystic :el="inpRef?.iconedRef?.iconed" :opened="!!isOpen" @close="close" :offset="0">
                <slot :close="close"></slot>
            </VuijMystic>
        </template>
    </VuijInput>
</template>

<script lang="ts" setup>
import { watch, ref, PropType, useTemplateRef } from 'vue';

import VuijInput from './VuijInput.vue';
import VuijMystic from './VuijMystic.vue';

const props = defineProps({
    modelValue: {
        type: [Array, String, Number, Boolean, null] as PropType<
            Array<string | number | boolean> | string | number | boolean | null
        >,
        default: () => null
    },
    label: {
        type: String,
    },
    type: {
        type: String,
        default: 'search'
    },
    opened: {
        type: Boolean,
        default: false,
    },
    filterable: Boolean,
})

const inpRef = useTemplateRef('inpRef');
defineExpose({inpRef}); // to use in parent
const isOpen = ref(false);

const open = () => {
    isOpen.value = true;
    emit('toggle', isOpen.value);
}
const close = () => {
    isOpen.value = false;
    emit('toggle', isOpen.value);
}
const toggle = () => {
    isOpen.value = !isOpen.value;
    emit('toggle', isOpen.value);
}

const handleFocusin = (/*e: Event*/) => {
    // if(!isOpen.value) open(); // props.autofocus ? 
}

const handleInput = async (e: Event) => {
    // console.log('InputPop:handleInput');
    open();
    emit('input', e);
}

const handleDown = (e: Event) => {
    open();
    emit('down', e);
}

const emit = defineEmits(['update:modelValue', 'input', 'down', 'toggle'])

const localValue = ref()

// Наблюдатели
watch(() => props.opened, v => {if(isOpen.value !== v) toggle()}, { immediate: true });
watch(() => props.modelValue, v => {if(localValue.value !== v) localValue.value = v}, { immediate: true });
watch(localValue, () => {
    emit('update:modelValue', localValue.value);
})
</script>