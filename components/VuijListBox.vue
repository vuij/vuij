<template>
    <menu class="vuij-listbox" ref="listRef" tabindex="0" @focusout.self="activeIndex=-1" @focusin.self.prevent="handleFocusin" @keydown="handleKeydown" role="listbox">
      <li class="vuij-listitem" v-for="(item, index) in items" :key="index" role="option" @click="updateActiveIndex(index)"
        :aria-current="(activeIndex === index)">
        <slot v-bind="{ item, index, isActive: activeIndex === index }" />
      </li>
    </menu>
</template>

<script setup lang="ts">
import { defineExpose, computed, ref, watch } from 'vue';

const props = defineProps<{
  items: any[]
  modelValue?: number
  loop?: boolean
  selectable?: boolean
  disabled?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'focusin', 'focusout', 'change']);

const activeIndex = ref<number>(props.modelValue ?? -1);
const itemsCount = computed(() => props.items.length);

const listRef = ref<HTMLElement | null>(null);
defineExpose({listRef}); // to use in parent

const scrollToIndex = (index: number) => {
  // const targetElement = itemRefs.value[index] || listRef.value?.querySelector(`[data-index="${index}"]`)
  const targetElement = listRef.value?.children?.[index]

  if (targetElement) {
    (targetElement as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
      // scrollMode: 'if-needed' // Предотвращает ненужную прокрутку
    })
  }
}

const updateActiveIndex = (newIndex: number, scroll: boolean = false) => {
  if (newIndex < 0) newIndex = props.loop ? itemsCount.value - 1 : 0;
  if (newIndex >= itemsCount.value) newIndex = props.loop ? 0 : itemsCount.value - 1;

  activeIndex.value = newIndex;
  emit('update:modelValue', activeIndex.value);

  if(scroll) scrollToIndex(newIndex);
}

const fireSelect = () => {
  // console.log('emit fire');
  if (props.selectable && !props.disabled) emit('change', activeIndex.value); //if NO quantum pair active ?
}

const handleFocusin = (/*_e: FocusEvent*/) => {
  if(activeIndex.value===undefined || activeIndex.value===-1) updateActiveIndex(0);
  // else {
  //   const fromOut = _e.target === _e.relatedTarget?.parentElement?.parentElement;
  //   if(fromOut) {
  //     console.log('NEED Focusout?');
  //     // console.dir(_e.target);
  //     // console.dir(_e.relatedTarget);
  //     // console.log(_e.target===_e.relatedTarget);
  //   }
  // }
    // console.log('focusin', _e);
    // emit('focusin', _e);
}

const handleKeydown = (e: KeyboardEvent) => {
  const keyActions: Record<string, () => void> = {
    ArrowDown: () => updateActiveIndex(activeIndex.value + 1, true),
    ArrowUp: () => updateActiveIndex(activeIndex.value - 1, true),
    ArrowRight: () => updateActiveIndex(activeIndex.value + 1, true),
    ArrowLeft: () => updateActiveIndex(activeIndex.value - 1, true),
    // Home: () => updateActiveIndex(0),
    // End: () => updateActiveIndex(itemsCount.value - 1),
  }

  if (props.selectable && !props.disabled) {
    keyActions.Enter = () => fireSelect();
    keyActions.Space = () => fireSelect();
  }

  if (keyActions[e.code]) {
    e.preventDefault()
    keyActions[e.code]()
  }
}

watch(() => props.modelValue, (val?: number) => {
  if (val && val !== activeIndex.value) {
    activeIndex.value = val;
  }
});
</script>