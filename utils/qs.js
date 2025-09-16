/**
 * Современный парсер query-строк с улучшенной обработкой массивов и объектов
 * @param {string} queryString - Строка запроса для парсинга
 * @param {Object} options - Опции парсинга
 * @returns {Object} Парсированный объект
 * 
 * 🚀 Улучшенная реализация qs.parse
 */
function parseQueryString(queryString, options = {}) {
  const {
    ignoreQueryPrefix = true,
    arrayLimit = 20,
    allowSparseArrays = false,
    decoder = decodeURIComponent
  } = options;

  // Удаляем ведущий '?' если нужно
  let processedString = queryString;
  if (ignoreQueryPrefix && processedString.startsWith('?')) {
    processedString = processedString.substring(1);
  }

  if (!processedString) return {};

  const result = {};
  const pairs = processedString.split('&');

  for (const pair of pairs) {
    if (!pair) continue;

    let [key, value] = pair.split('=');
    key = decoder(key || '');
    value = decoder(value || '');

    // Обработка вложенных структур
    processKeyValue(result, key, value, arrayLimit, allowSparseArrays);
  }

  return result;
}

/**
 * Обрабатывает ключ и значение, учитывая вложенную структуру
 */
function processKeyValue(obj, key, value, arrayLimit, allowSparseArrays) {
  const bracketIndex = key.indexOf('[');
  
  // Простой ключ без скобок
  if (bracketIndex === -1) {
    setSimpleKey(obj, key, value);
    return;
  }

  // Извлекаем основной ключ и путь
  const mainKey = key.substring(0, bracketIndex);
  const path = extractPath(key.substring(bracketIndex));
  
  setNestedValue(obj, mainKey, path, value, arrayLimit, allowSparseArrays);
}

/**
 * Извлекает путь из строки в скобках
 */
function extractPath(bracketString) {
  const path = [];
  const regex = /\[([^\]]*)\]/g;
  let match;
  
  while ((match = regex.exec(bracketString)) !== null) {
    path.push(match[1]);
  }
  
  return path;
}

/**
 * Устанавливает значение во вложенную структуру
 */
function setNestedValue(obj, mainKey, path, value, arrayLimit, allowSparseArrays) {
  let current = obj;
  
  // Инициализируем основной ключ если нужно
  if (!(mainKey in current)) {
    current[mainKey] = path[0] === '' ? [] : {};
  }
  
  current = current[mainKey];
  
  // Обрабатываем путь
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const isLast = i === path.length - 1;
    
    if (segment === '') {
      // Авто-индексация массива
      if (!Array.isArray(current)) {
        current = convertToArray(current, arrayLimit);
      }
      if (isLast) {
        current.push(value);
      } else {
        const nextSegment = path[i + 1];
        const nextIndex = parseInt(nextSegment, 10);
        
        if (!isNaN(nextIndex)) {
          ensureArrayIndex(current, nextIndex, allowSparseArrays);
          current = current[nextIndex];
          i++; // Пропускаем следующий сегмент
        } else {
          const newObj = {};
          current.push(newObj);
          current = newObj;
        }
      }
    } else if (!isNaN(segment)) {
      // Числовой индекс
      const index = parseInt(segment, 10);
      
      if (Array.isArray(current)) {
        ensureArrayIndex(current, index, allowSparseArrays);
        if (isLast) {
          current[index] = value;
        } else {
          if (current[index] === undefined) {
            current[index] = {};
          }
          current = current[index];
        }
      } else {
        if (isLast) {
          current[segment] = value;
        } else {
          if (!current[segment]) {
            const nextSegment = path[i + 1];
            current[segment] = !isNaN(nextSegment) ? [] : {};
          }
          current = current[segment];
        }
      }
    } else {
      // Строковый ключ
      if (isLast) {
        current[segment] = value;
      } else {
        if (!current[segment]) {
          const nextSegment = path[i + 1];
          current[segment] = !isNaN(nextSegment) ? [] : {};
        }
        current = current[segment];
      }
    }
  }
}

/**
 * Устанавливает простое значение ключа
 */
function setSimpleKey(obj, key, value) {
  if (key in obj) {
    // Если ключ уже существует, преобразуем в массив
    if (!Array.isArray(obj[key])) {
      obj[key] = [obj[key]];
    }
    obj[key].push(value);
  } else {
    obj[key] = value;
  }
}

