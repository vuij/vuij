<template>
    <teleport v-if="notifies.length" :to="'body'">
        <transition-group name="vuij-notifies" tag="div" class="vuij-notifies" v-bind="$attrs">
            <VuijNotify v-for="(n,nx) in notifies" 
                            :notice="n" 
                            :key="'notice_'+nx" 
                            @close="close" 
            >
            </VuijNotify>
        </transition-group>
    </teleport>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import VuijNotify from './VuijNotify.vue';
import { NoticeSchema } from "../utils/notice.js"; 

type NoticeT = typeof NoticeSchema;

const props = defineProps({ notifies: Array<NoticeT> });
const notifies = ref<Array<NoticeT>>([]);

const push = (_notifies: Array<NoticeT>) => Array.isArray(_notifies) ? notifies.value = [...notifies.value].concat(_notifies) : void(0);
// const push = (_notifies: Array<NoticeT>) => Array.isArray(_notifies) ? notifies.value.splice(-1, 0, ..._notifies) : void(0);
const close = c => notifies.value.splice(notifies.value.findIndex(n => c === n), 1);

watch(() => props.notifies, push, { immediate: true, deep: true });
</script>
