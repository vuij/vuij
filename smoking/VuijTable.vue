<template>
  <table 
    class="v-table"
    :class="{ 'v-table--striped': striped, 'v-table--bordered': bordered }"
  >
    <thead class="v-table__header">
      <tr>
        <th
          v-for="(col, index) in columns"
          :key="col.key || index"
          :style="getColumnStyle(col)"
          @click="handleSort(col)"
          class="v-table__header-cell"
          :class="{ 'sortable': col.sortable }"
        >
          <slot :name="`header-${col.key}`" :column="col">
            {{ col.title }}
          </slot>
          <span v-if="col.sortable" class="v-table__sort-icon">
            {{ col.sortOrder === 'asc' ? '↑' : '↓' }}
          </span>
        </th>
      </tr>
    </thead>
    
    <tbody class="v-table__body">
      <tr
        v-for="row in data"
        :key="row[rowKey]"
        class="v-table__row"
        :class="{ 'v-table__row--selected': isRowSelected(row) }"
        @click="handleRowClick(row)"
      >
        <td
          v-for="(col, colIndex) in columns"
          :key="col.key || colIndex"
          :style="getColumnStyle(col)"
          class="v-table__cell"
        >
          <slot 
            :name="`cell-${col.key}`" 
            :row="row" 
            :value="row[col.key]"
            :column="col"
          >
            {{ formatCell(row[col.key], col) }}
          </slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    validator: cols => cols.every(c => 'key' in c && 'title' in c)
  },
  data: {
    type: Array,
    default: () => []
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  striped: Boolean,
  bordered: Boolean
})

const emit = defineEmits(['row-click', 'sort-change'])

const selectedRow = ref(null)

// Форматирование ячейки
const formatCell = (value, column) => {
  return column.formatter ? column.formatter(value) : value ?? '-'
}

// Обработчик сортировки
const handleSort = column => {
  if (!column.sortable) return
  const newOrder = column.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('sort-change', { column, order: newOrder })
}

// Стили для колонок
const getColumnStyle = col => ({
  width: col.width || 'auto',
  minWidth: col.minWidth || '100px',
  textAlign: col.align || 'left'
})

// Выделение строки
const isRowSelected = row => {
  return selectedRow.value?.[props.rowKey] === row[props.rowKey]
}

// Клик по строке
const handleRowClick = row => {
  selectedRow.value = row
  emit('row-click', row)
}
</script>

<style scoped>
.v-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.v-table__header {
  background: #fafafa;
}

.v-table__header-cell {
  padding: 12px;
  border-bottom: 2px solid #ddd;
  text-align: left;
  position: relative;
}

.v-table__header-cell.sortable {
  cursor: pointer;
  user-select: none;
}

.v-table__sort-icon {
  margin-left: 8px;
  font-size: 0.8em;
}

.v-table__row {
  transition: background 0.2s;
}

.v-table__row:hover {
  background: #f5f5f5;
}

.v-table__row--selected {
  background: #e3f2fd !important;
}

.v-table__cell {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

/* Модификаторы */
.v-table--striped .v-table__row:nth-child(even) {
  background: #f9f9f9;
}

.v-table--bordered .v-table__cell,
.v-table--bordered .v-table__header-cell {
  border: 1px solid #ddd;
}
</style>