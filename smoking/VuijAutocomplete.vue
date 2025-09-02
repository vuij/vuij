<template>
    <VuijCtrl>
        <input ref="mysticRef" type="search" @input="handleInput" placeholder="Autocomplete"/>
        <VuijMystic :el="mysticRef" :opened="!!selectIsOpen" @close="handleMysticClose" :offset="0">
            <VuijOptions 
                v-model="activeIndex"
                :options="items" 
                multiple
                loop
            />
        </VuijMystic>

    </VuijCtrl>
</template>

<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

import VuijCtrl from './VuijCtrl.vue';
import VuijMystic from './VuijMystic.vue';
import VuijOptions from './VuijOptions.vue';

const selectIsOpen = ref(false);

const handleMysticClose = () => {
    // console.warn('handleMysticClose');
    selectIsOpen.value = false;
}

const handleInput = (/*e: Event*/) => {
    // console.warn('handleInput', {e});
    selectIsOpen.value = true;
}

const mysticRef = useTemplateRef('mysticRef');

const activeIndex = ref(-1);
const items = ['One', 'Two', 'Three']
</script>