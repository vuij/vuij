<template>
    <div class="vuij-time" style="">
        <VuijOptions v-model="hour" :options="hours" hidechecks style="overscroll-behavior: none;margin: 0px;padding: 0px;list-style: none;max-width: 3.5em;min-width: 3em;max-height: 2em;overflow: hidden auto;"/>
        <VuijOptions v-model="minute" :options="minutes" hidechecks style="overscroll-behavior: none;margin: 0px;padding: 0px;list-style: none;max-width: 3.5em;min-width: 3em;max-height: 2em;overflow: hidden auto;"/>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import VuijOptions from './VuijOptions.vue';

const padStr = (str: string|number) => String(str).padStart(2, '0')

const now = new Date();

const hour = ref(padStr(now.getHours()));
const minute = ref(padStr(now.getMinutes()));

const hours = [...Array(24).keys()].map(padStr);
const minutes = [...Array(60).keys()].map(padStr);
</script>

<style>
.vuij-time {
    position: relative;
    max-height: 100%;
    display: flex;
    background-color: lavender;
    overscroll-behavior: none;
}
.vuij-time .vuij-fieldset_options::-webkit-scrollbar {
    width: 4px;
    /* height: 4px; */
    background-color: ButtonFace;
    display: none;
}
.vuij-time .vuij-fieldset_options::-webkit-scrollbar-thumb {
    width: 4px;
    /* height: 4px; */
    background-color: Highlight;
}
</style>