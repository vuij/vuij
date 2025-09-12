<template>
    <VuijInputPop 
        :label="label"
        ref="inpPopRef" 
        type="search" 
        v-model="searchValue"
        v-bind="$attrs"  
        :readonly="!filterable" 
        class="vuij-select" 
        ctrlClass="vuij-ctrl_select vuij-ctrl_input" 
        :opened="isOpen" 
        @toggle="opened => isOpen=!!opened" 
        @focusin="handleFocusin" 
        @down="handleDown" 
        @input="handleInput" 
    >

        <template v-if="$slots.prepend" #prepend>
            <slot name="prepend"></slot>
        </template>

        <template #stretch>
            <template v-if="name">
                <template v-if="localValue">
                    <template v-if="!!multiple">
                        <input v-for="(value, index) in localValue" :key="'hidden_value_'+value" :name="multipleName(index, value)" type="hidden" :value="value" data-m/>
                    </template>
                    <input v-else type="hidden" :name="name" :value="localValue" data-n/>
                </template>
                <input v-else type="hidden" :name="name"/>
            </template>

            <template v-if="tagged">
                <VuijTags :tags="selectedOptions" :skimp="skimp" :normalize="false" @close="(e: Event, tag: OptionItem) => handleTagClose(tag)">
                    <template #default="tagSlotProps">
                        <slot name="tag" v-bind="tagSlotProps">{{ tagSlotProps.label }}</slot>
                    </template>
                </VuijTags>
            </template>
        </template>

        <template #default>
            <div class="vuij-card vuij-card_mystic vuij-card_options">
                <VuijLoading>
                    <template v-if="!loading">
                        <slot v-if="!localOptions?.length" name="nodata">
                            <div>{{ noData }}</div>
                        </slot>
                        <VuijOptions 
                            v-else 
                            v-model="localValue" 
                            v-bind="$props" 
                            :multiple="!!multiple" 
                            :options="localOptions" 
                            :autofocus="autofocus" 
                            @update:model-value="v => isOpen = !v || !!multiple"
                            hidechecks
                        >
                            <!-- slot nooption -->
                            <template v-if="$slots.default" #default="optionSlotProps">
                                <slot name="default" v-bind="optionSlotProps">
                                    <span class="vuij-label__text">{{ optionSlotProps.item.label }}</span>
                                </slot>
                            </template>
                        </VuijOptions>
                    </template>
                </VuijLoading>
            </div>
        </template>

        <template v-if="$slots.append" #append>
            <slot name="append"></slot>
        </template>
        
    </VuijInputPop>
</template>

<script lang="ts" setup>
import { computed, PropType, ref, useTemplateRef, watch } from 'vue';

import VuijInputPop from './/VuijInputPop.vue';
import VuijLoading from './VuijLoading.vue';
import VuijOptions from './VuijOptions.vue';
import VuijTags from './VuijTags.vue';

type OptionItem = {
    label: string
    value: string | number | boolean
}

const props = defineProps({
    modelValue: {
        type: [Array, String, Number, Boolean, null] as PropType<
            Array<string | number | boolean> | string | number | boolean | null
        >,
        default: () => null
    },
    label: {
        type: String,
    },
    name: {
        type: String,
    },
    // form: {
    //     type: String,
    // },
    options: {
        type: Array as PropType<Array<OptionItem | string | number | boolean>>,
        // required: true,
        default: () => ([])
    },
    //frizedOptions ?
    labelKey: {
        type: String,
        default: 'label'
    },
    valueKey: {
        type: String,
        default: 'value'
    },
    noData: {
        type: String,
        default: 'No Data'
    },
    multiple: {
        type: [Boolean, String],
        default: false
    },
    // disabled: Boolean,
    // filterable: Boolean,
    filterable: {
        type: Boolean,
        default: !true
    },
    loop: {
        type: Boolean,
        default: true
    },
    // required, min, max
    tagged: Boolean,
    skimp: {
        type: Number,
        default: 8,//1,//NaN,
    },
    // 
    remoteSearch: {
        type: Function,
    },
})

const inpPopRef = useTemplateRef('inpPopRef');
// defineExpose({inpPopRef}); // to use in parent

const autofocus = ref(false);
const searchValue = ref('');
const loading = ref(false);
const isOpen = ref(false);

const selectedOptions = computed<OptionItem[]|any[]>(() => initedOptions.value.filter((o: any) => [localValue.value].flatMap(v=>v).includes(o?.[props.valueKey]))); //o.value
const selectedLabel = computed(() => selectedOptions.value?.map(o => o.label)?.join(', '));

const handleTagClose = (tag: OptionItem) => {
    if(!!props.multiple) {
        localValue.value = localValue.value.filter((v: string|number) => String(v)!==String(tag.value));
    }
    else localValue.value = undefined;
}

const tryInputFocus = () => {
    return (inpPopRef.value?.inpRef?.inputRef?.input as HTMLInputElement)?.focus();
}

const handleTagsClickSelf = (/*e: PointerEvent*/) => {
    tryInputFocus();
}

