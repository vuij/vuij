<template>
    <table ref="tableRef" class="vuij-table">
        <thead>
            <tr v-if="selectable/* && $slots.mass */" style="position: sticky;top:0;background-color: canvas;">
                <th :style="assistantTDStyle"></th>
                <th :colspan="colspan-1">
                    <div :hidden="!selectedArr.length">mass actions ({{ selectedArr.length ?? 0 }})</div>
                </th>
            </tr>
            <tr>
                <th v-if="tree || selectable" :style="assistantTDStyle">
                    <!-- slot! -->
                    <!-- span wrap checkbox! -->
                    <input v-if="selectable" type="checkbox" :indeterminate="isSelectedAll" :checked="isSelectedAll" @change="e => toggleAllSelected((e.target as HTMLInputElement)?.checked)"/>
                </th>
                <th v-for="(col, index) in columns" :key="col.key || index" @click="handleSort(col)"
                    :class="{ 'sortable': col.sortable }">
                    <slot :name="`header-${col.key}`" :column="col" :handleSort="handleSort">
                        {{ col.title }}
                    </slot>
                    <!-- slot! -->
                    <span v-if="col.sortable" class="vuij-table__sorter" :class="{'vuij-table__sorter_by': col.key === sortKey, [`vuij-table__sorter_order_${col.sortOrder}`]: col.key === sortKey}">
                        {{ col.key === sortKey ? (col.sortOrder === 'asc' ? '↑' : '↓') : '↕' }}
                    </span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr v-if="!rows?.length">
                <td :colspan="colspan">
                    <VuijLoading>
                        <!-- slot! -->
                        <!-- props.NoDataText! -->
                        <p v-if="Array.isArray(rows)">Нет данных</p>
                    </VuijLoading>
                </td>
            </tr>
            <template v-for="(row, rowIx) in rows" :key="row.id">
                <!-- Родительская строка -->
                <tr :class="['vuij-table__row', { expanded: expandedRows.has(row.id) }, rowClass(row)]" @click="handleRowClick(row)" @dblclick="handleRowDblclick(row)">
                    <td v-if="tree || selectable" :style="assistantTDStyle">
                        <!-- slot! -->
                        <!-- span wrap checkbox! -->
                        <input v-if="selectable" type="checkbox" :value="row.id" v-model="selectedArr" />
                        
                        <!-- slot! -->
                        <VuijAngle 
                            v-if="tree && !!row?.children?.length" 
                            @click.stop="toggleRow(row)" 
                            :direction="expandedRows.has(row.id)?'bottom':'right'" 
                            :loading="loadingRows.has(row.id)" 
                            class="vuij-table__expander"
                        />

                    </td>
                    <td v-for="(col, colIx) in columns" :key="col.key">
                        <slot :name="`cell-${col.key}`" :row="row" :rowIx="rowIx" :column="col" :colIx="colIx">
                            {{ row[col.key] }}
                        </slot>
                    </td>
                </tr>

                <!-- Дочерние строки -->
                <tr v-show="expandedRows.has(row.id)/* && tree && hasChildren(row)*/" v-for="(child, childIx) in row.children"
                    :key="child.id" class="vuij-table__child-row" :class="rowClass(child)" @click="handleRowClick(child)">
                    <td :style="assistantTDStyle">
                        <input v-if="selectable" type="checkbox" :value="child.id" v-model="selectedArr"/>
                    </td>
                    <td v-for="(col, colIx) in columns" :key="col.key">
                        <slot :name="`cell-${col.key}`" :row="child" :rowIx="childIx" :parentRow="row" :parentRowIx="rowIx" :column="col" :colIx="colIx">
                            {{ child[col.key] }}
                        </slot>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { computed, ref, /*onMounted, useTemplateRef*/ } from 'vue';
import VuijLoading from './VuijLoading.vue';
import VuijAngle from './VuijAngle.vue';

const props = withDefaults(defineProps<{
    columns: Array<{ key: string; title: string; sortable?: boolean; sortOrder?: string; }>
    rows?: Array<{
        id: string | number
        [key: string]: any
        children?: Array<any>
    }>
    tree?: boolean
    selectable?: boolean // selected array?
    sortKey?: string
    loadChildren?: (row: any) => Promise<any[]>
    rowClass?: (row: any) => string
}>(),{
    rowClass: () => ''
})

const emit = defineEmits(['row-click', 'row-dblclick', 'select-change', 'sort-change'])


// Обработчик сортировки
const handleSort = (column: {key: string, sortable?: boolean, sortOrder?: string}) => {
    if (!column?.sortable) return;

    if(!column?.sortOrder) column.sortOrder = 'asc'; // todo props.orderKey
    emit('sort-change', column.key, column.sortOrder);
    column.sortOrder = column.sortOrder === 'asc' ? 'desc' : 'asc';
}
// Клик по строке
const handleRowClick = async (row: object) => {
    emit('row-click', row);
}
// Клик по строке
const handleRowDblclick = async (row: object) => {
    emit('row-dblclick', row);
}

// Наборы
const loadingRows = ref<Set<string | number>>(new Set())
const expandedRows = ref<Set<string | number>>(new Set())
const selectedRows = ref<Set<string | number>>(new Set()) // selectedSet?
const selectedArr = computed({
    get: () => [...selectedRows.value],
    set: (selectedIDs) => {
        selectedRows.value = new Set(selectedIDs);
        emit('select-change', selectedArr.value);
    },
})
const isSelectedAll = computed(() => selectedArr.value.length===props.rows?.length);
const toggleAllSelected = (selectAll: boolean) => {
    if(isSelectedAll.value===selectAll) return;//
    selectedArr.value = selectAll && Array.isArray(props?.rows) ? props.rows.map(r => r.id) : [];
};
const colspan = computed(() => props.columns.length + Number(props.tree||props.selectable));
const assistantTDStyle = computed(() => /*props.assistantStyle*/'width: 2.5rem;');
//hasAssistant, isSelectable

// Проверка наличия дочерних элементов
const withChildren = (row: any) => {
    return Array.isArray(row.children)
}
const hasChildren = (row: any) => {
    return withChildren(row) && row.children.length > 0;
}

// Переключение видимости дочерних строк
const toggleRow = async (row: any) => {
    if (!row?.id) return;

    // динамическая загрузка
    if (withChildren(row) && !hasChildren(row) && typeof (props.loadChildren) === 'function') {
        loadingRows.value.add(row.id);
        row.children = await props.loadChildren(row);
        loadingRows.value.delete(row.id)
    }

    expandedRows.value[expandedRows.value.has(row.id)?'delete':'add'](row.id);
}

// const tableRef = useTemplateRef('tableRef');
</script>

<style scoped>
button {
    background: none;
    border: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
    font-size: 16px;
}
</style>