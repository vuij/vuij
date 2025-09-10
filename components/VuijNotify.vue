<template>
    <div v-if="notice" 
        :class="[
            {
                'vuij-notify_nobody': !notice.body, 
                'vuij-notify_iconed': !!notice.icon,
                'vuij-notify_persistent': !!notice.data?.persistent,
            }, 
            'vuij-notify_'+(notice.data?.level??'info'), 
            'vuij-notify'
        ]" 
    >
        <div v-if="notice.icon" class="vuij-notify__icon">
            <!-- TODO isComponent || instanceof SVGElement -->
            <img :src="notice.icon">
        </div>

        <div class="vuij-notify__text">
            <h3 v-if="notice.title" class="vuij-h3 vuij-notify__title">
                {{ notice.title }}
            </h3>
            <a v-if="notice.data?.url" :href="notice.data.url" class="vuij-notify__body">
                {{ notice.body }}
            </a>
            <p v-else class="vuij-notify__body">
                {{ notice.body }}
            </p>
            
        </div>
        <button v-if="!notice.data?.persistent" class="vuij-notify__close vuij-close" @click="$emit('close', notice)"></button>
    </div>
</template>


<script lang="ts" setup>
import { watch } from 'vue';

const props = defineProps({ notice: { type: Object } });
const emit = defineEmits(['close']);

const autoclose = (notice: any) => {
    if(notice && !isNaN(notice.data?.delay) && notice.data.delay>0) { // requireInteraction
        setTimeout(()=>{
            console.log('before close notice', {notice});
            emit('close', notice);
        }, notice.data.delay<1000 ? notice.data.delay*1000 : notice.data.delay);//
    }
};

watch(() => props.notice, (notice) => autoclose(notice), { immediate: true });
</script>