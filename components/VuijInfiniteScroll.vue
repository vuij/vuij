<template>
    <!-- <div ref="scrollContainer" class="v-infinite-scroll" @scroll="handleScroll"> -->
        <slot />
        <template v-if="!disabled">
            <VuijLoading svgStyle="display: block;margin: auto;font-size: 4rem;color: var(--color-gentle);">
                <div v-if="!loading"></div>
            </VuijLoading>
            <div ref="sentinel" style="height: 64px;width: 64px;visibility: hidden;"></div>
        </template>
      <!-- </div> -->
</template>

<script setup lang="ts">
import VuijLoading from './VuijLoading.vue';
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

const props = withDefaults(defineProps<{
    disabled?: boolean
    loading?: boolean
    direction?: 'vertical' | 'horizontal'
    rootMargin?: string
}>(), {
    direction: 'vertical',
    rootMargin: '0px',
});

const emit = defineEmits(['load']);

const scrollContainer = ref<HTMLElement | null>(null); // computed(() => props.container instanseof HTMLElement ? props.container : null)
const sentinel = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);


// Инициализация Intersection Observer
const initObserver = () => {
    if (observer.value) observer.value.disconnect()

    observer.value = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !props.disabled && !props.loading) {
                loadMore('initObserver')
            }
            // console.log('initObserver', entries[0].isIntersecting);
        },
        {
            // root: scrollContainer.value, // null - is viewport
            rootMargin: props.rootMargin,
            threshold: 0.1
        }
    )

    if (sentinel.value) {
        observer.value.observe(sentinel.value)
    }
}

// Проверка необходимости загрузки при монтировании
const checkInitialLoad = () => {
    if (('IntersectionObserver' in window)) return;
    if (!scrollContainer.value || props.disabled) return;

    const isContentSmaller = props.direction === 'vertical'
        ? scrollContainer.value.scrollHeight <= scrollContainer.value.clientHeight
        : scrollContainer.value.scrollWidth <= scrollContainer.value.clientWidth;

    if (isContentSmaller && !props.loading) {
        loadMore('checkInitialLoad');
    }
}

// Загрузка данных
const loadMore = (log) => {
    // console.warn('loadMore', {log});
    if (props.disabled || props.loading) return;
    emit('load');
}

// Обработчик скролла для браузеров без поддержки IntersectionObserver
const handleScroll = () => {
    if (('IntersectionObserver' in window)) return;
    if (props.disabled || !scrollContainer.value || ('IntersectionObserver' in window)) return;

    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
    const isNearEdge = props.direction === 'vertical'
        ? scrollHeight - scrollTop - clientHeight <= 0 // parseInt(props.rootMargin)
        : scrollWidth - scrollLeft - clientWidth <= 0;

    if (isNearEdge && !props.loading) {
        loadMore('handleScroll');
    }
}

// Хуки жизненного цикла
onMounted(() => {
    initObserver();
    checkInitialLoad();
})

onBeforeUnmount(() => {
    if (observer.value) {
        observer.value.disconnect();
    }
})

// Реакция на изменения пропсов
watch(() => props.disabled, (disabled) => {
    if (!disabled) {
        nextTick(() => {
            initObserver();
            checkInitialLoad();
        })
    }
})
</script>

<style scoped>
.v-infinite-scroll {
    position: relative;
}

.sentinel {
    opacity: 0;
}
</style>