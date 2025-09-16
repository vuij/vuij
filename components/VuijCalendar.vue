<template>
    <div v-if="calendar?.obj" class="vuij-calendar">
        <div class="vuij-calendar__main">
            <div class="vuij-calendar__header" tabindex="-1" @keydown="handleKeydown">
                <VuijAngle @click="toPrev" direction="left" class="vuij-calendar__angle vuij-calendar__angle_prev"/>
                <div class="vuij-calendar__header-inform">
                    <button class="vuij-button vuij-button_link vuij-calendar__cell vuij-calendar__cell_mn" @click="mode=mode==='m'?'d':'m'">{{ calendar.monthNames[calendarDate.getMonth()] }}</button>
                    <button class="vuij-button vuij-button_link vuij-calendar__cell vuij-calendar__cell_yn" @click="mode=mode==='y'?'d':'y'">{{ calendarDate.getFullYear() }}</button>
                </div>
                <VuijAngle @click="toNext" direction="right" class="vuij-calendar__angle vuij-calendar__angle_next"/>
            </div>

            <div v-show="mode==='y'" class="mode-y">
                <VuijListBox 
                    ref="yearsRef" 
                    :modelValue="yearIndex" 
                    :items="years" 
                    class="vuij-calendar__grid vuij-calendar__grid_year"
                    selectable
                    @change="yx => selectYear(years[yx].year)"
                >
                    <template #default="{item}">
                        <span 
                            class="vuij-calendar__cell vuij-calendar__cell_year" 
                            :class="{'vuij-calendar__cell_active': nowFullYear===item.year, 'vuij-calendar__cell_out': item.start||item.end}" 
                            @click="selectYear(item.year)" 
                        >
                            {{ item.year }}
                        </span>
                    </template>
                </VuijListBox>
            </div>
            <div v-show="mode==='m'" class="mode-m">
                <VuijListBox 
                    ref="monthsRef" 
                    :modelValue="monthIndex" 
                    loop 
                    :items="months" 
                    class="vuij-calendar__grid vuij-calendar__grid_month"
                    selectable
                    @change="mx => selectMonth(mx)"
                >
                    <template #default="{item, index}">
                        <span 
                            class="vuij-calendar__cell vuij-calendar__cell_month" 
                            :class="{'vuij-calendar__cell_active': nowMonth===index}" 
                            @click="selectMonth(index)"
                        >
                            {{ item.month }}
                        </span>
                    </template>
                </VuijListBox>
            </div>
            <div v-show="mode==='d'" class="mode-d">
                <div class="vuij-calendar__grid vuij-calendar__grid_wn">
                    <small class="vuij-calendar__cell vuij-calendar__cell_wn" v-for="wn in calendar.weekNames" :key="wn">
                        {{ wn }}
                    </small>
                </div>
                <VuijListBox 
                    ref="daysRef" 
                    :modelValue="dateIndex" 
                    :items="calendar.obj" 
                    class="vuij-calendar__grid vuij-calendar__grid_day" 
                    selectable
                    @change="dx => selectDate(calendar.obj[dx].date)"
                >
                    <template #default="{item}">
                        <div 
                            class="vuij-calendar__cell vuij-calendar__cell_day" 
                            :class="{'vuij-calendar__cell_active': item.today, 'vuij-calendar__cell_out': item.out}" 
                        >
                            <slot :item="item">
                                <div 
                                    class="vuij-calendar__day" 
                                    @click="selectDate(item.date)"
                                >
                                    {{ item.d }}
                                </div>
                            </slot>
                        </div>
                    </template>
                </VuijListBox>
            </div>
        </div>
        <!-- <div v-if="$slots.bar || time" class="vuij-calendar__bar" :class="{'vuij-calendar__bar_has-time': time}">
            <VuijTime/>
        </div> -->
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import VuijAngle from './VuijAngle.vue';
import VuijListBox from './VuijListBox.vue';
// import VuijTime from './VuijTime.vue';
import { Datej } from '../utils/datej.js';

// const nowMoonUTC = (new Date((new Date()).setUTCHours(0)));//Timej
const nowMoonUTC = (new Datej()).setUTCHour(0);//Timej

// const nowDate = nowMoonUTC.getDate();
const nowMonth = nowMoonUTC.getMonth();
const nowFullYear = nowMoonUTC.getFullYear();

const props = defineProps({
    modelValue: [Date, null],
    lang: String,
    autofocus: Boolean,
    //min,max,range[from,to]
    time: {
        type: Boolean,
        default: !false
    }
})