const multipleName = (index, value) => {
    let name = props.name;
    // console.warn(props.multiple);
    if(name && !!props.multiple && (typeof props.multiple === 'string')) { // ? // && name.indexOf('[')===-1 
        // name = name.split('[').shift();
        const key = (props.multiple === 'index' ? index : (props.multiple === 'value' ? value : ''));
        name = name + `[${key ?? ''}]`;
    }
    return name;
}

const setLocalValues = async (options?: Array<any>) => {
    const remoteSearch = typeof(props.remoteSearch) === 'function' ? props.remoteSearch : null,
        isAsync = remoteSearch && remoteSearch.constructor.name === 'AsyncFunction';

    if(remoteSearch) {
        loading.value = true;
        localOptions.value = [];

        // надо дебонсить и отменять fetch? или в родителе?
        let fetchedOptions = isAsync ? await remoteSearch(searchValue.value) : remoteSearch(searchValue.value); //,options) // normalize? // .map(item => normalizer(item, props.labelKey, props.valueKey));
 
        const firstInitOptions = Array.isArray(options) && options.length ? options : null;
        if(firstInitOptions) {
            fetchedOptions = fetchedOptions.concat(firstInitOptions); //TODO unique
            // console.log({fetchedOptions}, {firstInitOptions});
            //
        }

        localOptions.value = fetchedOptions ?? [];
        initedOptions.value = fetchedOptions ?? [];

        if(firstInitOptions && localValue.value) {
            // console.warn({firstInitOptions}, localValue.value);
            //
            searchValue.value = selectedLabel.value;
        }

        loading.value = false;
    }
    else {
        //  //if filterable
        const findLowerCase = (haystack = '', niddle = '', startsWith = false) => !niddle ? !!String(haystack) : (haystack && (!startsWith ? String(haystack).toLowerCase().indexOf(niddle?.toLowerCase())>-1 : !String(haystack).toLowerCase().indexOf(niddle?.toLowerCase())));
        const filterOptions = (option: any = {}, q = '') => option?.[props.labelKey]!==undefined 
            && (!props.filterable || (findLowerCase(option?.[props.labelKey], q) || findLowerCase(option?.[props.valueKey], q?.trim()))); //o.value

        localOptions.value = initedOptions.value.filter(option => filterOptions(option, searchValue.value));
    }
}

const emit = defineEmits(['update:modelValue', 'input', 'focusin'])

const handleInput = async (e: InputEvent) => {
    // console.log('Select:handleInput', (e.target as HTMLInputElement)?.value);
    //
    searchValue.value = (e.target as HTMLInputElement)?.value;
    //
    if(searchValue.value !== selectedLabel.value) {
        localValue.value = null;
        /////
    }
    
    //
    emit('input', e);
    await setLocalValues();
}

const handleDown = (/*e: KeyboardEvent*/) => {
    autofocus.value = true;
    setTimeout(() => autofocus.value = false, 1);
}
const handleFocusin = (e: FocusEvent) => {
    if(!props.filterable) { // or autoopen ?
        isOpen.value = true;
        setTimeout(() => autofocus.value = true, 0);
        setTimeout(() => autofocus.value = false, 1);
    }
    emit('focusin', e);
}

const localValue = ref();
const localOptions = ref<OptionItem[]>([]);
const initedOptions = ref<OptionItem[]>([]);

// Нормализация опций
const normalizer = (item: any, labelKey: string, valueKey: string|number) => (typeof item === 'object' && item !== null) // import utils
    ? { ...item, label: item[labelKey]?.toString() || '', value: item[valueKey], foo: 'bar' } 
    : { label: String(item), value: item };
const normalizeOptions = () => {
    // console.log('normalizeOptions?', [...props.options]);
    initedOptions.value = (props.options ?? []).map(item => normalizer(item, props.labelKey, props.valueKey));
    setLocalValues(initedOptions.value);
}
// Нормализация modelValue
const normalizeModelValue = () => {
    localValue.value = (!!props.multiple) 
        ? (Array.isArray(props.modelValue)
                ? props.modelValue
                : (props.modelValue !== undefined && props.modelValue !== null
                    ? [props.modelValue]
                    : []))
        : (Array.isArray(props.modelValue)
            ? props.modelValue[0] || null
            : props.modelValue);
}

// Наблюдатели
watch(() => props.modelValue, normalizeModelValue, { immediate: true });
watch(() => props.options, normalizeOptions, { immediate: true });
watch(() => props.multiple, () => {
    emit('update:modelValue', props.multiple ? [] : null)
})
watch(localValue, () => {
    // console.log('Select:watch:localValue', localValue.value, props.tagged, selectedLabel.value);
    ///
    ///
    if(!props.tagged) searchValue.value = selectedLabel.value;
    emit('update:modelValue', localValue.value);

    // setTimeout(() => {
    //     console.warn('Select:watch:localValue:setTimeout:tryInputFocus', localValue.value);
    //     tryInputFocus();// это закрывает попап только клавишей, и курсор в конце
    // }, 88)

}, { immediate: true })
</script>