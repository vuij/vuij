<template>
    <nav v-if="menu || $slots.prepend || $slots.append">
        <slot name="prepend"></slot>
        <RouterLink 
            v-for="(route, rx) in router.getRoutes().filter(r => r.meta.menu===menu)" 
            :to="route"
            custom 
            v-slot="{href, isActive, navigate}" 
            :key="'vuij_route_'+rx"
        >
            <slot v-bind="{rx, route, href, isActive, navigate}">
                <a :href="href" @click="navigate" class="vuij-link" :class="{isActive}">
                    {{ route.name }}
                </a>
            </slot>
        </RouterLink>
        <slot name="append"></slot>
    </nav>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

defineProps({menu: String});

const router = useRouter();
</script>