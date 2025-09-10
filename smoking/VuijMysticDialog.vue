<script lang="ts" setup>
/**
 * @version 0.1-beta
 * @author trunow 
 */

import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, useTemplateRef } from 'vue'

type Placement = 'top' | 'bottom' | 'left' | 'right'
//Align

const props = withDefaults(defineProps<{
    el?: HTMLElement | null //  | Range
    placement?: Placement
    trigger?: 'click' | 'hover' | 'manual' // | 'in-out?'
    offset?: number
    modal?: boolean
    teleport?: boolean
    flipping?: boolean
    arrowed?: boolean
    opened?: boolean
    autoclose?: boolean
    content?: string
    //animations?
}>(), {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    modal: true,
    teleport: false,
    flipping: true,
    arrowed: false,
    opened: false,
    autoclose: true,
})

const emit = defineEmits(['open', 'close']);

const tRef = computed(() => props.el);
const dRef = useTemplateRef<HTMLDialogElement | null>('dRef');
const dRect = ref<DOMRect | null>(null)

const inFixed = ref<boolean>(false) //el? // TODO // sticky? modal,teleport?

// Позиционирование контента
const dInfo = computed(() => {
    if (!tRef.value || !dRect.value) return {}

    const tRect = tRef.value.getBoundingClientRect()
    const { width: cWidth, height: cHeight } = dRect.value;

    ////// DEV
    if(dRef.value?.open && (!cWidth || !cHeight)) {
        console.warn('where id cWidth/cHeight?', {cWidth, cHeight});
    }

    const scrollX = inFixed.value && !props.teleport ? 0 : window.scrollX;
    const scrollY = inFixed.value && !props.teleport ? 0 : window.scrollY;

    const basePosition = {
        top: {
            left: tRect.left + scrollX,
            top: tRect.top + scrollY - cHeight,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: props.offset,
            paddingLeft: 0,
        },
        bottom: {
            left: tRect.left + scrollX,
            top: tRect.bottom + scrollY,
            paddingTop: props.offset,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
        },
        left: {
            left: tRect.left + scrollX - cWidth,
            top: tRect.top + scrollY,
            paddingTop: 0,
            paddingRight: props.offset,
            paddingBottom: 0,
            paddingLeft: 0,
        },
        right: {
            left: tRect.right + scrollX,
            top: tRect.top + scrollY,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: props.offset,
        }
    }

    let placement = props.placement;
    let position = basePosition[placement];

    // Автокоррекция позиции
    if (props.flipping) {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const pTop = position.top - scrollY; // props.offset,
        const pLeft = position.left - scrollX;

        // console.warn({pTop, pLeft,cWidth,cHeight});

        // todo props.mirror

        if (pLeft < 0) placement = 'right'
        if (pLeft + cWidth > viewport.width) placement = 'left'
        if (pTop < 0) placement = 'bottom'
        if (pTop + cHeight > viewport.height) placement = 'top';

        position = basePosition[placement]
    }

    const isByX = placement==='left'||placement==='right';
    // const tSize = tRect[isByX?'height':'width']/2;
    // const dSize = dRect[isByX?'height':'width']/2;
    const sizeName = isByX?'height':'width';
    const tSize = tRect[sizeName]/2;
    const dSize = dRect.value[sizeName]/2;
    // const tHalf = tRect[isByX?'height':'width']/2;
    const arrowPosition = dSize > tSize ? tSize : dSize;

    return {
        style: {
            position: inFixed.value ? 'fixed' : 'absolute',
            inset: 'unset', /** reset! */
            left: `${position.left}px`,
            top: `${position.top}px`,
            border: 'none',
            backgroundColor: 'transparent',
            margin: 0,
            padding: `${position.paddingTop}px ${position.paddingRight}px ${position.paddingBottom}px ${position.paddingLeft}px`,
            '--vuij-mystic-arrow-position': `${Math.max(arrowPosition||0,10)}px`,
            '--vuij-mystic-offset': `${props.offset||0}px`,
            '--vuij-mystic-position': placement,
            '--vuij-mystic-toggler-width': `${tRect.width}px`,
        },
        class: {
            'vuij-mystic': true,
            'vuij-mystic_arrowed': !!props.arrowed,
            [`vuij-mystic_base-${props.placement}`]: true,
            [`vuij-mystic_calc-${placement}`]: true,
        }
    }
});

const dStyle = computed(() => dInfo.value.style);
const dClass = computed(() => dInfo.value.class); // data- ?

const open = () => {
    if (!dRef.value || dRef.value?.open) return;
    dRef.value[props.modal?'showModal':'show']();
    nextTick(() => {
        updateDialogRect();
        if(!inFixed.value || props.teleport) window.addEventListener('scroll', updateDialogRect, true);
    });

    emit('open');
}
const close = () => {
    if (!dRef.value || !dRef.value?.open) return;
    dRef.value.close();
    window.removeEventListener('scroll', updateDialogRect, true);

    emit('close');
}

const updateDialogRect = () => {
    if (dRef.value) {
        dRect.value = dRef.value.getBoundingClientRect();
    }
}

const clickOutside = (e: MouseEvent) => {
    if (props.autoclose) {
        if (dRef.value === e.target) {
            // console.warn('clickOutside by backdrop!');
            close();
        } 
        // // IF backdrop width==height==0 || !props.modal
        else if(!props.modal && !tRef.value?.contains(e.target as Node) && !dRef.value?.contains(e.target as Node)) {
            // console.log('clickOutside!');
            close();
        }
    }
}

