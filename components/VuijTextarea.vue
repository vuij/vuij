<template>
  <VuijCtrl :label="label" ctrlClass="vuij-ctrl_input">
    <template v-if="$slots.prepend" #prepend>
      <slot name="prepend"></slot>
    </template>
    <textarea 
      ref="textareaRef" 
      v-bind="$attrs" 
      :value="modelValue" 
      class="vuij-formel vuij-textarea"
      :style="computedStyles" 
      @input="handleInput"
    ></textarea>
    <template v-if="$slots.append" #append>
      <slot name="append"></slot>
    </template>
  </VuijCtrl>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import VuijCtrl from './VuijCtrl.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
  },
  autosize: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const lineHeight = ref<number>(0)
const baseHeight = ref<number>(0)

// Рассчитываем базовые параметры
const calculateBaseParams = () => {
  if (!textareaRef.value) return

  const style = window.getComputedStyle(textareaRef.value)
  const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom)

  textareaRef.value.style.height = 'auto'
  baseHeight.value = textareaRef.value.scrollHeight - padding
  lineHeight.value = parseFloat(style.lineHeight) ||
    parseFloat(style.fontSize) * 1.2
}

// Обновление высоты
const updateHeight = () => {
  if (!props.autosize || !textareaRef.value) return

  // Сохраняем позицию скролла и курсора
  const { scrollTop, scrollLeft } = document.documentElement
  // const selectionStart = textareaRef.value.selectionStart

  textareaRef.value.style.height = 'auto';
  textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`

  // Восстанавливаем позицию
  nextTick(() => {
    document.documentElement.scrollTop = scrollTop
    document.documentElement.scrollLeft = scrollLeft
    // textareaRef.value?.setSelectionRange(selectionStart, selectionStart)
  })
}

// Обработчик ввода
const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  const value = target.value
  emit('update:modelValue', value)
  if (props.autosize) updateHeight()
}

// Наблюдатель за внешними изменениями modelValue
watch(() => props.modelValue, (newVal) => {
  if (textareaRef.value && newVal !== textareaRef.value.value) {
    textareaRef.value.value = newVal
    if (props.autosize) updateHeight()
  }
})

// Инициализация
onMounted(() => {
  if (props.autosize) {
    nextTick(() => {
      calculateBaseParams()
      updateHeight()
    })
  }
})

// Стили (resize больше не переопределяем)
const computedStyles = computed(() => ({
  // overflow: 'auto',
}))
</script>