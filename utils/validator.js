export const validators = {
  /**
   * Поле должно быть принято (true, 1, 'yes', 'on', '1')
   */
  accepted(value) {
    return [true, 1, 'yes', 'on', '1'].includes(value);
  },

  /**
   * Поле должно быть принято, если другое поле равно значению
   */
  accepted_if(value, params, data) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return targetValues.includes(data[targetField]?.toString()) 
      ? validators.accepted(value)
      : true;
  },

  /**
   * URL должен быть активным (асинхронная проверка)
   */
  active_url: (value) => !!value,
//   active_url: async (value) => {
//     try {
//       const response = await fetch(`https://is-it-up.org/${encodeURIComponent(value)}.json`);
//       const { status } = await response.json();
//       return status === 1;
//     } catch {
//       return false;
//     }
//   },

  /**
   * Дата должна быть после указанной даты
   */
  after(value, params) {
    return new Date(value) > new Date(params[0]);
  },

  /**
   * Дата должна быть после или равна указанной
   */
  after_or_equal(value, params) {
    return new Date(value) >= new Date(params[0]);
  },

  /**
   * Значение должно соответствовать хотя бы одному из правил
   */
  anyOf(value, params, data, field) {
    return params.some(rule => {
      const [ruleName, ...ruleParams] = rule.split(':');
      return validators[ruleName](value, ruleParams, data, field);
    });
  },

  /**
   * Только буквенные символы
   */
  alpha(value) {
    return /^[a-zA-Zа-яА-ЯёЁ]+$/.test(value);
  },

  /**
   * Буквы, цифры, дефисы и подчеркивания
   */
  alpha_dash(value) {
    return /^[\w-]+$/.test(value);
  },

  /**
   * Только буквы и цифры
   */
  alpha_num(value) {
    return /^[a-zA-Z0-9]+$/.test(value);
  },

  /**
   * Значение должно быть массивом
   */
  array(value) {
    return Array.isArray(value);
  },

  /**
   * Только ASCII символы
   */
  ascii(value) {
    return /^[\x00-\x7F]+$/.test(value);
  },

  /**
   * Остановить валидацию при первой ошибке (обрабатывается движком)
   */
  bail: () => true,

  /**
   * Дата должна быть до указанной даты
   */
  before(value, params) {
    return new Date(value) < new Date(params[0]);
  },

  /**
   * Дата должна быть до или равна указанной
   */
  before_or_equal(value, params) {
    return new Date(value) <= new Date(params[0]);
  },

  /**
   * Размер между min и max
   */
  between(value, params) {
    const [min, max] = params.map(Number);
    const num = parseFloat(value);
    const str = value?.toString();
    const arr = Array.isArray(value) ? value : [];
    
    return !isNaN(num) ? num >= min && num <= max :
      str ? str.length >= min && str.length <= max :
      arr.length >= min && arr.length <= max;
  },

  /**
   * Допустимые значения: true, false, 1, 0, '1', '0'
   */
  boolean(value) {
    return [true, false, 1, 0, '1', '0'].includes(value);
  },

  /**
   * Поле должно иметь подтверждение
   */
  confirmed(value, params, data, field) {
    return value === data[`${field}_confirmation`];
  },

  /**
   * Содержит одно из значений
   */
  contains(value, params) {
    return params.some(param => value.includes(param));
  },

  /**
   * Не содержит указанные значения
   */
  doesnt_contain(value, params) {
    return !params.some(param => value.includes(param));
  },

  /**
   * Совпадает с паролем текущего пользователя (заглушка)
   */
  current_password: () => true,

  /**
   * Корректная дата
   */
  date(value) {
    return !isNaN(Date.parse(value));
  },

  /**
   * Дата равна указанной
   */
  date_equals(value, params) {
    return new Date(value).getTime() === new Date(params[0]).getTime();
  },

  /**
   * Соответствие формату даты
   */
  date_format(value, params) {
    try {
      return !!new Date(value).toISOString();
    } catch {
      return false;
    }
  },

  /**
   * Десятичное число с указанной точностью
   */
  decimal(value, params) {
    const [min = 0, max] = params.map(Number);
    const parts = value.toString().split('.');
    return parts.length === 2 && 
           parts[1].length >= min && 
           (max === undefined || parts[1].length <= max);
  },

  /**
   * Поле должно быть отклонено (false, 0, 'no', 'off', '0')
   */
  declined(value) {
    return [false, 0, 'no', 'off', '0'].includes(value);
  },

  /**
   * Поле должно быть отклонено, если другое поле равно значению
   */
  declined_if(value, params, data) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return targetValues.includes(data[targetField]?.toString()) 
      ? validators.declined(value)
      : true;
  },

  /**
   * Отличается от значения другого поля
   */
  different(value, params, data) {
    return value !== data[params[0]];
  },

  /**
   * Ровно value цифр
   */
  digits(value, params) {
    return /^\d+$/.test(value) && value.length === parseInt(params[0], 10);
  },

  /**
   * Количество цифр между min и max
   */
  digits_between(value, params) {
    const [min, max] = params.map(Number);
    return /^\d+$/.test(value) && value.length >= min && value.length <= max;
  },

  /**
   * Проверка размеров изображения (заглушка)
   */
  dimensions: () => true,

  /**
   * Уникальные значения в массиве
   */
  distinct(value) {
    return Array.isArray(value) && new Set(value).size === value.length;
  },

  /**
   * Не начинается с указанных значений
   */
  doesnt_start_with(value, params) {
    return !params.some(prefix => value.startsWith(prefix));
  },

  /**
   * Не заканчивается указанными значениями
   */
  doesnt_end_with(value, params) {
    return !params.some(suffix => value.endsWith(suffix));
  },

  /**
   * Валидный email
   */
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },

  /**
   * Заканчивается одним из значений
   */
  ends_with(value, params) {
    return params.some(suffix => value.endsWith(suffix));
  },

  /**
   * Значение в перечислении
   */
  enum(value, params) {
    return params.includes(value);
  },

  /**
   * Исключить поле (обрабатывается движком)
   */
  exclude: () => true,

  /**
   * Исключить если условие
   */
  exclude_if(value, params, data, field) {
    if (params.length < 2) return true;
    return data[params[0]] === params[1];
  },

  /**
   * Исключить если не условие
   */
  exclude_unless(value, params, data, field) {
    if (params.length < 2) return true;
    return data[params[0]] !== params[1];
  },

  /**
   * Исключить если поле присутствует
   */
  exclude_with(value, params, data) {
    return params[0] in data;
  },

  /**
   * Исключить если поле отсутствует
   */
  exclude_without(value, params, data) {
    return !(params[0] in data);
  },

  /**
   * Существует в таблице (заглушка)
   */
  exists: () => true,

  /**
   * Разрешенные расширения файлов
   */
  extensions(value, params) {
    const extension = value.split('.').pop();
    return params.includes(extension);
  },

  /**
   * Загруженный файл
   */
  file(value) {
    return value instanceof File;
  },

  /**
   * Поле присутствует и не пустое
   */
  filled(value) {
    return value !== undefined && value !== null && value !== '';
  },

  /**
   * Больше значения другого поля
   */
  gt(value, params, data) {
    return parseFloat(value) > parseFloat(data[params[0]]);
  },

  /**
   * Больше или равно значению другого поля
   */
  gte(value, params, data) {
    return parseFloat(value) >= parseFloat(data[params[0]]);
  },

  /**
   * HEX-цвет (#fff или #ffffff)
   */
  hex_color(value) {
    return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(value);
  },

  /**
   * Изображение (по MIME-типу)
   */
  image(value) {
    const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return value instanceof File && types.includes(value.type);
  },

  /**
   * Значение в списке
   */
  in(value, params) {
    return params.includes(value.toString());
  },

  /**
   * Значение существует в другом поле (массиве)
   */
  in_array(value, params, data) {
    const target = data[params[0]];
    return Array.isArray(target) && target.includes(value);
  },

  /**
   * Ключи существуют в массиве
   */
  in_array_keys(value, params, data) {
    const target = data[params[0]];
    return Array.isArray(target) && params.slice(1).every(key => key in target);
  },

  /**
   * Целое число
   */
  integer(value) {
    return Number.isInteger(Number(value));
  },

  /**
   * Валидный IP-адрес
   */
  ip(value) {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(value);
  },

  /**
   * Валидный JSON
   */
  json(value) {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Меньше значения другого поля
   */
  lt(value, params, data) {
    return parseFloat(value) < parseFloat(data[params[0]]);
  },

  /**
   * Меньше или равно значению другого поля
   */
  lte(value, params, data) {
    return parseFloat(value) <= parseFloat(data[params[0]]);
  },

  /**
   * Строка в нижнем регистре
   */
  lowercase(value) {
    return value === value.toLowerCase();
  },

  /**
   * Пронумерованный массив (список)
   */
  list(value) {
    return Array.isArray(value) && 
           value.every((_, i) => i in value);
  },

  /**
   * Валидный MAC-адрес
   */
  mac_address(value) {
    return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value);
  },

  /**
   * Максимальное значение
   */
  max(value, params) {
    const max = parseFloat(params[0]);
    if (typeof value === 'number') return value <= max;
    if (typeof value === 'string') return value.length <= max;
    if (Array.isArray(value)) return value.length <= max;
    if (value instanceof File) return value.size <= max;
    return false;
  },

  /**
   * Максимальное количество цифр
   */
  max_digits(value, params) {
    const max = parseInt(params[0], 10);
    return value.toString().replace(/[^0-9]/g, '').length <= max;
  },

  /**
   * Разрешенные MIME-типы
   */
  mimetypes(value, params) {
    return value instanceof File && params.includes(value.type);
  },

  /**
   * Разрешенные расширения файлов (синоним extensions)
   */
  mimes: (value, params) => validators.extensions(value, params),

  /**
   * Минимальное значение
   */
  min(value, params) {
    const min = parseFloat(params[0]);
    if (typeof value === 'number') return value >= min;
    if (typeof value === 'string') return value.length >= min;
    if (Array.isArray(value)) return value.length >= min;
    if (value instanceof File) return value.size >= min;
    return false;
  },

  /**
   * Минимальное количество цифр
   */
  min_digits(value, params) {
    const min = parseInt(params[0], 10);
    return value.toString().replace(/[^0-9]/g, '').length >= min;
  },

  /**
   * Кратно указанному числу
   */
  multiple_of(value, params) {
    const divisor = parseFloat(params[0]);
    return parseFloat(value) % divisor === 0;
  },

  /**
   * Поле должно отсутствовать
   */
  missing(value, params, data, field) {
    return !(field in data);
  },

  /**
   * Поле должно отсутствовать, если другое поле равно значению
   */
  missing_if(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return targetValues.includes(data[targetField]?.toString()) 
      ? !(field in data)
      : true;
  },

  /**
   * Поле должно отсутствовать, если другое поле не равно значению
   */
  missing_unless(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, targetValue] = params;
    return data[targetField]?.toString() !== targetValue
      ? !(field in data)
      : true;
  },

  /**
   * Поле должно отсутствовать если присутствует любое из указанных полей
   */
  missing_with(value, params, data, field) {
    return params.some(f => f in data) 
      ? !(field in data)
      : true;
  },

  /**
   * Поле должно отсутствовать если присутствуют все указанные поля
   */
  missing_with_all(value, params, data, field) {
    return params.every(f => f in data)
      ? !(field in data)
      : true;
  },

  /**
   * Значение не в списке
   */
  not_in(value, params) {
    return !params.includes(value.toString());
  },

  /**
   * Не соответствует регулярному выражению
   */
  not_regex(value, params) {
    try {
      const regex = new RegExp(params[0]);
      return !regex.test(value);
    } catch {
      return false;
    }
  },

  /**
   * Поле может быть null
   */
  nullable(value) {
    return value === null || value === undefined || true;
  },

  /**
   * Числовое значение
   */
  numeric(value) {
    return !isNaN(parseFloat(value));
  },

  /**
   * Поле должно присутствовать (но может быть пустым)
   */
  present(value, params, data, field) {
    return data?.[field] !== undefined; //field in data;
  },

  /**
   * Поле должно присутствовать, если другое поле равно значению
   */
  present_if(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return !!targetValues.includes(data[targetField]?.toString()) // WHAT IF data[targetField] is ARRAY ? PRESENT IN ? some/some?
      // ? data?.[field] !== undefined //field in data
      // : true;
  },

  /**
   * Поле должно присутствовать, если другое поле не равно значению
   */
  present_unless(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, targetValue] = params;
    return data[targetField]?.toString() !== targetValue
      ? data?.[field] !== undefined //field in data
      : true;
  },

  /**
   * Поле должно присутствовать если присутствует любое из указанных полей
   */
  present_with(value, params, data, field) {
    // console.warn('present_with', field, params, data, Object.keys(data));
    // if(field==='product___offsite') console.warn('present_with|product___offsite', field, params, data);

    return params.some(f => data?.[f] !== undefined);

    // return params.some(f => f in Object.keys(data)) 
    //   ? data?.[field] !== undefined //field in data
    //   : true;
  },

  /**
   * Поле должно присутствовать если присутствуют все указанные поля
   */
  present_with_all(value, params, data, field) {
    return params.every(f => data?.[f] !== undefined);
    // return params.every(f => f in data)
    //   ? field in data
    //   : true;
  },

  /**
   * Поле запрещено (если присутствует - ошибка)
   */
  prohibited(value, params, data, field) {
    return !(field in data);
  },

  /**
   * Поле запрещено, если другое поле равно значению
   */
  prohibited_if(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return targetValues.includes(data[targetField]?.toString()) 
      ? !(field in data)
      : true;
  },

  /**
   * Поле запрещено, если другое поле принято
   */
  prohibited_if_accepted(value, params, data, field) {
    return params.some(targetField => 
      validators.accepted(data[targetField])
    ) ? !(field in data) : true;
  },

  /**
   * Поле запрещено, если другое поле отклонено
   */
  prohibited_if_declined(value, params, data, field) {
    return params.some(targetField => 
      validators.declined(data[targetField])
    ) ? !(field in data) : true;
  },

  /**
   * Поле запрещено, если другое поле не равно значению
   */
  prohibited_unless(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, targetValue] = params;
    return data[targetField]?.toString() !== targetValue
      ? !(field in data)
      : true;
  },

  /**
   * Если это поле присутствует, оно запрещает другие поля
   */
  prohibits(value, params, data, field) {
    if (!(field in data)) return true;
    return params.every(prohibitedField => !(prohibitedField in data));
  },

  /**
   * Соответствует регулярному выражению
   */
  regex(value, params) {
    try {
      const regex = new RegExp(params[0]);
      return regex.test(value);
    } catch {
      return false;
    }
  },

  /**
   * Обязательное поле
   */
  required(value) {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    if (Array.isArray(value) && value.length === 0) return false;
    return true;
  },

  /**
   * Обязательное, если другое поле равно значению
   */
  required_if(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return targetValues.includes(data[targetField]?.toString()) 
      ? validators.required(value)
      : true;
  },

  /**
   * Обязательное, если другое поле принято
   */
  required_if_accepted(value, params, data, field) {
    return params.some(targetField => 
      validators.accepted(data[targetField])
    ) ? validators.required(value) : true;
  },

  /**
   * Обязательное, если другое поле отклонено
   */
  required_if_declined(value, params, data, field) {
    return params.some(targetField => 
      validators.declined(data[targetField])
    ) ? validators.required(value) : true;
  },

  /**
   * Обязательное, если другое поле не равно значению
   */
  required_unless(value, params, data, field) {
    if (params.length < 2) return true;
    const [targetField, ...targetValues] = params;
    return !targetValues.includes(data[targetField]?.toString()) 
      ? validators.required(value)
      : true;
  },

  /**
   * Обязательное, если присутствует любое из указанных полей
   */
  required_with(value, params, data, field) {
    return params.some(f => f in data) 
      ? validators.required(value)
      : true;
  },

  /**
   * Обязательное, если присутствуют все указанные поля
   */
  required_with_all(value, params, data, field) {
    return params.every(f => f in data)
      ? validators.required(value)
      : true;
  },

  /**
   * Обязательное, если отсутствует любое из указанных полей
   */
  required_without(value, params, data, field) {
    return params.some(f => !(f in data)) 
      ? validators.required(value)
      : true;
  },

  /**
   * Обязательное, если отсутствуют все указанные поля
   */
  required_without_all(value, params, data, field) {
    return params.every(f => !(f in data))
      ? validators.required(value)
      : true;
  },

  /**
   * Обязательные ключи в массиве
   */
  required_array_keys(value, params) {
    return Array.isArray(value) && 
           params.every(key => key in value);
  },

  /**
   * Совпадает с другим полем
   */
  same(value, params, data) {
    return value === data[params[0]];
  },

  /**
   * Размер соответствует
   */
  size(value, params) {
    const size = parseFloat(params[0]);
    if (typeof value === 'number') return value === size;
    if (typeof value === 'string') return value.length === size;
    if (Array.isArray(value)) return value.length === size;
    if (value instanceof File) return value.size === size;
    return false;
  },

  /**
   * Начинается с одного из значений
   */
  starts_with(value, params) {
    return params.some(prefix => value.startsWith(prefix));
  },

  /**
   * Строка
   */
  string(value) {
    return typeof value === 'string';
  },

  /**
   * Валидная временная зона
   */
  timezone(value) {
    try {
      new Intl.DateTimeFormat('en', {timeZone: value});
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Уникальное значение в таблице (заглушка)
   */
  unique: () => true,

  /**
   * Строка в верхнем регистре
   */
  uppercase(value) {
    return value === value.toUpperCase();
  },

  /**
   * Валидный URL
   */
  url(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Валидный ULID
   */
  ulid(value) {
    return /^[0-9A-Z]{26}$/.test(value);
  },

  /**
   * Валидный UUID
   */
  uuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
  }
};

// Дополнительные правила для поддержки всех возможностей
validators.any_of = validators.anyOf;
validators.endsWith = validators.ends_with;
validators.startsWith = validators.starts_with;
validators.requiredArrayKeys = validators.required_array_keys;
validators.prohibitedIfAccepted = validators.prohibited_if_accepted;
validators.prohibitedIfDeclined = validators.prohibited_if_declined;

/**
 * Движок валидации
 */
export class Validator {
  constructor(rules, customMessages = {}) {
    this.rules = rules;
    this.customMessages = customMessages;
    this.errors = {};
  }

  validate(data) {
//   async validate(data) {
    this.errors = {};
    
    for (const [field, fieldRules] of Object.entries(this.rules)) {
      const value = data[field];

      
      for (const rule of fieldRules.split('|')) {
        // const [ruleName, ...ruleParams] = rule.split(':');
        const [ruleName, ruleParams] = rule.split(':');
        const validator = validators[ruleName];
        

        if (!validator) continue;
        
        let isValid;
        // Проверка асинхронных правил
        // if (validator.constructor.name === 'AsyncFunction') {
        //   isValid = await validator(value, ruleParams, data, field);
        // } else {
        //   isValid = validator(value, ruleParams, data, field);
        // }

        // if(Array.isArray(ruleParams)) console.warn('>>>', {field, value, isValid, fieldRules, ruleName, ruleParams, validator});
        // const params = ruleParams;//Array.isArray(ruleParams) ? ruleParams.flatMap(p => p?.split(',')) : ruleParams?.split(',');
        
        const params = ruleParams?.split(',');
        isValid = validator(value, params, data, field);
        //present_with

        // if(field==='product__texts__type') console.log('>>>', {field, value, isValid, fieldRules, ruleName, ruleParams, params, validator}); // не cплитятся params?
        //present_if
        
        if (!isValid) {
          this.addError(field, ruleName, params);
          if (ruleName === 'bail') break;
        }
      }
    }
    
    return Object.keys(this.errors).length === 0;
  }

  addError(field, rule, params) {
    if (!this.errors[field]) this.errors[field] = [];
    
    const message = this.customMessages[`${field}.${rule}`] 
      || this.getDefaultMessage(field, rule, params);
    
    this.errors[field].push(message);
  }

  getDefaultMessage(field, rule, params) {
    const messages = {
      required: `Поле ${field} обязательно для заполнения`,
      email: `Поле ${field} должно быть действительным email адресом`,
      // min: `Поле ${field} должно быть не менее ${params[0]}`,
      // max: `Поле ${field} должно быть не более ${params[0]}`,
      confirmed: `Поле ${field} не совпадает с подтверждением`,
      unique: `Значение поля ${field} уже занято`,
      // ... другие стандартные сообщения
    };
    
    return messages[rule] || `Ошибка валидации для поля ${field}`;
  }

  getErrors() {
    return this.errors;
  }
}

/*
// Пример использования
const rules = {
  name: 'required|string|min:3|max:255',
  email: 'required|email|unique:users,email',
  password: 'required|min:8|confirmed',
  password_confirmation: 'required',
  age: 'nullable|integer|min:18',
  avatar: 'nullable|image|max:2048',
  terms: 'accepted',
  website: 'nullable|active_url',
  birthdate: 'required|date|before:-18 years',
  permissions: 'required|array',
  'permissions.*': 'integer|exists:permissions,id'
};

const data = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  password_confirmation: 'secret123',
  age: 25,
  terms: 'on'
};

const validator = new Validator(rules);
validator.validate(data).then(isValid => {
  if (!isValid) {
    console.log('Validation errors:', validator.getErrors());
  } else {
    console.log('Validation passed!');
  }
});
*/