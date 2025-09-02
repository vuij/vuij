<template>
    <div class="vuij-ctrl" :class="ctrlClass" :style="ctrlStyle">
        <slot name="label" v-bind="$props">
            <label v-if="label!==undefined" :for="$props.for" class="vuij-label">
                {{ label }}
            </label>
        </slot>
        <div class="vuij-ctrl__input" :class="{'vuij-group': $slots.prepend || $slots.append}">
            <slot name="prepend"/>
            <slot v-bind="$attrs"/>
            <slot name="append"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
// const props = 
defineProps<{
    for?: string
    label?: string
    ctrlClass?: string|object
    ctrlStyle?: string|object
  }>();

defineOptions({
  inheritAttrs: false
});
</script>