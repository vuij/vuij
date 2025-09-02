export default class Reformatter {
    /**
     * @param {Object} schema - Схема преобразования { "старый.путь": "новый.путь" }
     * @param {Object} transformers - Трансформаторы значений { "новый.путь": fn }
     */
    constructor(schema = {}, transformers = {}) {
        this.schema = schema;
        this.transformers = transformers;
        this.reverseSchema = this._createReverseSchema();
    }

    /**
     * Безопасное получение значения по пути
     * @param {Object} obj - Исходный объект
     * @param {string|Array} path - Путь к значению
     * @param {*} defaultValue - Значение по умолчанию
     * @returns {*} - Найденное значение или defaultValue
     */
    get(obj, path, defaultValue = undefined) {
        if (obj === null || typeof obj !== 'object') return defaultValue;

        const keys = this._parsePath(path);
        let current = obj;

        for (const key of keys) {
            if (current === null || current === undefined) break;
            current = current[key];
        }

        return current === undefined ? defaultValue : current;
    }

    /**
     * Безопасная установка значения по пути
     * @param {Object} obj - Целевой объект
     * @param {string|Array} path - Путь для установки
     * @param {*} value - Устанавливаемое значение
     * @returns {Object} - Изменённый объект
     */
    set(obj, path, value) {
        if (obj === null || typeof obj !== 'object') return obj;

        const keys = this._parsePath(path);
        let current = obj;

        // Создаём вложенные структуры при необходимости
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];

            // Защита от прототипного загрязнения
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }

            if (!current[key] || typeof current[key] !== 'object') {
                // Определяем тип следующего уровня
                const isNextArrayKey = /^\d+$/.test(nextKey);
                current[key] = isNextArrayKey ? [] : {};
            }

            current = current[key];
        }

        const lastKey = keys[keys.length - 1];
        current[lastKey] = value;
        return obj;
    }

    /**
     * Преобразование объекта по схеме
     * @param {Object} input - Исходный объект
     * @returns {Object} - Преобразованный объект
     */
    transform(input) {
        const result = {};

        Object.entries(this.schema).forEach(([oldPath, newPath]) => {
            const value = this.get(input, oldPath);
            if (value === undefined) return;

            const transformer = this.transformers[newPath];
            const transformedValue = transformer ? transformer(value, oldPath, newPath) : value;

            this.set(result, newPath, transformedValue);
        });

        return result;
    }

    /**
     * Обратное преобразование объекта
     * @param {Object} output - Преобразованный объект
     * @returns {Object} - Исходный объект
     */
    reverse(output) {
        const result = {};

        Object.entries(this.reverseSchema).forEach(([newPath, oldPath]) => {
            const value = this.get(output, newPath);
            if (value === undefined) return;

            // Для reverse трансформаторы не применяются
            this.set(result, oldPath, value);
        });

        return result;
    }

    /**
     * Создаёт обратную схему для преобразования
     * @private
     */
    _createReverseSchema() {
        return Object.entries(this.schema).reduce((acc, [oldPath, newPath]) => {
            acc[newPath] = oldPath;
            return acc;
        }, {});
    }

    /**
     * Парсит путь в массив ключей
     * @private
     */
    _parsePath(path) {
        if (Array.isArray(path)) return path;

        // Улучшенный парсинг: обрабатывает точки в скобках и массивы
        return path.split(/\.(?![^\[]*\])|\[|\]/)
            .filter(part => part !== '' && part !== ']');
    }
}

// // Пример использования
// const schema = {
//   "user.name": "profile.fullName",
//   "user.email": "contact.email",
//   "meta.stats.visits": "analytics.visits",
//   "permissions": "access.rights",
//   "tags[0]": "primaryTag"
// };

// const transformers = {
//   "profile.fullName": value => value.toUpperCase(),
//   "analytics.visits": value => Number(value) || 0
// };

// const input = {
//   user: {
//     name: "John Doe",
//     email: "john@example.com"
//   },
//   meta: {
//     stats: {
//       visits: "1250"
//     }
//   },
//   permissions: ["read", "write"],
//   tags: ["important", "urgent"]
// };

// const reformatter = new Reformatter(schema, transformers);

// // Прямое преобразование
// const transformed = reformatter.transform(input);
// console.log(transformed);
/*
{
  profile: { fullName: 'JOHN DOE' },
  contact: { email: 'john@example.com' },
  analytics: { visits: 1250 },
  access: { rights: [ 'read', 'write' ] },
  primaryTag: 'important'
}
*/

// // Обратное преобразование
// const reversed = reformatter.reverse(transformed);
// console.log(reversed);
/*
{
  user: {
    name: 'JOHN DOE', // Обратите внимание: трансформация сохранилась
    email: 'john@example.com'
  },
  meta: {
    stats: {
      visits: 1250
    }
  },
  permissions: [ 'read', 'write' ],
  tags: [ 'important' ] // Только первый элемент восстановился
}
*/

class AdvancedReformatter extends Reformatter {
    constructor(schema, transformers, reverseTransformers = {}) {
        super(schema, transformers);
        this.reverseTransformers = reverseTransformers;
    }

    reverse(output) {
        const result = {};

        Object.entries(this.reverseSchema).forEach(([newPath, oldPath]) => {
            let value = this.get(output, newPath);
            if (value === undefined) return;

            const transformer = this.reverseTransformers[oldPath];
            if (transformer) {
                value = transformer(value, newPath, oldPath);
            }

            this.set(result, oldPath, value);
        });

        return result;
    }
}