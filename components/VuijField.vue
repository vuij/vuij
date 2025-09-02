<script lang="ts" setup>
// import { ref, watch }
// import VuijLoading from '@/vuij/components/VuijLoading.vue';
import VuijDate from '@/vuij/components/VuijDate.vue';
import VuijInput from '@/vuij/components/VuijInput.vue';
import VuijTextarea from '@/vuij/components/VuijTextarea.vue';
import VuijSelect from '@/vuij/components/VuijSelect.vue';

const dirty = defineModel<any>();

// const props = 
defineProps({
    field: {
        type: Object,
        default: () => ({type: {type: String}})
    }
});

// const components = {}
</script>

<template>
    <slot v-if="field?.type" v-bind="{ field }">
        <VuijSelect 
            v-if="field.type==='select'"
            v-bind="Object.assign({}, $attrs, field)"
            v-model="dirty"
        >
            <!-- <template #option="optionSlotProps">
                <em>{{ optionSlotProps.item.label }}??</em>
            </template> -->
        </VuijSelect>
        <VuijTextarea v-else-if="field.type==='textarea'" v-model="dirty" v-bind="Object.assign({}, $attrs, field)"/>
        <VuijDate v-else-if="field.type==='date'" v-model="dirty" v-bind="Object.assign({}, $attrs, field)"/>
        <VuijInput v-else-if="field.type==='input'" v-model="dirty" v-bind="Object.assign({}, $attrs, field)" :type="field?.inputType??'text'"/>
        <slot v-else-if="$slots.fallback" name="fallback" v-bind="{ field }"></slot>
    </slot>
</template>