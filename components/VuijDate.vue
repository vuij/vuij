<template>
    <VuijInputPop 
        ref="dateRef" 
        filterable 
        v-model="localeDateString"
        v-bind="$attrs" 
        :name="name && !hasFormat ? name : undefined" 
        maxlength="10" 
        pattern="\d{2,2}.\d{2,2}.\d{4,4}" 
        placeholder="dd.mm.yyyy" 
        :opened="isOpen" 
        @toggle="opened => isOpen=!!opened" 
        @focus="isOpen=true" 
        @down="handleDown" 
        data-x-icon="🗓" 
        icon-right
    >
        <template #icon>
            <span class="vuij-icon" @click="dateRef?.inpRef?.inputRef?.input?.focus()">
                <Calendar/>
            </span>
            <input v-if="name && hasFormat" type="hidden" :name="name" :value="format(fromLocaleDateString(localeDateString))"/>
        </template>

        <template #default="{close}">
            <div class="vuij-card vuij-card_mystic vuij-card_calendar">
                <VuijCalendar v-model="calDate" :autofocus="autofocusCal" @select="v=>{if(v) close();}"/>
            </div>
        </template>
    </VuijInputPop>
</template>

<script lang="ts" setup>
import { computed, ref, useTemplateRef, watch } from 'vue';

import VuijInputPop from './/VuijInputPop.vue';
import VuijCalendar from './/VuijCalendar.vue';
import Calendar from '../svg/Calendar.vue';

const props = defineProps(['modelValue', 'name', 'format']);//
const emit = defineEmits(['update:modelValue']);

const dateRef = useTemplateRef('dateRef');
// defineExpose({dateRef}); // to use in parent

const localeDateString = ref(props.modelValue instanceof Date ? props.modelValue.toLocaleDateString() : props.modelValue); 
// const calDate = ref<Date|null>(new Date); 
const calDate = ref<Date|null>(null); 

const autofocusCal = ref(false);
const isOpen = ref(false);

const hasFormat = computed(() => typeof props.format === 'function'); 

const handleDown = (e: Event) => {
    console.log('down', e);

    autofocusCal.value = true;
    setTimeout(() => autofocusCal.value = false, 1)
}

// todo mask
function onlyNumbers(string: string) {
    return String(string).replace(/[^\d]/gi, '');
}
function fromLocaleDateString(dateString: string) { // todo parse 
    return (dateString && typeof(dateString) === 'string' && onlyNumbers(dateString).length === 8 && dateString.indexOf('.')) 
        ? new Date(dateString.split('.').reverse().join('-')) // is only ru
        : null;
}
function validDate(date: Date | null) {
    return date instanceof Date && !isNaN(date.getTime()) ? date : null;
}

watch(localeDateString, (newLocaleDateString) => {
    //if date
    const newDate = newLocaleDateString ? fromLocaleDateString(newLocaleDateString) : null;
    // console.warn('localeDateString', {newLocaleDateString, newDate});
    // if(newDate && /*calDate.value &&*/ calDate.value.toLocaleDateString() !== newLocaleDateString) {
    if(newDate && calDate.value?.toLocaleDateString() !== newLocaleDateString) {
        calDate.value = newDate;
        //
        // console.log('update:modelValue', newLocaleDateString)
        // emit('update:modelValue', newLocaleDateString)
    }
    else if(!newDate) emit('update:modelValue', null);// !
});

watch(calDate, (newCalDate) => {
    newCalDate = validDate(newCalDate);
    const newCalDateString = newCalDate ? newCalDate.toLocaleDateString() : '';
    // console.log('calDate', {newCalDate, newCalDateString});
    if(newCalDateString && localeDateString.value !== newCalDateString) {
        localeDateString.value = newCalDateString;

        emit('update:modelValue', (hasFormat.value ? props.format(newCalDate) : newCalDateString));
        // emit('update:modelValue', newCalDateString);
    }
});
</script>