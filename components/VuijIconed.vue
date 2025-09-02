
<script lang="ts" setup>
import { computed, ref, useSlots } from 'vue';
import VuijLoading from './VuijLoading.vue';


const iconed = ref<HTMLDivElement | null>(null);
defineExpose({iconed}); // to use in parent

const props = withDefaults(defineProps<{
    icon?: string | boolean
    iconRight: boolean
    dataIcon?: string
    loading: boolean
  }>(), {
    iconRight: false,
    loading: false,
  });

const slots = useSlots();
const hasIcon = computed<boolean>(() => !!(slots.icon || props.icon || props.dataIcon || props.loading));
</script>

<template>
    <div ref="iconed" class="vuij-iconed" :class="{'vuij-iconed_has-icon': hasIcon, 'vuij-iconed_right': hasIcon && iconRight}" v-bind="$attrs">
        <slot name="icon" v-bind="$props">
            <VuijLoading v-if="hasIcon" svgClass="vuij-icon">
                <span v-if="!loading" class="vuij-icon" :class="[icon]" :data-icon="dataIcon"></span>
            </VuijLoading>
        </slot>
        <!-- <div> -->
            <slot name="prepend"></slot>
            <slot></slot>
        <!-- </div> -->
    </div>
</template>