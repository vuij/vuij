<template>
    <div class="vuij-tags">
        <template v-for="({label,value}, tx) in normalizedTags.slice(0, scimpLength)" :key="'tag_'+tx" >
            <VuijTag 
                v-bind="{label,value}" 
                @close="onClose"
            >
                <template #default="slotProps">
                    <slot v-bind="slotProps">{{ slotProps.label }}</slot>
                </template>
            </VuijTag>
        </template>
        <VuijTag 
            v-if="scimpResidue>0" 
            v-bind="{label: '+'+String(scimpResidue)}"
        />
    </div>
</template>

<script lang="ts" setup>
import { computed, watch, ref, PropType } from 'vue';

import VuijTag from './VuijTag.vue';

type OptionItem = {
    label: string | number
    value: string | number
}

const props = defineProps({
    tags: {
        // type: Array as PropType<Array<OptionItem | string | number>>,
        type: Array as PropType<Array<OptionItem | any>>,
        required: true
    },
    onClose: {
        type: Function,
        default: undefined
    },
    labelKey: {
        type: String,
        default: 'label'
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    skimp: {
        type: Number,
        default: NaN,
    },
    normalize: {
        type: Boolean,
        default: true,
    },
})

const tagsLength = computed<number>(() => isNaN(normalizedTags.value?.length) ? 0 : normalizedTags.value.length);
const scimpLength = computed<number>(() => isNaN(props.skimp) ? tagsLength.value : Math.min(Math.max(0, props.skimp), tagsLength.value) );
const scimpResidue = computed<number>(() => tagsLength.value>scimpLength.value && scimpLength.value>-1 ? tagsLength.value-scimpLength.value : 0);

const normalizedTags = ref<OptionItem[]|any[]>([]);
// Нормализация тегов
const normalizeTags = () => {
    normalizedTags.value = 
        !props.normalize
            ? props.tags 
            : props.tags.map((item: any) => {
                if (typeof item === 'object' && item !== null) {
                    return {
                        label: item[props.labelKey]?.toString() || '',
                        value: item[props.valueKey]
                    }
                }
                return {
                    label: String(item),
                    value: item
                }
            })
}

watch(() => props.tags, normalizeTags, { immediate: true });
</script>