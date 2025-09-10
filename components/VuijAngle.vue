<template>
    <button v-bind="$attrs" class="vuij-angle" :class="`vuij-angle_${direction}`">
        <VuijLoading>
            <AngleBracket v-if="!loading" :style="`--rotate-deg: ${rotateDeg};`"/>
        </VuijLoading>
    </button>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import AngleBracket from '../svg/AngleBracket.vue';
import VuijLoading from './VuijLoading.vue';

const directionAngles: Record<string, string> = {
    "top": "-.25turn",
    "right": "0turn",
    "bottom": ".25turn",
    "left": ".5turn",
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const directions = Object.keys(directionAngles);
type Direction = typeof directions[number];


const props = withDefaults(defineProps<{
    direction?: Direction
    loading?: boolean
  }>(), {
    direction: 'right',
    loading: false,
  });

const rotateDeg = computed<string>(():string => directionAngles[props.direction])
</script>