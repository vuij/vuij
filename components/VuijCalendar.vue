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

function getWeekStart(lang: string) {
    /**  also see https://gist.github.com/mlconnor/1887156  */
    /**  also see https://en.wikipedia.org/wiki/Date_format_by_country  */
    /**  also see https://dev.1c-bitrix.ru/api_help/main/general/lang/format.php  */
    /**  also see https://github.com/jerryurenaa/language-list/blob/main/language-list-json.json  */
    /**  need to check it! */
    const parts = String(lang).match(/^([a-z]{2,3})(?:-([a-z]{3})(?=$|-))?(?:-([a-z]{4})(?=$|-))?(?:-([a-z]{2}|\d{3})(?=$|-))?/i),
          rgn = parts?.[4],
          lng = parts?.[1] ?? '',
          rgnSat = ['AE','AF','BH','DJ','DZ','EG','IQ','IR','JO','KW','LY','OM','QA','SD','SY'],
          rgnSun = ['AG','AR','AS','AU','BD','BR','BS','BT','BW','BZ','CA','CN','CO','DM','DO','ET','GT','GU','HK','HN',
                    'ID','IL','IN','JM','JP','KE','KH','KR','LA','MH','MM','MO','MT','MX','MZ','NI','NP','PA','PE','PH','PK',
                    'PR','PT','PY','SA','SG','SV','TH','TT','TW','UM','US','VE','VI','WS','YE','ZA','ZW'],
          lngSat = ['ar','arq','arz','fa'],
          lngSun = ['am','as','bn','dz','en','gn','gu','he','hi','id','ja','jv','km','kn','ko','lo','mh','ml','mr','mt','my',
                    'ne','om','or','pa','ps','sd','sm','sn','su','ta','te','th','tn','ur','zh','zu'];
    /* first day in week: 0 - sun, 1 - mon, 2 - sat */
    return rgn ? ( rgnSun.includes(rgn) ? 0 : rgnSat.includes(rgn) ? 2 : 1 ) 
               : ( lngSun.includes(lng) ? 0 : lngSat.includes(lng) ? 2 : 1 );
}
function getCalendarObject(y: number, m: number, d: number, lang: string) {
    const now = new Date(), nowY = now.getFullYear(), nowM = now.getMonth(), nowD = now.getDate();
    y = y ?? nowY;
    m = m ?? nowM;
    d = d ?? nowD;
        // lang = document.head.parentElement.lang || navigator.language, //config
    const _arr = (n: number) => ([...Array(n).keys()]),
        _utc = (y: number, m = 0, d = 1) => new Date(Date.UTC(y, m, d)),
        _iso = (utc: Date) => utc.toJSON(),
        _ymd = (utc: Date) => _iso(utc).slice(0, 10),
        _F = (dt: Date, o: object) => new Intl.DateTimeFormat(lang, o).format(dt),
        first = _utc(y, m, 1),
        lastDt = _utc(y, m+1, 0).getDate(),
        weekStart = getWeekStart(lang), //config
        week = weekStart > 1 ? [6,0,1,2,3,4,5] : (weekStart > 0 ? [1,2,3,4,5,6,0] : [0,1,2,3,4,5,6]),
        fdIx = week.indexOf(first.getDay()),
        weekNames = [...week.keys()].map(x => _F(_utc(y, m, (x + 8 - fdIx)), { weekday: 'short' })),
        monthNames = [...Array(12).keys()].map(_m => _F(_utc(y, _m), { month: "long" }));
    let obj = [],
        calArr = _arr(fdIx).reverse().map(x => 0-x).concat(_arr(lastDt).map(x => x+1));

    calArr = calArr.concat(_arr(42-calArr.length).map(x => lastDt+x+1));
    obj = [...calArr].map((_d) => {
        const utc = _utc(y, m, _d);
        return {
                date: utc,
                d: utc.getDate(),
                w: _F(utc, { weekday: 'short' }),
                // f: _F(utc),/**@todo format by lang/cnfg? */
                // ymd: _ymd(utc),
                iso: _iso(utc),
                // today: (_d===nowD && m===nowM && y===nowY),
                utcMoon: (new Date(utc.setUTCHours(0,0,0,0))).toJSON(),
                nowMoon: (new Date(now.setUTCHours(0,0,0,0))).toJSON(),
                today: (utc.setUTCHours(0,0,0,0)===now.setUTCHours(0,0,0,0)),
                past: utc<now,
                future: utc>now,
                active: _d===d,
                out: _d < 1 ? -1 : (_d > lastDt ? 1 : 0),
            };
    });

    return {
        obj,
        monthNames,
        weekNames, 
        first, 
        _ymd, 
        lang,
    };

}

const nowMoonUTC = (new Date((new Date()).setUTCHours(0)));//Timej

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

function validDate(date: any) {
    // console.warn('---->', {date});
    date = date ? (new Date((new Date(date)).setUTCHours(0))) : null;
    return date instanceof Date && !isNaN(date.getTime()) ? date : null;
}
function dateToShort(date?: Date) {
    // return date.toJSON().slice(0,10)
    return date instanceof Date ? date.toJSON().split('T').shift() : '';
}


const initMoonUTC = props.modelValue && (new Date(props.modelValue)).toString()!=='Invalid Date' 
    ? (new Date((new Date(props.modelValue)).setUTCHours(0))) 
    : nowMoonUTC;

const mode = ref('d');//m|y
const calendarDate = ref(initMoonUTC);

const calendar = computed(() => {
    const date = calendarDate.value instanceof Date ? calendarDate.value : nowMoonUTC,
        [y,m,d] = dateToShort(date)?.split('-')?.map(Number) ?? [nowFullYear, nowMonth, nowMoonUTC.getDate()]; // ?? for ts
        
    return getCalendarObject(y,m-1,d,props.lang??'ru');
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