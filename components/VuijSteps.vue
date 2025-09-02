<template>
        <div v-if="steps?.length" class="vuij-steps">
            <div 
                v-for="(description, x) in steps" 
                :key="'vuij-step_'+x" 
                class="vuij-step is-horizontal" 
                style="flex-basis: 200px;" 
                :style="isStepAvailable(x) ? 'cursor: pointer;' : (x===step ? '' : 'cursor: not-allowed;')" 
                @click.prevent="isStepAvailable(x) ? step=x : undefined" 
            >
                <!-- icon & line -->
                <div class="vuij-step__head" :class="{'is-success': step>x, 'is-process': step===x, 'is-wait': step<x}">
                    <div class="vuij-step__line">
                        <i class="vuij-step__line-inner" style="transition-delay: 0ms; border-width: 0px; width: 0%;"></i>
                    </div>
                    <div class="vuij-step__icon is-text">
                        <i v-if="step>x" class="el-icon vuij-step__icon-inner is-status">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                                <path fill="currentColor" d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"></path>
                            </svg>
                        </i>
                        <div v-else class="vuij-step__icon-inner">{{ String(x+1) }}</div>
                    </div>
                </div>
                <!-- title & description -->
                <div class="vuij-step__main">
                    <div class="vuij-step__title" :class="{'is-success': step>x, 'is-process': step===x, 'is-wait': step<x}">{{ 'Шаг ' + (x+1) }}</div>
                    <div class="vuij-step__description" :class="{'is-success': step>x, 'is-process': step===x, 'is-wait': step<x}">{{ description }}</div>
                </div>
            </div>
        </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    modelValue?: number | null
    steps: Array
    max?: number | null
  }>(), {
    
  });
const emit = defineEmits(['update:modelValue'])

const step = ref<number>(-1);

const isStepAvailable = _step => !isNaN(props?.max) || _step <= props?.max;

watch(step, _step => emit('update:modelValue', _step));
watch(() => props.modelValue, _step => step.value = _step, {immediate: true});
</script>

<style scoped>
.vuij-steps {
	display: flex;
    width: 100%;
    margin: 20px 0px;
    white-space: nowrap;
}
.vuij-step {
	flex-shrink: 1;
	position: relative;
}
.vuij-step.is-horizontal {
	display: inline-block;
}
.vuij-step__line {
	background-color: var(--el-text-color-placeholder);
	border-color: inherit;
	position: absolute;
}
.vuij-step.is-horizontal .vuij-step__line {
	height: 2px;
	left: 0;
	right: 0;
	top: 11px;
}
.vuij-step:last-of-type .vuij-step__line {
	display: none;
}
.vuij-step__line-inner {
	border: 1px solid;
	border-color: inherit;
	box-sizing: border-box;
	display: block;
	height: 0;
	transition: .15s ease-out;
	width: 0;
}
.vuij-step__icon {
	align-items: center;
	background: var(--el-bg-color);
	box-sizing: border-box;
	display: inline-flex;
	font-size: 14px;
	height: 24px;
	justify-content: center;
	position: relative;
	transition: .15s ease-out;
	width: 24px;
	z-index: 1;
}
.vuij-step__icon.is-text {
	border: 2px solid;
	border-color: inherit;
	border-radius: 50%;
}
.vuij-step__icon-inner {
	color: inherit;
	display: inline-block;
	font-weight: bold;
	line-height: 1;
	text-align: center;
	-webkit-user-select: none;
	-moz-user-select: none;
	user-select: none;
}
.vuij-step__icon-inner.is-status {
	transform: translateY(1px);
}
.vuij-step__main {
	text-align: left;
	white-space: normal;
}
.vuij-step__head {
	position: relative;
	width: 100%;
}
.vuij-step__head.is-wait {
	border-color: var(--el-text-color-placeholder);
	color: var(--el-text-color-placeholder);
}
.vuij-step__head.is-process {
	border-color: var(--el-text-color-primary);
	color: var(--el-text-color-primary);
}
.vuij-step__head.is-success {
	border-color: var(--el-color-success);
	color: var(--el-color-success);
}
.vuij-step__main {
	text-align: left;
	white-space: normal;
}
.vuij-step__title {
	font-size: 16px;
	line-height: 38px;
}
.vuij-step__title.is-wait {
	color: var(--el-text-color-placeholder);
}
.vuij-step__title.is-process {
	color: var(--el-text-color-primary);
	font-weight: bold;
}
.vuij-step__title.is-success {
	color: var(--el-color-success);
}
.vuij-step__description {
	font-size: 12px;
	font-weight: normal;
	line-height: 20px;
	margin-top: -5px;
	padding-right: 10%;
}
.vuij-step__description.is-wait {
	color: var(--el-text-color-placeholder);
}
.vuij-step__description.is-process {
	color: var(--el-text-color-primary);
}
.vuij-step__description.is-success {
	color: var(--el-color-success);
}
</style>