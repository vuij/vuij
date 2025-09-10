<template>
    <fieldset ref="fieldsetRef" data-if="Array.isArray(items)" :disabled="disabled" class="vuij-fieldset vuij-fieldset_options" role="group">
        <slot name="prepend"></slot>
        <VuijListBox class="vuij-options" :class="{'vuij-options_hidechecks': hidechecks}" :items="normalizedOptions" :loop="loop" :style="$attrs.style">
            <template v-slot="{item, index, isActive}">
                <VuijCheck 
                    :name="name ? (multiple ? (name.endsWith(']') ? name : name + '['+index+']') : name) : undefined" 
                    :type="multiple ? 'checkbox' : 'radio'" 
                    :multiple="multiple"
                    :autofocus="isActive||undefined" 
                    :label="$slots.default ? undefined : item[labelKey]"
                    :value="item[valueKey]" 
                    v-model="localModel"
                    :required="required"
                >
                    <slot name="default" v-bind="{item, index, isActive}">
                        <span class="vuij-label__text">{{ item[labelKey] }}</span>
                    </slot>
                    <!-- slot icon, nosvg, native, custom -->
                </VuijCheck>
            </template>
        </VuijListBox>
        <slot name="append"></slot>
    </fieldset>
</template>

<script setup lang="ts">
import { computed, watch, ref, PropType, useTemplateRef } from 'vue';

import VuijListBox from './VuijListBox.vue';
import VuijCheck from './VuijCheck.vue';

const props = defineProps({
    modelValue: {
        type: [Array, String, Number, Boolean, null] as PropType<
            Array<string | number | boolean> | string | number | boolean | null
        >,
        default: () => null
    },
    name: {
        type: String,
        default: undefined
    },
    options: {
        type: Array as PropType<Array<object | string | number | boolean>>,
        required: true
    },
    multiple: {
        type: Boolean,
        default: false
    },
    labelKey: {
        type: String,
        default: 'label'
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    disabled: Boolean,
    required: Boolean,
    loop: {
        type: Boolean,
        default: true
    },
    autofocus: {
        type: Boolean,
        default: false,
    },
    hidechecks: {
        type: Boolean,
        default: false,
    },
    //error // TODO
})

const fieldsetRef = useTemplateRef<HTMLElement | null>('fieldsetRef');
const emit = defineEmits(['update:modelValue']);

// Нормализация modelValue
const normalizeModel = (value: any) => {
    return (props.multiple) 
        ? (Array.isArray(value)
                ? value
                : (value !== undefined && value !== null
                    ? [value]
                    : [])) 
        : (Array.isArray(value)
            ? value[0] ?? null
            : value);
}
const localModel = computed({
    get: () => normalizeModel(props.modelValue),
    set: v => {
        emit('update:modelValue', v);
        // console.warn('--- --- --->', v);
    },
});

// Нормализация опций
const normalizedOptions = ref<object[]>([])
const normalizeOptions = () => {

    // console.warn('VuijOptions | normalizeOptions', props.options);

    normalizedOptions.value = props.options
        .map(option => {
            return (typeof option === 'object' && option !== null) 
                ? option 
                : { [props.labelKey]: String(option), [props.valueKey]: option }
        })
        .filter((option: any) => option?.[props.valueKey]!==undefined);
    
    // console.warn('VuijOptions | normalizeOptions +++', normalizedOptions.value);
}


// Наблюдатели
watch(() => props.options, normalizeOptions, { immediate: true, deep: true })
watch(() => props.multiple, () => {
    localModel.value = normalizeModel(props.modelValue)
})
watch(() => props.autofocus, (autofocus) => {
    if(autofocus) {
        const listElem = fieldsetRef.value?.firstElementChild;
        if(listElem instanceof HTMLElement) {
            setTimeout(()=>{
                listElem.focus({preventScroll: true});// focuin on list set activIndex = 0
            }, 1)
        }
    }
}, { immediate: true })
</script>