const handleKeydown = (e: KeyboardEvent) => { // ex. optional hot-keys 
    if (e.key === 'Escape') close()
}


const iObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting && dRef.value?.open) updateDialogRect();
  });
}, { threshold: 0.5 });

const rObserver = new ResizeObserver(entries => {
    if (entries[0].target === tRef.value) updateDialogRect()
    if (entries[0].target === dRef.value) {
        // console.log('rObserver:dRef', );
        updateDialogRect();
        // dRect.value = entries[0].target.getBoundingClientRect();
    }
})

const connect = () => {
    // console.log('VMD connect', tRef.value);

    if (!tRef.value) return;
    else {
        if (!dRef.value) return disconnect();
        else {

            // if(!props.teleport) 
            inFixed.value = isNestedInFixed(dRef.value);
            // console.log(inFixed.value ? 'YES' : 'no')

            rObserver.observe(tRef.value);
            rObserver.observe(dRef.value);
            iObserver.observe(dRef.value);
        }
    }
    document.addEventListener('click', clickOutside)
    document.addEventListener('keydown', handleKeydown)
    window.addEventListener('resize', updateDialogRect)

    if(props.opened) open();
}

const disconnect = () => { // hard/soft disconnect/unobserve ??
    // console.log('VMD disconnect');

    rObserver.disconnect();
    iObserver.disconnect();
    document.removeEventListener('click', clickOutside)
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', updateDialogRect)
    window.removeEventListener('scroll', updateDialogRect);
    return;
}

function isNestedInFixed(element: HTMLElement | null) {
  let current = element;
  while (current !== null) {
    if (window.getComputedStyle(current).position === 'fixed') { // sticky ?
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

onMounted(connect)
onBeforeUnmount(disconnect)

// onMounted(() => {
//     connect()
// })
// onBeforeUnmount(() => {
//     disconnect()
// })

watch(tRef, (trigger) => trigger instanceof HTMLElement ? connect() : disconnect())
watch(dRef, (dialog) => dialog instanceof HTMLElement ? connect() : disconnect())

watch(() => props.opened, (opened) => {
    if(dRef.value && dRef.value?.open!==opened) {
        return opened 
            ? dRef.value[props.modal?'showModal':'show']() 
            : dRef.value.close();
    }
})
</script>

<template>
    <Teleport to="body" :disabled="!teleport">
        <dialog ref="dRef" :style="dStyle" :class="dClass" data-mystic-calc tabindex="-1">
            <div class="vuij-mystic__wrapper">
                <slot name="default">
                    <div v-if="content">{{ content }}</div>
                </slot>
            </div>
        </dialog>
    </Teleport>
</template>

<style scoped>
dialog.vuij-mystic {
    inset: unset;
    padding: 0;
    margin: 0;
    background: transparent;
}
dialog.vuij-mystic[open]::backdrop {
    opacity: 0;
    /* z-index: -1;
    width: 0;
    height: 0; */
}

/** example dialog animation */
dialog.vuij-mystic[open] {
  animation: fadein .1s ease-in forwards;
}

@keyframes fadein{
  0%{
    opacity:0;
    transform: scale(0.92);
  }
  100%{
    opacity:1;
    transform: scale(1);
  }
}

/** укаршалки */
.vuij-mystic .vuij-mystic__wrapper {
    position: relative;
    padding: var(--vuij-mystic-wrapper-padding, 0);
    background-color: var(--vuij-mystic-wrapper-bg-color, white);
    border: var(--vuij-mystic-wrapper-border, 1px solid #e0e0e0);
    border-radius: var(--vuij-mystic-wrapper-border-radius, 8px);
    /* box-shadow: var(--vuij-mystic-wrapper-box-shadow, 0 4px 12px rgba(0, 0, 0, 0.15)); */
}

/** стрелка */
.vuij-mystic.vuij-mystic_arrowed .vuij-mystic__wrapper::before {
    content: '';
    position: absolute;
    --vuij-mystic-arrow-size: calc(var(--vuij-mystic-offset) *1.2);
    --vuij-mystic-arrow-offset: calc(var(--vuij-mystic-arrow-size) / -2);
    width: var(--vuij-mystic-arrow-size);
    height: var(--vuij-mystic-arrow-size);
    background: inherit;
    border: inherit;
    transform: rotate(45deg);
    clip-path: polygon(0% 0, 108% 0%, 0 108%);
}

.vuij-mystic.vuij-mystic_arrowed:is(.vuij-mystic_calc-top) .vuij-mystic__wrapper::before {
    bottom: var(--vuij-mystic-arrow-offset);
    left: var(--vuij-mystic-arrow-position);
    border-top: none;
    border-left: none;
}
.vuij-mystic.vuij-mystic_arrowed:is(.vuij-mystic_calc-bottom) .vuij-mystic__wrapper::before {
    top: var(--vuij-mystic-arrow-offset);
    left: var(--vuij-mystic-arrow-position);
    border-bottom: none;
    border-right: none;
}
.vuij-mystic.vuij-mystic_arrowed:is(.vuij-mystic_calc-left) .vuij-mystic__wrapper::before {
    right: var(--vuij-mystic-arrow-offset);
    top: var(--vuij-mystic-arrow-position);
    border-bottom: none;
    border-left: none;
}
.vuij-mystic.vuij-mystic_arrowed:is(.vuij-mystic_calc-right) .vuij-mystic__wrapper::before {
    left: var(--vuij-mystic-arrow-offset);
    top: var(--vuij-mystic-arrow-position);
    border-top: none;
    border-right: none;
}

</style>