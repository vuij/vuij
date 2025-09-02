<template>
    <slot>
        <svg xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 40 40" 
            stroke="currentColor" 
            stroke-width="2" 
            fill="none" 
            class="vuij-loading"
            :class="svgClass" 
            :style="svgStyle" 
            v-bind="$attrs"
        >
            <path d="M 38 20 A 18 18 0 0 1 20 38"/>
            <!-- path d="M 38 20 A 18 18 0 1 0 20 38" class="three-quarters" -->
            <animateTransform attributeName="transform" type="rotate" to="360" dur="1s" repeatCount="indefinite" />
        </svg>
    </slot>
</template>

<script lang="ts" setup>
// const props = 
defineProps<{
    svgClass?: string|object
    svgStyle?: string|object
  }>();
</script>