function isValidDate(date: any) {
    return date instanceof Date && !isNaN(date.getTime()); // date.toString()!=='Invalid Date' 
}
function validDate(date: any) {
    date = date ? (new Date((new Date(date)).setUTCHours(0))) : null;
    return isValidDate(date) ? date : null;
}
function dateToShort(date?: Date) {
    return isValidDate(date) ? date.toJSON().split('T').shift() : '';
}


const initMoonUTC = props.modelValue && isValidDate(new Date(props.modelValue))
    ? (new Date((new Date(props.modelValue)).setUTCHours(0))) 
    : nowMoonUTC;

const mode = ref('d');//m|y
const calendarDate = ref(initMoonUTC);

const calendar = computed(() => {
    const date = calendarDate.value instanceof Date ? calendarDate.value : nowMoonUTC,
        [y,m,d] = dateToShort(date)?.split('-')?.map(Number) ?? [nowFullYear, nowMonth, nowMoonUTC.getDate()]; // ?? for ts
        
    return Datej.getCalendarObject(y,m-1,d,props.lang??'ru');
});

const listRef = computed(() => (mode.value === 'y') ? yearsRef.value?.listRef : ((mode.value === 'm') ? monthsRef.value?.listRef : daysRef.value?.listRef));

const year = computed(() => calendarDate.value.getFullYear());
const years = computed(() => {
    const y = year.value, 
        yl = 12, // 30
        ys = Array.from(Array(yl).keys(), (x) => x + y - y%10 - 1);
    return ys.map((year, yx) => ({year, start: !yx, end: yx===ys.length-1}));
});
const yearIndex = computed(() => years.value.findIndex(y => y.year === year.value));
const yearsRef = useTemplateRef('yearsRef');

const month = computed(() => calendarDate.value.getMonth());
const months = computed(() => calendar.value.monthNames.map(month => ({month})));
const monthIndex = computed(() => month.value);
const monthsRef = useTemplateRef('monthsRef');

const dateIndex = computed(() => calendar.value.obj.findIndex(d => dateToShort(d.date)===dateToShort(calendarDate.value)));
const daysRef = useTemplateRef('daysRef');

const selectYear = (year: number, stay = undefined) => {
    formatLocalValue(new Date(calendarDate.value.setFullYear(year)));
    if(!stay) mode.value = 'd';
}
const selectMonth = (mn: number, stay = undefined) => {
    formatLocalValue(new Date(calendarDate.value.setMonth(mn)));
    if(!stay) mode.value = 'd';
}
const selectDate = (date: Date) => {
    formatLocalValue(date);
    emit('select', date);
}
const formatLocalValue = (date: any) => { //, act)
    date = validDate(date);

    calendarDate.value = date;////////////////////
    localValue.value = date;
    emit('update:modelValue', localValue.value);    
}

const toStep = (add = 0) => {

    if(mode.value === 'y') {
        // calendarDate.value = new Date(calendarDate.value.setFullYear(years.value?.at(add < 0 ? 1 : -1)?.year+add));
        calendarDate.value = new Date(calendarDate.value.setFullYear(year.value+(add)*(years.value.length-2)));
    }
    else if(mode.value === 'm') {
        calendarDate.value = new Date(calendarDate.value.setFullYear(year.value+add));
    }
    else {
        // calendarDate.value = new Date(calendarDate.value.setDate(calendarDate.value.getDate()+add));
        calendarDate.value = new Date(calendarDate.value.setMonth(month.value+add));
    }
}
const toPrev = () => toStep(-1);
const toNext = () => toStep(+1);

const handleKeydown = (e: KeyboardEvent) => {
    // console.log(e.code);
    if(['ArrowLeft','ArrowRight'].includes(e.code)) {
        toStep(e.code==='ArrowLeft'?-1:+1);
    }
    if(['KeyD','KeyM','KeyY'].includes(e.code)) {
        mode.value = e.code.slice(-1).toLowerCase();
    }
}

const emit = defineEmits(['update:modelValue', 'select', 'flip']);
const localValue = ref();

// Наблюдатели
watch(
    () => props.modelValue, 
    mv => {
        if(localValue.value !== mv) {
            localValue.value = mv ? validDate(mv) : null;
            // formatLocalValue(mv);
        }
    }, 
    { immediate: true }
);

watch(mode, _mode => {
    if(!'dmy'.split('').includes(_mode)) mode.value = 'd';
    //
    nextTick(()=>{
        listRef.value?.focus();
    });
});

watch(() => calendar.value, (n, o) => {
    if(n?.first?.toJSON()!==o?.first?.toJSON()) emit('flip', calendar.value);
}, { immediate: true });

watch(
    () => props.autofocus, 
    af => {
        if(af) {
            if(mode.value === 'd') daysRef.value?.listRef?.focus();
            else mode.value = 'd';
        }
    }, 
    { immediate: true }
);
</script>