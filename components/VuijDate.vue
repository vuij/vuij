<template>
    <VuijInputPop 
        ref="dateRef" 
        filterable 
        v-model="localeDateString"
        v-bind="$attrs" 
        pattern="\d{2,2}.\d{2,2}.\d{4,4}" 
        :placeholder="placeholder" 
        :maxlength="placeholder.length" 
        :opened="isOpen" 
        @toggle="opened => isOpen=!!opened" 
        @focus="isOpen=true" 
        @down="handleDown" 
        icon-right
    >
        <template #icon>
            <span class="vuij-icon" @click="dateRef?.inpRef?.inputRef?.input?.focus()">
                <Calendar/>
            </span>
            <input v-if="name" type="hidden" :name="name" :value="formatValue(calDate)"/>
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

import { Datej } from '../utils/datej.js';

import VuijInputPop from './VuijInputPop.vue';
import VuijCalendar from './VuijCalendar.vue';
import Calendar from '../svg/Calendar.vue';

// const props = defineProps(['modelValue', 'name', 'format']);// locale
const props = defineProps({
    modelValue: [Date, String, null],
    name: String,
    locale: {
        type: String,
        default: 'ru-RU'
    },
    //format: Function
})
const emit = defineEmits(['update:modelValue']);

const dateRef = useTemplateRef('dateRef');
// defineExpose({dateRef}); // to use in parent

const placeholder = Datej.getPlaceholder(props.locale);

const localeDateString = ref(fromLocaleDateString(props.modelValue)?.toLocaleDateString() ?? ''); 
// const calDate = ref<Date|null>(new Date); 
const calDate = ref<Date|Datej|null>(null); 

const autofocusCal = ref(false);
const isOpen = ref(false);

// const hasFormat = computed(() => typeof props.format === 'function'); 

function dateToShort(date?: Date) {
    return date instanceof Date ? date.toJSON().split('T').shift() : '';
}
const formatValue = (date) => {
    return dateToShort(date);
}

const handleDown = (e: Event) => {
    // console.log('down', e);

    autofocusCal.value = true;
    setTimeout(() => autofocusCal.value = false, 1)
}

// todo mask
// function onlyNumbers(string: string) {
//     return String(string).replace(/[^\d]/gi, '');
// }

function fromLocaleDateString(dateString: string, locale) {
    return validDate(Datej.parseDateTime(dateString, locale));
}

function validDate(date: Date | null) {
    return date instanceof Date && !isNaN(date.getTime()) ? date : null;
}

watch(localeDateString, (newLocaleDateString) => {
    const newDate = newLocaleDateString 
        ? fromLocaleDateString(newLocaleDateString, props.locale) 
        : null;

    // console.log('localeDateString', {newDate, newLocaleDateString}, props.modelValue);
    // console.log('localeDateString', newLocaleDateString, newDate?.toJSON());
    
    if(newDate && calDate.value?.toLocaleDateString() !== newLocaleDateString) {
        calDate.value = newDate;
    }
    else if(!newDate) emit('update:modelValue', null);// !
}, {immediate: true});

watch(calDate, (newCalDate) => {
    newCalDate = validDate(newCalDate);
    const newCalDateString = newCalDate ? newCalDate.toLocaleDateString() : '';

    // console.log('calDate', {newCalDate, newCalDateString});

    if(newCalDateString && localeDateString.value !== newCalDateString) {
        localeDateString.value = newCalDateString;

        // emit('update:modelValue', (hasFormat.value ? props.format(newCalDate) : newCalDateString));
        emit('update:modelValue', newCalDate);
        // emit('update:modelValue', newCalDateString);
    }
});
</script>