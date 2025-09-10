<template>
    <div v-if="label || $slots.default" class="vuij-tag">
        <span class="vuij-tag__text">
            <slot v-bind="{label,value,onClose}">{{ label }}</slot>
        </span>
        <button v-if="onClose" :title="(onClose.toString())" class="vuij-tag__close vuij-close" type="button" @click="handleTagClose"></button>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps({
    label: {
        type: [Number, String]
    },
    value: {
        type: [Number, String]
    },
    onClose: {
        type: Function,
        default: undefined
    }
})

const emit = defineEmits(['close'])

const handleTagClose = (e: Event) => {
    if(props.onClose) {
        const {label, value} = props;
        emit('close', e, {label, value});
    }
}
</script>