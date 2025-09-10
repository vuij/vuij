<template>
    <section>
        <slot name="title">
            <h1 v-if="title" class="vuij-h1">{{ title }}</h1>
        </slot>

        <div>
            <slot></slot>
        </div>

        <div>
            <h3 class="vuij-h3">🐟 Fish.</h3>
            <div class="skeleton">
                <p v-for="n in 50" :key="'fish_p_'+n">Жил-был у бабушки серенький козлик, бабушка козлика очень любила, 1-2-3 в супе сварила!..</p>
            </div>
        </div>

    </section>
</template>

<script lang="ts" setup>
defineProps({title: String})
</script>