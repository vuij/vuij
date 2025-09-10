<template>
  <div class="v-table" :class="{ 'striped': striped, 'bordered': bordered }">
    <!-- Заголовок таблицы -->
    <div class="v-table-header" ref="headerRef">
      <div 
        v-for="(col, index) in columns" 
        :key="col.key || index"
        class="v-table-col"
        :style="getColumnStyle(col)"
        @click="handleSort(col)"
      >
        <slot :name="`header-${col.key}`" :column="col">
          {{ col.title }}
        </slot>
        <span v-if="col.sortable" class="sort-icon">
          {{ col.sortOrder === 'asc' ? '↑' : '↓' }}
        </span>
      </div>
    </div>

    <!-- Тело таблицы с виртуализацией -->
    <div class="v-table-body" ref="bodyRef" @scroll="handleScroll">
      <div class="v-table-content" :style="contentStyles">
        <div 
          v-for="row in visibleRows" 
          :key="row[rowKey]"
          class="v-table-row"
          :class="{ 'selected': isRowSelected(row) }"
          @click="handleRowClick(row)"
        >
          <div 
            v-for="(col, colIndex) in columns" 
            :key="col.key || colIndex"
            class="v-table-cell"
            :style="getColumnStyle(col)"
          >
            <slot 
              :name="`cell-${col.key}`" 
              :row="row" 
              :value="row[col.key]"
              :column="col"
            >
              {{ formatCell(row[col.key], col) }}
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

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
  bordered: Boolean,
  virtualScroll: {
    type: Boolean,
    default: true
  },
  rowHeight: {
    type: Number,
    default: 48
  }
})

const emit = defineEmits(['row-click', 'sort-change'])

// Реактивные переменные
const headerRef = ref(null)
const bodyRef = ref(null)
const scrollTop = ref(0)
const visibleRows = ref([])
const selectedRow = ref(null)

// Вычисляемые стили для виртуализации
const contentStyles = computed(() => ({
  height: `${props.data.length * props.rowHeight}px`,
  paddingTop: `${scrollTop.value}px`
}))

// Определение видимых строк
const calculateVisibleRows = () => {
  if (!props.virtualScroll) {
    visibleRows.value = props.data
    return
  }

  const start = Math.floor(scrollTop.value / props.rowHeight)
  const end = start + Math.ceil((bodyRef.value?.clientHeight || 0) / props.rowHeight) + 5
  visibleRows.value = props.data.slice(start, end)
}

// Форматирование ячейки
const formatCell = (value, column) => {
  if (column.formatter) return column.formatter(value)
  return value ?? '-'
}

// Обработчик сортировки
const handleSort = column => {
  if (!column.sortable) return
  const newOrder = column.sortOrder === 'asc' ? 'desc' : 'asc'
  emit('sort-change', { column, order: newOrder })
}


// Определение стилей колонок
const getColumnStyle = col => ({
  width: col.width || 'auto',
  minWidth: col.minWidth || '100px',
  textAlign: col.align || 'left'
})

// Виртуализация при скролле
const handleScroll = () => {
  scrollTop.value = bodyRef.value?.scrollTop || 0
  calculateVisibleRows()
}

// надо реализовать
const isRowSelected = row => row?.foo??'';
const handleRowClick = () => undefined;

// Инициализация
onMounted(() => {
  calculateVisibleRows()
  if (props.virtualScroll) {
    new ResizeObserver(calculateVisibleRows).observe(bodyRef.value)
  }
})

watch(() => props.data, calculateVisibleRows)
</script>

<style scoped>
.v-table {
  --row-hover-bg: #f5f5f5;
  --row-selected-bg: #e3f2fd;
  --border-color: #ddd;
  font-size: 14px;
}

.v-table-header {
  display: flex;
  background: #fafafa;
  border-bottom: 2px solid var(--border-color);
}

.v-table-col {
  padding: 12px;
  cursor: pointer;
  user-select: none;
  position: relative;
}

.v-table-body {
  overflow-y: auto;
  height: 400px; /* Дефолтная высота */
}

.v-table-content {
  position: relative;
}

.v-table-row {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.v-table-row:hover {
  background: var(--row-hover-bg);
}

.v-table-row.selected {
  background: var(--row-selected-bg);
}

.v-table-cell {
  padding: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sort-icon {
  margin-left: 8px;
  font-size: 0.8em;
}

/* Модификаторы */
.striped .v-table-row:nth-child(even) {
  background: #f9f9f9;
}

.bordered .v-table-cell {
  border-right: 1px solid var(--border-color);
}

.bordered .v-table-cell:last-child {
  border-right: none;
}
</style>