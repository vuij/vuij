<template>
    <Teleport to="body">
        <Transition v-if="triggerRef" name="popover">
            <div ref="contentRef" :class="contentClasses" :style="contentStyles" v-show="isOpen" role="dialog">
                <slot name="default" close="close">
                    <div v-if="content">{{ content }}</div>
                </slot>
            </div>
        </Transition>
    </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch, useTemplateRef } from 'vue'

type Placement = 'top' | 'bottom' | 'left' | 'right'
//Align

const props = withDefaults(defineProps<{
    el?: HTMLElement | null //  | Range
    placement?: Placement
    trigger?: 'click' | 'hover' | 'manual'
    offset?: number
    autoPosition?: boolean
    mirror?: boolean
    hasArrow?: boolean
    opened?: boolean
    autoclose?: boolean
    content?: string
    //animations
}>(), {
    placement: 'bottom',
    trigger: 'click',
    offset: 8,
    autoPosition: true,
    mirror: true,
    hasArrow: !true,
    opened: !true,
    autoclose: true,
})

const emit = defineEmits(['open', 'close']);

const triggerRef = computed(() => props.el);
const contentRef = useTemplateRef<HTMLElement | null>('contentRef');
const contentRect = ref<DOMRect | null>(null)

// const isOpen = ref(props.opened);
const isOpen = ref(false);

//  Вычисление/Проверка позиции - выходит ли за пределы экрана
const calcPosition = (triggerRect: DOMRect) => {

    const { width, height } = (contentRect.value as DOMRect);

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const innerW = window.innerWidth;
    const innerH = window.innerHeight;

    const basePosition: Record<string, Record<string, number>> = {
        top: {
            left: triggerRect.left + scrollX,
            top: triggerRect.top + scrollY - height - props.offset
        },
        right: {
            left: triggerRect.right + scrollX + props.offset,
            top: triggerRect.top + scrollY
        },
        bottom: {
            left: triggerRect.left + scrollX,
            top: triggerRect.bottom + scrollY + props.offset
        },
        left: {
            left: triggerRect.left + scrollX - width - props.offset,
            top: triggerRect.top + scrollY
        }
    }

    const calc: Record<Placement|string, any> = {
        placement: props.placement,
        position: {},
    }

    if (props.autoPosition) {

        const calcPlacement = (position: any) => {

            let place = '';

            const pTop = position.top - scrollY;
            const pLeft = position.left - scrollX;

            // console.warn({pTop, pLeft, width, height});

            if (pLeft < 0) place = 'right';
            if (pLeft + width > innerW) place = 'left';
            if (pTop < 0) place = 'bottom';
            if (pTop + height > innerH) place = 'top';

            return place;

        },
        placeAlts: Record<string, string> = {}; 

        let basePositionKeys = Object.keys(basePosition); 
        
        if (props.mirror) {
            const propPlaceIndex = basePositionKeys.findIndex(k => k===calc.placement),
                propPlaceIndexIsEven = !(propPlaceIndex % 2);
            basePositionKeys = basePositionKeys.filter((k,x) => propPlaceIndexIsEven ? !(x % 2) : !!(x % 2));
            // console.log('mirror', {basePositionKeys} );
        }

        basePositionKeys.forEach(place => {
            const position = basePosition[place];
            placeAlts[place] = calcPlacement(position);
            ////
            // console.log('calcPlacement', place, {altPlacement: placeAlts[place]});
        });

        if(!!placeAlts[calc.placement]) { // базовый placement не помещается (предлагает алтернативу)
            const placeAltKeys = Object.keys(placeAlts),
                placeAltValues = Object.values(placeAlts),
                freePlaceIndex = placeAltValues.findIndex(v => !v);
            if(freePlaceIndex > -1) calc.placement = placeAltKeys[freePlaceIndex]; // если нашли место, которое не предлагает альтернативу (помещается целиком) - берём его. Иначе - альтернативы нет, ничего не меняем
        }

    }
    
    calc.position = basePosition[calc.placement];

    return calc;
}

// Позиционирование контента
const contentInfo = computed(() => {

    const info: Record<string, any> = { style: {}, class: {} };

    if (triggerRef.value && contentRect.value) {

        const triggerRect = triggerRef.value.getBoundingClientRect();

        const { placement, position } = calcPosition(triggerRect);

        const isByX = placement === 'left' || placement === 'right';
        const tHalf = triggerRect[isByX ? 'height' : 'width'] / 2;

        info.style = {
            position: 'absolute',
            left: `${position.left}px`,
            top: `${position.top}px`,
            '--arrow-position': `${tHalf}px`,
            zIndex: 9,
        }

        info.class = {
            'vuij-mystic': true,
            'vuij-mystic_arrowed': props.hasArrow,
            [`vuij-mystic_base-place-${props.placement}`]: true,
            [`vuij-mystic_calc-place-${placement}`]: true,
        }
    }

    return info;
})

const contentStyles = computed(() => contentInfo.value.style)
const contentClasses = computed(() => contentInfo.value.class)

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
// const toggle = () => isOpen.value ? close() : open();

const updateCRect = () => {
    if (contentRef.value) {
        const updRect = contentRef.value.getBoundingClientRect();
        contentRect.value = updRect;
    }
}

const clickOutside = (e: MouseEvent) => {
    if (props.autoclose &&
        !triggerRef.value?.contains(e.target as Node) &&
        !contentRef.value?.contains(e.target as Node)) {
        close()
    }
}

const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
}

const rObserver = new ResizeObserver(entries => {
    if (entries[0].target === triggerRef.value) updateCRect();
    if (entries[0].target === contentRef.value) contentRect.value = entries[0].target.getBoundingClientRect()
})

// Create an observer instance linked to the callback function
const mObserver = new MutationObserver((mutationList, /*observer*/) => {
    for (const mutation of mutationList) {
        if (mutation.type === "childList") {
            // console.log("A child node has been added or removed.");
            updateCRect();
        }
        // else if (mutation.type === "attributes") {
        //   console.log(`The ${mutation.attributeName} attribute was modified.`);
        // }
    }
});

const connect = () => {
    if (!contentRef.value) return;
    if (!triggerRef.value) return;

    rObserver.observe(triggerRef.value);
    mObserver.observe(contentRef.value, { /*attributes: true,*/ childList: true, subtree: true });

    document.addEventListener('click', clickOutside);
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('resize', updateCRect);


    if (props.opened) open();
}

const disconnect = () => {
    // console.log('disconnect')
    rObserver.disconnect();
    mObserver.disconnect();
    document.removeEventListener('click', clickOutside);
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', updateCRect);
    window.removeEventListener('scroll', updateCRect);
}

onMounted(() => {
    connect()
})
onBeforeUnmount(() => {
    disconnect()
})

watch(triggerRef, (trigger,) => {
    return trigger instanceof HTMLElement ? connect() : disconnect();
})
watch(contentRef, (content,) => {
    return content instanceof HTMLElement ? connect() : disconnect();
})
watch(() => props.opened, (opened) => {
    if (isOpen.value !== opened) return opened ? open() : close();
})
</script>