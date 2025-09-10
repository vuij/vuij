<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue';

type InputType = 'checkbox' | 'radio'

const props = withDefaults(defineProps<{
  modelValue?: boolean | string | number | Array<string | number>
  value?: string | number
  type?: InputType
  multiple?: boolean
  trueValue?: boolean | string | number
  falseValue?: string | number | boolean
  asBoolean?: boolean
  native?: boolean
  nosvg?: boolean
  autofocus?: boolean
  ////
  label?: string
  //error, nativeValidity
  icon?: boolean | string
  iconRight?: boolean
  dataIcon?: string
  loading?: boolean
}>(), {
  type: 'checkbox',
  trueValue: undefined, //kill default false
  falseValue: undefined,//kill default false
  native: !!false,
  multiple: false,
  asBoolean: false
})

const inpRef = useTemplateRef('inpRef');

const isMultiple = ref(props.type === 'checkbox' && !!(Array.isArray(props.modelValue) || props.multiple)); //?
const trueVal = computed(() => props.type === 'checkbox' ? (props.trueValue ?? props.value ?? true) : (props.value ?? true));
const falseVal = computed(() => props.type === 'checkbox' ? (props.falseValue ?? false) : false);

// console.warn('VCheck', props.modelValue);
const localValue = ref<any>(null);// ?? (isMultiple.value ? [] : ''));

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | string | number | Array<string | number>): void
}>()

// Преобразование входящего значения к boolean
const toBoolean = (value: unknown): boolean => {
  if (props.asBoolean) { //&& !isMultiple.value ?
    return Boolean(value && value !== 'false' && value !== '0' && value !== '')
  }
  return !!value
}

// Скрыть нативные инпуты
const noNativeStyle = computed(() => {

  // if nosvg !
  // return !!props.native ? '' : 'position: absolute;bottom: 4px;/*visibility: hidden;*/'
  return !!props.native ? '' : 'position: absolute;bottom: 5px;width: calc(1em + 2px);height: calc(1em + 2px);opacity:0;z-index:-1;outline:none;';/**outline:none;opacity:0; */
})

// Определение состояния checked
const isChecked = computed(() => {
  if (props.type === 'radio') {
    return localValue.value === trueVal.value;//props.value
  }
  else {
    if (isMultiple.value) {
      // return localValue.value.includes(props.value)
      return localValue.value?.includes(trueVal.value)
    }

    // Для checkbox без группы
    // if(localValue.value==='model')  console.log('Для checkbox без группы', localValue.value, trueVal.value, props.trueValue, props.value);
    return props.asBoolean
      ? toBoolean(localValue.value)
      : localValue.value === trueVal.value

  }
})


const handleChange = (e: Event) => {
  const isChecked = (e.target as HTMLInputElement).checked;
  changeChecked(isChecked);
}
const changeChecked = (isChecked: boolean) => {
  // if (isMultiple.value && Array.isArray(localValue.value)) {
  if (isMultiple.value) {
    // const newValue = [...localValue.value]
    // if (isChecked) {
    //   newValue.push(props.value!)
    // } else {
    //   const index = newValue.indexOf(props.value!)
    //   if (index > -1) newValue.splice(index, 1)
    // }
    const newValue = [...localValue.value].filter(v => v !== trueVal.value)
    if (isChecked) {
      newValue.push(trueVal.value!)
    }
    
    localValue.value = newValue;
  }
  else {
    if (props.type === 'radio') {
      // console.log('radio');
      // localValue.value = props.value;
      localValue.value = trueVal.value;//?
    }
    else {
      // Обработка одиночного checkbox
      // console.log('Обработка одиночного checkbox');
      localValue.value = props.asBoolean ? isChecked : (isChecked ? trueVal.value : falseVal.value);
    }

  }

  if(localValue.value !== props.modelValue) emit('update:modelValue', localValue.value);

}

// watch(() => localValue.value, (value) => {
//   emit('update:modelValue', value);
// })

