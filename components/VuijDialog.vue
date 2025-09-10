<template>
    <dialog ref="dialogRef" class="vuij-dialog" @close="handleDialogClose">
        <section class="vuij-dialog__card vuij-card">
            <!-- Closer Slot -->
            <slot v-if="closeable" name="close" :close="close">
                <button class="vuij-dialog__close vuij-close" @click="close"></button>
            </slot>

            <!-- Header Slot -->
            <header v-if="$slots.header || title" :title="title" class="vuij-dialog__header">
                <slot name="header" :title="title" :close="close">
                    <h2 v-if="title" class="vuij-dialog__title">{{ title }}</h2>
                </slot>
            </header>

            <!-- Default Slot -->
            <main class="vuij-dialog__content">
                <slot />
            </main>

            <!-- Footer Slot -->
            <footer v-if="$slots.footer" class="vuij-dialog__footer">
                <slot name="footer" :close="close" />
            </footer>
        </section>
    </dialog>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
    modelValue?: boolean
    closeable?: boolean
    modal?: boolean
    title?: string
}>(), {
    closeable: true,
    modal: !true
})

const emit = defineEmits(['update:modelValue', 'change'])

const dialogRef = ref<HTMLDialogElement | null>(null)
const isOpen = ref(props.modelValue ?? false)

// Sync dialog state with props
watch(() => props.modelValue, (val) => {
    if (val === undefined) return
    return val ? open() : close(); // return for ts
})

// Handle native dialog close event
const handleDialogClose = () => {
    isOpen.value = false
    emit('update:modelValue', false)
    emit('change', false)
}

// Open dialog
const open = () => {
    console.log('try open', dialogRef.value);

    if (!dialogRef.value) return
    isOpen.value = true;
    emit('change', true);
    return props.modal ? dialogRef.value.showModal() : dialogRef.value.show();
}

// Close dialog
const close = () => {
    if (!dialogRef.value) return
    dialogRef.value.close()
    isOpen.value = false
    emit('update:modelValue', false)
    emit('change', false)
}

// Cleanup
onBeforeUnmount(close)

// Initial state
watch(() => isOpen.value, (val) => val ? open() : close(), { immediate: true })
</script>