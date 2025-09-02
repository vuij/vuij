<template>
    <component :is="tag">
        <slot v-bind="$attrs"></slot>
    </component>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
    tag?: string
  }>(), {
    tag: 'p',
  });
</script>