/**
 * Преобразует объект в массив с учетом лимита
 */
function convertToArray(obj, arrayLimit) {
  if (Array.isArray(obj)) return obj;
  
  const arr = [];
  const keys = Object.keys(obj);
  
  // Если слишком много ключей, сохраняем как объект
  if (keys.length > arrayLimit) {
    return obj;
  }
  
  // Проверяем, все ли ключи числовые
  const allNumeric = keys.every(key => !isNaN(key));
  
  if (allNumeric) {
    keys.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    for (const key of keys) {
      arr[parseInt(key, 10)] = obj[key];
    }
    return arr;
  }
  
  return obj;
}

/**
 * Обеспечивает существование индекса в массиве
 */
function ensureArrayIndex(arr, index, allowSparse) {
  if (index >= arr.length) {
    if (allowSparse) {
      arr.length = index + 1;
    } else {
      // Заполняем пробелы undefined
      while (arr.length < index) {
        arr.push(undefined);
      }
    }
  }
}

/**
 * Современный сериализатор объектов в query-строку
 * @param {Object} obj - Объект для сериализации
 * @param {Object} options - Опции сериализации
 * @returns {string} Строка запроса
 * 
 * 🚀 Улучшенная реализация qs.stringify
 */
function stringifyQueryString(obj, options = {}) {
  const {
    arrayFormat = 'indices',
    encode = true,
    encoder = encodeURIComponent,
    allowDots = false,
    sortKeys = false
  } = options;

  const parts = [];
  const encoderFunc = encode ? encoder : val => val;

  // Рекурсивно собираем части query-строки
  buildQueryParts(obj, '', parts, encoderFunc, arrayFormat, allowDots);

  // Сортируем ключи если нужно
  if (sortKeys) {
    parts.sort((a, b) => {
      const aKey = a.split('=')[0];
      const bKey = b.split('=')[0];
      return aKey.localeCompare(bKey);
    });
  }

  return parts.join('&');
}

/**
 * Рекурсивно строит части query-строки
 */
function buildQueryParts(obj, prefix, parts, encoder, arrayFormat, allowDots) {
  if (obj === null || obj === undefined) {
    return;
  }

  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      // Обработка массивов
      processArray(obj, prefix, parts, encoder, arrayFormat, allowDots);
    } else {
      // Обработка объектов
      processObject(obj, prefix, parts, encoder, arrayFormat, allowDots);
    }
  } else {
    // Простые значения
    const encodedKey = encoder(prefix);
    const encodedValue = encoder(String(obj));
    parts.push(`${encodedKey}=${encodedValue}`);
  }
}

/**
 * Обрабатывает массивы в зависимости от формата
 */
function processArray(arr, prefix, parts, encoder, arrayFormat, allowDots) {
  for (let i = 0; i < arr.length; i++) {
    const value = arr[i];
    if (value === undefined || value === null) continue;

    let key;
    switch (arrayFormat) {
      case 'indices':
        key = `${prefix}[${i}]`;
        break;
      case 'brackets':
        key = `${prefix}[]`;
        break;
      case 'repeat':
        key = prefix;
        break;
      case 'comma':
        if (i === 0) {
          const commaValues = arr
            .filter(v => v !== undefined && v !== null)
            .map(v => encoder(String(v)))
            .join(',');
          parts.push(`${encoder(prefix)}=${commaValues}`);
        }
        return;
      default:
        key = `${prefix}[${i}]`;
    }

    if (arrayFormat === 'repeat') {
      buildQueryParts(value, prefix, parts, encoder, arrayFormat, allowDots);
    } else {
      buildQueryParts(value, key, parts, encoder, arrayFormat, allowDots);
    }
  }
}

/**
 * Обрабатывает объекты
 */
function processObject(obj, prefix, parts, encoder, arrayFormat, allowDots) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const value = obj[key];
    if (value === undefined || value === null) continue;

    const newPrefix = prefix 
      ? (allowDots ? `${prefix}.${key}` : `${prefix}[${key}]`)
      : key;

    buildQueryParts(value, newPrefix, parts, encoder, arrayFormat, allowDots);
  }
}

export const {parse, stringify} = {parseQueryString, stringifyQueryString};