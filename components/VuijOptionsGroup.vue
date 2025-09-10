<template>
    <VuijCtrl :label="label" :ctrlClass="['vuij-buttons-group', 'vuij-ctrl_input', {'vuij-ctrl_small': small, 'vuij-buttons-group_radio': !multiple, 'vuij-buttons-group_checkbox': !!multiple}]">
        <VuijOptions
            :name="name"
            v-model="localValue" 
            :options="options" 
            :valueKey="valueKey" 
            :labelKey="labelKey" 
            :multiple="multiple" 
            :hidechecks="!multiple" 
            :required="required" 
            loop 
        />
         <template #append>
            <slot></slot>
         </template>
    </VuijCtrl>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import VuijCtrl from './/VuijCtrl.vue';
import VuijOptions from './/VuijOptions.vue';

const props = withDefaults(defineProps<{
  modelValue?: boolean | string | number | Record<string, any>
  name?: string
  label?: string
  valueKey?: string
  labelKey?: string
  options: Array<string | number | Record<string, any>>
  multiple?: boolean
  required?: boolean
  small?: boolean
}>(), {
  multiple: false,
  valueKey: 'value',
  labelKey: 'label',
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref();

watch(
    () => props.modelValue,
    (modelValue) => {
        // if(props.name === '_group') console.warn('-------- watch:modelValue', modelValue, props.name);
        // искать autoficus какой-то... при смене _group (т.е modelVale = undefined) - остаэтся нажатым чекбокс по порядковому номеру
        localValue.value = modelValue;
    },
    {
        immediate: true,
    }
);
watch(
    localValue,
    (localValue) => {
        if(localValue !== undefined && localValue !== props.modelValue) {
            // if(props.name === '_group') console.log('-------- watch:localValue', localValue);
            emit('update:modelValue', localValue);
        }
    },
);


// watch(
//     () => props.options,
//     (options) => {
//         console.warn('VuijOptionsGroup | watch:options', options);
//     }
// );
</script>

<style scoped>
.vuij-buttons-group {
    width: 100%;
    /* font-family: var(--font-family); */
    --vuij-group-gap: 2px;
    --vuij-group-flex-direction: column;
    --vuij-listbox-flex-direction: row;
    --vuij-listbox-flex-wrap: wrap;
    --vuij-listitem-justify-content: center;
    --vuij-listitem-flex: 1;
    --vuij-listitem-color-hover: var(--color-primary);
    --vuij-listitem-color-active-hover: var(--color-primary);
    --vuij-listitem-background-color: var(--bg-color-soft);
    --vuij-listitem-background-color-hover: var(--bg-color-medium);
    --vuij-listitem-padding: 0;
    /* --vuij-listitem-label-padding: 12px 20px; */
    --vuij-options-label-padding: 12px 20px;
    --vuij-listitem-label-text-transform: uppercase;
    --vuij-listitem-label-color: currentColor;
    --vuij-listitem-label-text-align: center;
    --vuij-listitem-label-font-weight: bold;
    --vuij-listitem-label-font-size: 12px;
    --vuij-listitem-label-justify-content: center;
    --vuij-listitem-label-cursor: pointer;
    --vuij-options-label-width: 100%;
}
.vuij-ctrl_small {
    /* --vuij-listitem-label-padding: 6px 12px; */
    --vuij-options-label-padding: 6px 12px;
    --vuij-listitem-label-font-size: 10px;
    --vuij-listitem-label-font-weight: normal;
}
</style>