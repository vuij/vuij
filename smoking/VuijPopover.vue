<template>
    <div class="v-popover">
        <div ref="triggerRef" @click="handleClick" @mouseenter="handleHover(true)" @mouseleave="handleHover(false)">
            <slot :is-open="isOpen" />
        </div>

        <Teleport to="body">
            <Transition name="popover">
                <div ref="contentRef" class="popover-content" :class="contentClasses" :style="contentStyles" v-show="isOpen"
                    role="dialog">
                    <slot name="content" :close="close" />
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'

type Placement = 'top' | 'bottom' | 'left' | 'right'
//Align

const props = withDefaults(defineProps<{
    placement?: Placement
    trigger?: 'click' | 'hover' | 'manual'
    offset?: number
    autoPosition?: boolean
    hasArrow?: boolean
    opened?: boolean
    //opened
    //animations
}>(), {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    autoPosition: true,
    hasArrow: !true,
    opened: !true
})

const emit = defineEmits(['open', 'close'])

const isOpen = ref(props.opened)
const triggerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const contentRect = ref<DOMRect | null>(null)

// Позиционирование контента
const contentInfo = computed(() => {
    if (!triggerRef.value || !contentRect.value) return {}

    const triggerRect = triggerRef.value.getBoundingClientRect()
    const { width: cWidth, height: cHeight } = contentRect.value

    const scrollX = window.scrollX
    const scrollY = window.scrollY

    const basePosition = {
        top: {
            left: triggerRect.left + scrollX,
            top: triggerRect.top + scrollY - cHeight - props.offset
        },
        bottom: {
            left: triggerRect.left + scrollX,
            top: triggerRect.bottom + scrollY + props.offset
        },
        left: {
            left: triggerRect.left + scrollX - cWidth - props.offset,
            top: triggerRect.top + scrollY
        },
        right: {
            left: triggerRect.right + scrollX + props.offset,
            top: triggerRect.top + scrollY
        }
    }

    let placement = props.placement;
    let position = basePosition[placement];

    // Автокоррекция позиции
    if (props.autoPosition) {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const pTop = position.top - scrollY;
        const pLeft = position.left - scrollX;

        // console.warn({pTop, pLeft,cWidth,cHeight});

        if (pLeft < 0) placement = 'right'
        if (pLeft + cWidth > viewport.width) placement = 'left'
        if (pTop < 0) placement = 'bottom'
        if (pTop + cHeight > viewport.height) placement = 'top';

        position = basePosition[placement]
    }

    const isByX = placement==='left'||placement==='right';
    const tHalf = triggerRect[isByX?'height':'width']/2;

    return {
        style: {
            left: `${position.left}px`,
            top: `${position.top}px`,
            '--arrow-position': `${tHalf}px`
        },
        class: {
            [`base-place-${props.placement}`]: true,
            [`calc-place-${placement}`]: true,
            'has-arrow': props.hasArrow
        }
    }
})

const contentStyles = computed(() => contentInfo.value.style)
const contentClasses = computed(() => contentInfo.value.class)


const updateCRect = () => {
    if (contentRef.value) {
        const updRect = contentRef.value.getBoundingClientRect();
        contentRect.value = updRect;
    }
}

const toggle = () => isOpen.value ? close() : open();

const open = () => {
    if (isOpen.value) return
    isOpen.value = true
    nextTick(() => {
        updateCRect()
        window.addEventListener('scroll', updateCRect, true)
    })
    emit('open')
}

const close = () => {
    if (!isOpen.value) return
    isOpen.value = false
    window.removeEventListener('scroll', updateCRect, true)
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

const clickOutside = (e: MouseEvent) => {
    // if props.autoclose?
    if (!triggerRef.value?.contains(e.target as Node) &&
        !contentRef.value?.contains(e.target as Node)) {
        close()
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
}

const observer = new ResizeObserver(entries => {
    if (entries[0].target === triggerRef.value) updateCRect()
    if (entries[0].target === contentRef.value) contentRect.value = entries[0].target.getBoundingClientRect()
})

// Наблюдение за изменениями
onMounted(() => {
    if (triggerRef.value) observer.observe(triggerRef.value)
    document.addEventListener('click', clickOutside)
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', updateCRect)
})

onBeforeUnmount(() => {
    observer.disconnect()
    document.removeEventListener('click', clickOutside)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', updateCRect)
    window.removeEventListener('scroll', updateCRect)
})

watch(() => props.opened, (opened) => {
    // console.log('opened was changed', {opened});
    if(isOpen.value!==opened) opened ? open() : close()
})
</script>

<style scoped>
.popover-content {
    position: absolute;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    z-index: 1000;
}

.popover-content.has-arrow::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background: inherit;
    border: inherit;
    transform: rotate(45deg);
}

.calc-place-top.has-arrow::before {
    bottom: -6px;
    left: var(--arrow-position);
    border-top: none;
    border-left: none;
}

.calc-place-bottom.has-arrow::before {
    top: -6px;
    left: var(--arrow-position);
    border-bottom: none;
    border-right: none;
}

.calc-place-left.has-arrow::before {
    right: -6px;
    top: var(--arrow-position);
    border-bottom: none;
    border-left: none;
}

.calc-place-right.has-arrow::before {
    left: -6px;
    top: var(--arrow-position);
    border-top: none;
    border-right: none;
}

/** animations example */

.popover-enter-active,
.popover-leave-active {
  transition: transform 0.25s ease,
            opacity 0.25s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
}

/** */
.calc-place-bottomX {
  transform-origin: top;
}

.calc-place-bottomX.popover-enter-from,
.calc-place-bottomX.popover-leave-to {
  /* transform: translateY(-8px); */
  transform: scaleY(0);
}
</style>