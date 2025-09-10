<template>
    <Component :is="$attrs.href?'A':'BUTTON'" ref="btnRef" :autofocus="autofocus" class="vuij-formel vuij-button" v-bind="$attrs" :type="submit ? 'submit' : type">
        <VuijLoading v-if="$slots.icon || icon || dataIcon || loading">
            <span v-if="!loading" class="vuij-icon vuij-button__icon" :class="icon" :data-icon="dataIcon">
                <slot name="icon"></slot>
            </span>
        </VuijLoading>
        <span v-if="$slots.default || label" class="vuij-button__label">
            <slot>{{ label }}</slot>
        </span>
    </Component>
</template>

<script lang="ts" setup>
import VuijLoading from './VuijLoading.vue';
import { useTemplateRef, watch } from 'vue';

const btnRef = useTemplateRef<HTMLElement | null>('btnRef');

type ButtonType = 'button' | 'submit' | 'reset'

const props = withDefaults(defineProps<{
  type?: ButtonType
  label?: string
  icon?: string | boolean
  dataIcon?: string
  loading?: boolean
  //link, level
  submit?: boolean
  autofocus?: boolean
}>(), {
  type: 'button',
  loading: false,
  submit: false,
});

// watch(
//   () => props.autofocus, 
//   (autofocus) => {
//     console.log('autofocus?', autofocus);
//   }, 
//   { immediate: true }
// )

watch(() => props.autofocus, (autofocus) => {
    if(autofocus) {
        const btnElem = btnRef.value;
          console.log('watch:autofocus', {autofocus});
        console.dir(btnElem);
        if(btnElem) {
            // setTimeout(()=>{
                btnElem.focus({preventScroll: true});//{preventScroll: true});// focuin on list set activIndex = 0
            // }, 1)
        }
    }
})
</script>