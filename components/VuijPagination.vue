<template>
    <nav v-if="showPagination" class="vuij-pagination">
        <!-- Prepend Slot -->
        <slot name="prepend" />

        <!-- Previous Arrow -->
        <slot name="prev" :page="page - 1" :disabled="page === 1" :goTo="goTo">
            <VuijAngle v-if="arrowed && page > 1" direction="left" class="_vuij-pagination__prev" @click="goTo(page - 1)"/>
        </slot>

        <!-- Page Numbers -->
        <template v-for="item in pages" :key="'vuij-pagination_'+item">
            <slot v-if="item === 'break'" name="break">
                <span class="vuij-pagination__break">...</span>
            </slot>
            <slot v-else :page="item" :current="item === page" :goTo="goTo">
                <button class="vuij-pagination__item vuij-formel vuij-button" @click="goTo(item)"
                    :aria-current="item === page ? 'page' : undefined">
                    {{ item }}
                </button>
            </slot>
        </template>

        <!-- Next Arrow -->
        <slot name="next" :page="page + 1" :disabled="page === lastPage" :goTo="goTo">
            <VuijAngle v-if="arrowed && page < lastPage" direction="right" class="_vuij-pagination__next" @click="goTo(page + 1)"/>
        </slot>

        <!-- Append Slot -->
        <slot name="append" />
    </nav>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import VuijAngle from './VuijAngle.vue';

const props = withDefaults(defineProps<{
    modelValue?: number
    last_page?: number
    arrowed?: boolean
    max?: number
}>(), {
    last_page: 1, // Math.ceil(total/per_page)
    arrowed: !false,
    max: 10
})

const emit = defineEmits(['update:modelValue', 'change'])

const page = ref(props.modelValue || 1)
const lastPage = computed(() => Math.max(props.last_page, 1))
const effectiveMax = computed(() => Math.max(props.max, 2))

// Generate pagination items
const pages = computed(() => {
    if (lastPage.value <= 1) return []

    const range = (start: number, end: number) =>
        Array.from({ length: end - start + 1 }, (_, i) => start + i)

    if (lastPage.value <= effectiveMax.value) {
        return range(1, lastPage.value)
    }

    const half = Math.floor(effectiveMax.value / 2)
    let start = Math.max(1, page.value - half)
    const end = Math.min(lastPage.value, start + effectiveMax.value - 1)

    if (end - start < effectiveMax.value - 1) {
        start = Math.max(1, end - effectiveMax.value + 1)
    }

    const items: (number | 'break')[] = []

    if (start > 1) {
        items.push(1)
        if (start > 2) items.push('break')
    }

    items.push(...range(start, end))

    if (end < lastPage.value) {
        if (end < lastPage.value - 1) items.push('break')
        items.push(lastPage.value)
    }

    return items
})

// Navigation logic
const goTo = (newPage: number) => {
    if (newPage < 1 || newPage > lastPage.value) return
    page.value = newPage
    emit('update:modelValue', newPage)
    emit('change', newPage)
}

// Sync with external modelValue changes
watch(() => props.modelValue, (val) => {
    if (val !== undefined && val !== page.value) {
        page.value = val
    }
})

const showPagination = computed(() =>
    lastPage.value > 1 && effectiveMax.value > 1
)
</script>