// Синхронизация при изменении modelValue извне
watch(() => props.modelValue, (newVal) => {
  if (localValue.value !== newVal) localValue.value = newVal;
  if (props.type === 'checkbox' && props.multiple && !Array.isArray(newVal)) {
    console.warn('VCheck: multiple mode requires array modelValue')
    // todo try toArray ?
  }
}, { immediate: true })//deep

watch(() => props.autofocus, (autofocus) => {
  if (autofocus && inpRef?.value) {
    // console.log('autofocus!');
    inpRef.value?.focus({preventScroll: true});
  }
})
</script>

<template>
    <label class="vuij-ctrl vuij-ctrl_check vuij-label" @keydown.enter="changeChecked(!isChecked)">
      
      <span class="vuij-check" :class="`vuij-check_${type}`">
        <input ref="inpRef" v-bind="$attrs" :type="type" :checked="isChecked" @change="handleChange" :style="noNativeStyle" :value="trueVal" :data-value="localValue"/>
        <template v-if="!native&&!nosvg">
          <template v-if="type === 'radio'">
            <svg class="vuij-check__svg vuij-check__svg_radio svg-radio" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"
              :data-checked="isChecked || undefined" style="width:1em;margin: 4px;user-select: none;">
              <component v-bind:is="'style'">
                svg.svg-radio {cursor: pointer;transition: transform 0.15s;}
                svg.svg-radio:not([disabled]):hover {transform: scale(1.1);transform-origin:center;}
                svg.svg-radio[disabled] {cursor: not-allowed;opacity: 0.3;}
                svg.svg-radio:not([disabled]):not([data-checked]) {opacity: 0.5;}
                svg.svg-radio:not([data-checked]) > circle.svg-radio__dot {transform: scale(0);}
                svg.svg-radio[disabled]:not([data-checked]) > circle {fill: lightgray;}
              </component>
              <circle cx="20" cy="20" r="18" stroke-width="2" stroke="currentColor" fill="canvas" />
              <circle class="svg-radio__dot" cx="20" cy="20" r="12" fill="currentColor" transform-origin="center"
                transform="scale(1)" style="transition: transform 0.15s" />
            </svg>
          </template>
          <template v-else>
            <svg class="vuij-check__svg vuij-check__svg_checkbox svg-checkbox" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"
              :data-checked="isChecked || undefined" style="width:1em;margin: 4px;user-select: none;">
              <component v-bind:is="'style'">
                svg.svg-checkbox {cursor: pointer;transition: transform 0.15s;}
                svg.svg-checkbox:not([disabled]):hover {transform: scale(1.1);transform-origin:center;}
                svg.svg-checkbox[disabled] {cursor: not-allowed;opacity: 0.3;}
                svg.svg-checkbox:not([disabled]):not([data-checked]) {opacity: 0.5;}
                svg.svg-checkbox:not([data-checked]) > path {transform: rotate(-30deg) scale(0);}
                svg.svg-checkbox:not([data-checked]) > rect {fill: canvas;}
                svg.svg-checkbox[disabled]:not([data-checked]) > rect {fill: lightgray;}
              </component>
              <rect x="1" y="1" width="38" height="38" rx="6" stroke-width="2" stroke="currentColor" fill="currentColor"
                style="transition: fill 0.15s" />
              <path d="M 16 31 L 8 23 C 5 20 9 16 12 19 L 16 23 L 28 11 C 31 8 35 12 32 15 Z" fill="canvas"
                transform-origin="center" transform="rotate(-5) scale(1)" style="transition: transform 0.15s" />
            </svg>
          </template>
        </template>
      </span>
      <div class="vuij-label__box" :class="{'vuij-iconed': $slots.icon || icon || dataIcon || loading, 'vuij-iconed_right': ($slots.icon || icon || dataIcon || loading) && iconRight}">
        <span v-if="$slots.icon || icon || dataIcon || loading" class="vuij-icon vuij-input__icon" :class="[icon, {loading, 'icon_': dataIcon&&!icon}]" :data-icon="dataIcon">
            <slot name="icon"></slot>
        </span>
        <slot name="default" v-bind="{label, icon, dataIcon, loading}">
          <span class="vuij-label__text">{{ label }}</span>
        </slot>
      </div>
    </label>
</template>