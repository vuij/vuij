<template>
    <div class="vuij-tooltip">
        <div ref="triggerRef" @click="handleClick" @mouseenter="handleTriggerHover(true)" @mouseleave="handleTriggerHover(false)">
            <slot :is-open="isOpen" />
        </div>

        <VuijMystic v-if="!disabled" :el="triggerRef" :placement="placement" :trigger="trigger" :opened="isOpen" :hasArrow="hasArrow" :minZIndex="minZIndex" :offset="offset">
            <div class="vuij-card vuij-card_mystic vuij-card_tooltip" @mouseenter="handleContentHover(true)" @mouseleave="handleContentHover(false)">
                <slot name="content" :close="close" />
            </div>
        </VuijMystic>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import VuijMystic from './VuijMystic.vue';

type Placement = 'top' | 'bottom' | 'left' | 'right'
//Align

const props = withDefaults(defineProps<{
    placement?: Placement
    trigger?: 'click' | 'hover' | 'manual'
    offset?: number
    autoPosition?: boolean
    hasArrow?: boolean
    opened?: boolean
    disabled?: boolean
    //animations
    minZIndex?: number
}>(), {
    placement: 'bottom',
    trigger: 'hover',
    offset: 0,
    autoPosition: true,
    hasArrow: !true,
    opened: !true,
    disabled: !true,
    minZIndex: 1
})

const emit = defineEmits(['open', 'close'])

const isOpen = ref(props.opened)
const triggerRef = ref<HTMLElement | null>(null)

const triggerHovered = ref(false)
const contentHovered = ref(false)

const toggle = () => isOpen.value ? close() : open();

const open = () => {
    if (isOpen.value) return
    isOpen.value = true
    emit('open')
}

const close = () => {
    if (!isOpen.value) return
    isOpen.value = false
    emit('close')
}

// Обработчики событий
const handleClick = () => {
    if (props.trigger === 'click') {
        toggle()
    }
}

const handleHover = (state: boolean) => {
    if (props.trigger === 'hover') {
        state ? open() : close()
    }
}
const handleTriggerHover = (isEnter: boolean) => {
    // isEnter -> from: Event
    
    if (props.trigger === 'hover') {
        const needOpen = isEnter || contentHovered.value;
        needOpen ? open() : close()
    }
    setTimeout(() => triggerHovered.value = isEnter, 1)
}
const handleContentHover = (isEnter: boolean) => {
    if (props.trigger === 'hover') {
        const needOpen = isEnter || triggerHovered.value;
        needOpen ? open() : close()
    }
    setTimeout(() => contentHovered.value = isEnter, 1)
}

watch(() => props.opened, (opened) => {
    // console.log('opened was changed', {opened});
    if(isOpen.value!==opened) opened ? open() : close()
})
</script>