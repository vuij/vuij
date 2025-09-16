export class Datej extends Date {
    #locale; // Приватное поле для хранения локали

    constructor(...args) {
        // Определяем, передан ли параметр локали
        let dateArgs = [];
        let locale = navigator.language || 'en-US';
        
        // Анализируем аргументы
        if (args.length > 0) {
            // Если последний аргумент - строка, которая может быть локалью
            const lastArg = args[args.length - 1];
            if (typeof lastArg === 'string' && 
                (lastArg.includes('-') || lastArg.length === 2 || lastArg.length === 5)) {
                // Проверяем, является ли последний аргумент локалью
                try {
                    new Intl.DateTimeFormat(lastArg);
                    locale = lastArg;
                    dateArgs = args.slice(0, -1);
                } catch (e) {
                    // Не валидная локаль, используем все аргументы как дату
                    dateArgs = args;
                }
            } else {
                dateArgs = args;
            }
        }

        // Вызываем конструктор родителя
        if (dateArgs.length === 0) {
            super();
        } else {
            // Обрабатываем строку с временной зоной
            if (dateArgs.length === 1 && typeof dateArgs[0] === 'string') {
                const dateStr = dateArgs[0];
                // Проверяем, содержит ли строка информацию о временной зоне
                if (dateStr.includes('+') || dateStr.includes('Z') || dateStr.includes('-')) {
                    // Парсим дату как есть (сохраняем временную зону)
                    super(dateStr);
                } else {
                    // Строка без временной зоны - используем стандартный парсинг
                    super(...dateArgs);
                }
            } else {
                super(...dateArgs);
            }
        }

        // Сохраняем локаль
        this.#locale = locale;
    }

    // Геттер и сеттер для локали
    get locale() {
        return this.#locale;
    }

    set locale(newLocale) {
        try {
            new Intl.DateTimeFormat(newLocale); // Проверяем валидность локали
            this.#locale = newLocale;
        } catch (e) {
            throw new Error('Invalid locale');
        }
    }

    // Метод для преобразования в абсолютное UTC время (игнорируя временную зону)
    toAbsoluteUTC() {
        // Создаем новую дату с теми же компонентами, но в UTC
        const utcDate = new Datej(
            this.getUTCFullYear(),
            this.getUTCMonth(),
            this.getUTCDate(),
            this.getUTCHours(),
            this.getUTCMinutes(),
            this.getUTCSeconds(),
            this.getUTCMilliseconds(),
            this.#locale
        );
        
        return utcDate;
    }

    // Метод для получения строки в абсолютном UTC формате
    toAbsoluteUTCString() {
        const year = this.getUTCFullYear();
        const month = String(this.getUTCMonth() + 1).padStart(2, '0');
        const day = String(this.getUTCDate()).padStart(2, '0');
        const hours = String(this.getUTCHours()).padStart(2, '0');
        const minutes = String(this.getUTCMinutes()).padStart(2, '0');
        const seconds = String(this.getUTCSeconds()).padStart(2, '0');
        const milliseconds = String(this.getUTCMilliseconds()).padStart(3, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
    }

    // Методы экземпляра, использующие локаль по умолчанию
    toLocalString(options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat(this.#locale, mergedOptions).format(this);
    }

    toArabicDigitsString() {
        const formatted = this.toLocalString();
        return Datej.convertDateToArabicDigits(formatted, this.#locale);
    }

    getWeekStart() {
        return Datej.getWeekStart(this.#locale);
    }

    getDateFormatInfo() {
        return Datej.getDateFormatInfo(this.#locale);
    }

    getCalendarObject() {
        return Datej.getCalendarObject(
            this.getFullYear(),
            this.getMonth(),
            this.getDate(),
            this.#locale
        );
    }

    // Методы для добавления/вычитания временных интервалов
    addYears(years) {
        this.setFullYear(this.getFullYear() + years);
        return this;
    }
    
    addMonths(months) {
        this.setMonth(this.getMonth() + months);
        return this;
    }
    
    addDays(days) {
        this.setDate(this.getDate() + days);
        return this;
    }
    
    addHours(hours) {
        this.setHours(this.getHours() + hours);
        return this;
    }
    
    addMinutes(minutes) {
        this.setMinutes(this.getMinutes() + minutes);
        return this;
    }
    
    addSeconds(seconds) {
        this.setSeconds(this.getSeconds() + seconds);
        return this;
    }
    
    addMilliseconds(milliseconds) {
        this.setMilliseconds(this.getMilliseconds() + milliseconds);
        return this;
    }
    
    // UTC версии методов
    addUTCFullYears(years) {
        this.setUTCFullYear(this.getUTCFullYear() + years);
        return this;
    }
    
    addUTCMonths(months) {
        this.setUTCMonth(this.getUTCMonth() + months);
        return this;
    }
    
    addUTCDate(days) {
        this.setUTCDate(this.getUTCDate() + days);
        return this;
    }
    
    addUTCHours(hours) {
        this.setUTCHours(this.getUTCHours() + hours);
        return this;
    }
    
    addUTCMinutes(minutes) {
        this.setUTCMinutes(this.getUTCMinutes() + minutes);
        return this;
    }
    
    addUTCSeconds(seconds) {
        this.setUTCSeconds(this.getUTCSeconds() + seconds);
        return this;
    }
    
    addUTCMilliseconds(milliseconds) {
        this.setUTCMilliseconds(this.getUTCMilliseconds() + milliseconds);
        return this;
    }
    
    // Дополнительные удобные методы
    addWeeks(weeks) {
        return this.addDays(weeks * 7);
    }
    
    addUTCWeeks(weeks) {
        return this.addUTCDate(weeks * 7);
    }
    
    // Методы для вычитания
    subtractYears(years) {
        return this.addYears(-years);
    }
    
    subtractMonths(months) {
        return this.addMonths(-months);
    }
    
    subtractDays(days) {
        return this.addDays(-days);
    }
    
    subtractHours(hours) {
        return this.addHours(-hours);
    }
    
    subtractMinutes(minutes) {
        return this.addMinutes(-minutes);
    }
    
    subtractSeconds(seconds) {
        return this.addSeconds(-seconds);
    }
    
    subtractMilliseconds(milliseconds) {
        return this.addMilliseconds(-milliseconds);
    }
    
    subtractWeeks(weeks) {
        return this.addWeeks(-weeks);
    }
    
    // UTC версии методов вычитания
    subtractUTCFullYears(years) {
        return this.addUTCFullYears(-years);
    }
    
    subtractUTCMonths(months) {
        return this.addUTCMonths(-months);
    }
    
    subtractUTCDate(days) {
        return this.addUTCDate(-days);
    }
    
    subtractUTCHours(hours) {
        return this.addUTCHours(-hours);
    }
    
    subtractUTCMinutes(minutes) {
        return this.addUTCMinutes(-minutes);
    }
    
    subtractUTCSeconds(seconds) {
        return this.addUTCSeconds(-seconds);
    }
    
    subtractUTCMilliseconds(milliseconds) {
        return this.addUTCMilliseconds(-milliseconds);
    }
    
    subtractUTCWeeks(weeks) {
        return this.addUTCWeeks(-weeks);
    }
    
    // Методы для установки конкретных значений
    setYear(value) {
        this.setFullYear(value);
        return this;
    }
    
    setMonth(value) {
        this.setMonth(value);
        return this;
    }
    
    setDay(value) {
        this.setDate(value);
        return this;
    }
    
    setHour(value) {
        this.setHours(value);
        return this;
    }
    
    setMinute(value) {
        this.setMinutes(value);
        return this;
    }
    
    setSecond(value) {
        this.setSeconds(value);
        return this;
    }
    
    setMillisecond(value) {
        this.setMilliseconds(value);
        return this;
    }
    
    // UTC версии методов установки
    setUTCYear(value) {
        this.setUTCFullYear(value);
        return this;
    }
    
    setUTCMonth(value) {
        this.setUTCMonth(value);
        return this;
    }
    
    setUTCDay(value) {
        this.setUTCDate(value);
        return this;
    }
    
    setUTCHour(value) {
        this.setUTCHours(value);
        return this;
    }
    
    setUTCMinute(value) {
        this.setUTCMinutes(value);
        return this;
    }
    
    setUTCSecond(value) {
        this.setUTCSeconds(value);
        return this;
    }
    
    setUTCMillisecond(value) {
        this.setUTCMilliseconds(value);
        return this;
    }
    
    // Методы для получения разницы между датами
    diffYears(otherDate) {
        return this.getFullYear() - otherDate.getFullYear();
    }
    
    diffMonths(otherDate) {
        const yearDiff = this.diffYears(otherDate);
        return yearDiff * 12 + (this.getMonth() - otherDate.getMonth());
    }
    
    diffDays(otherDate) {
        const msDiff = this.getTime() - otherDate.getTime();
        return Math.floor(msDiff / (1000 * 60 * 60 * 24));
    }
    
    diffHours(otherDate) {
        const msDiff = this.getTime() - otherDate.getTime();
        return Math.floor(msDiff / (1000 * 60 * 60));
    }
    
    diffMinutes(otherDate) {
        const msDiff = this.getTime() - otherDate.getTime();
        return Math.floor(msDiff / (1000 * 60));
    }
    
    diffSeconds(otherDate) {
        const msDiff = this.getTime() - otherDate.getTime();
        return Math.floor(msDiff / 1000);
    }
    
    diffMilliseconds(otherDate) {
        return this.getTime() - otherDate.getTime();
    }
    
    // Клонирование объекта
    clone() {
        return new Datej(this.getTime(), this.#locale);
    }
    
    // Проверка на високосный год
    isLeapYear() {
        const year = this.getFullYear();
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
    
    // Получение количества дней в месяце
    daysInMonth() {
        return new Datej(this.getFullYear(), this.getMonth() + 1, 0, this.#locale).getDate();
    }
    
    // Проверка, является ли дата сегодняшним днем
    isToday() {
        const today = new Datej(undefined, this.#locale);
        return this.toDateString() === today.toDateString();
    }
    
    // Проверка, является ли дата выходным днем
    isWeekend() {
        const day = this.getDay();
        return day === 0 || day === 6;
    }
    
    // Округление даты до начала дня
    startOfDay() {
        this.setHours(0, 0, 0, 0);
        return this;
    }
    
    // Округление даты до конца дня
    endOfDay() {
        this.setHours(23, 59, 59, 999);
        return this;
    }
    
    // Округление даты до начала месяца
    startOfMonth() {
        this.setDate(1);
        return this.startOfDay();
    }
    
    // Округление даты до конца месяца
    endOfMonth() {
        this.setDate(this.daysInMonth());
        return this.endOfDay();
    }
    
    // Округление даты до начала года
    startOfYear() {
        this.setMonth(0);
        return this.startOfMonth();
    }
    
    // Округление даты до конца года
    endOfYear() {
        this.setMonth(11);
        return this.endOfMonth();
    }
    
    // Форматирование даты в строку с использованием шаблона
    format(formatStr) {
        const replacements = {
            'YYYY': this.getFullYear(),
            'YY': String(this.getFullYear()).slice(-2),
            'MM': String(this.getMonth() + 1).padStart(2, '0'),
            'M': this.getMonth() + 1,
            'DD': String(this.getDate()).padStart(2, '0'),
            'D': this.getDate(),
            'HH': String(this.getHours()).padStart(2, '0'),
            'H': this.getHours(),
            'mm': String(this.getMinutes()).padStart(2, '0'),
            'm': this.getMinutes(),
            'ss': String(this.getSeconds()).padStart(2, '0'),
            's': this.getSeconds(),
            'SSS': String(this.getMilliseconds()).padStart(3, '0'),
            'S': this.getMilliseconds(),
        };
        
        return formatStr.replace(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s|SSS|S/g, match => replacements[match]);
    }

    // Метод экземпляра для получения placeholder
    getPlaceholder() {
        return Datej.getPlaceholder(this.#locale);
    }

    // Статические методы
    static parseDateTime(dateStr, locale = null) {
        if (locale) {
            return Datej.parseLocalDateTimeWithIntl(dateStr, locale);
        } else {
            return Datej.parseIsoDateTime(dateStr);
        }
    }

    static parseLocalDateTimeWithIntl(dateStr, locale) {
        try {
            // Проверяем, есть ли время в строке
            const hasTime = /(\d{1,2}[:\.]\d{1,2}([:\.]\d{1,2})?)/.test(dateStr);
            
            if (hasTime) {
                // Пытаемся разделить дату и время
                const dateTimeParts = Datej.splitDateTime(dateStr, locale);
                
                if (dateTimeParts.date && dateTimeParts.time) {
                    const datePart = Datej.parseLocalDate(dateTimeParts.date, locale);
                    const timePart = Datej.parseTimeComponent(dateTimeParts.time);
                    
                    if (datePart instanceof Date && !isNaN(datePart) && timePart) {
                        datePart.setHours(timePart.hours, timePart.minutes, timePart.seconds, timePart.milliseconds);
                        return new Datej(datePart, locale);
                    }
                }
            }
            
            // Если не удалось распарсить с временем, парсим только дату
            return new Datej(Datej.parseLocalDate(dateStr, locale), locale);
        } catch (e) {
            return new Datej(NaN, locale);
        }
    }

    static parseIsoDateTime(dateStr) {

        if(dateStr && typeof dateStr === 'string' && /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))$/.test(dateStr.substring(0,10))) {
            if(dateStr.length === 10) {
                return new Date(Date.parse(dateStr + 'T00:00:00Z'));//?Z
            }
            else if( /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))(T|\s)(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9])(:(0[0-9]|[1-5][0-9])(\.[0-9]{3,6}Z|Z)?)?$/.test(dateStr) ) {
                return new Date(Date.parse(dateStr.replace(' ', 'T')));
            }
        }

        const isoRegex = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(?:Z|([+-])(\d{2}):?(\d{2})?)?)?$/;
        const match = dateStr?.match(isoRegex);
        
        if (!match) {
            return new Datej(NaN);
        }
        
        const year = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1;
        const day = parseInt(match[3], 10);
        
        const hours = match[4] ? parseInt(match[4], 10) : 0;
        const minutes = match[5] ? parseInt(match[5], 10) : 0;
        const seconds = match[6] ? parseInt(match[6], 10) : 0;
        const milliseconds = match[7] ? parseInt(match[7], 10) : 0;
        
        let timezoneOffset = 0;
        if (match[8] && match[9] && match[10]) {
            const sign = match[8] === '+' ? 1 : -1;
            const tzHours = parseInt(match[9], 10);
            const tzMinutes = parseInt(match[10], 10) || 0;
            timezoneOffset = sign * (tzHours * 60 + tzMinutes);
        }
        
        const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds, milliseconds));
        
        if (timezoneOffset !== 0) {
            date.setMinutes(date.getMinutes() - timezoneOffset);
        }
        
        return new Datej(date);
    }

    static splitDateTime(dateTimeStr, locale) {
        const spaceSplit = dateTimeStr.split(' ');
        if (spaceSplit.length === 2) {
            return { date: spaceSplit[0], time: spaceSplit[1] };
        }
        
        const tSplit = dateTimeStr.split('T');
        if (tSplit.length === 2) {
            return { date: tSplit[0], time: tSplit[1] };
        }
        
        try {
            const testDate = new Date(2023, 11, 25);
            const formatter = new Intl.DateTimeFormat(locale);
            const dateParts = formatter.formatToParts(testDate);
            
            let datePattern = '';
            dateParts.forEach(part => {
                if (part.type === 'literal') {
                    datePattern += Datej.escapeRegExp(part.value);
                } else {
                    datePattern += '\\d+';
                }
            });
            
            const dateRegex = new RegExp(`^(${datePattern})`);
            const dateMatch = dateTimeStr.match(dateRegex);
            
            if (dateMatch && dateMatch[1]) {
                const datePart = dateMatch[1];
                const timePart = dateTimeStr.slice(datePart.length).trim();
                
                if (timePart && /(\d{1,2}[:\.]\d{1,2})/.test(timePart)) {
                    return { date: datePart, time: timePart };
                }
            }
        } catch (e) {}
        
        return { date: dateTimeStr, time: null };
    }

    static parseTimeComponent(timeStr) {
        const timeRegex = /^(\d{1,2})[:\.](\d{1,2})(?:[:\.](\d{1,2})(?:\.(\d{1,3}))?)?(?:\s*(AM|PM))?$/i;
        const match = timeStr.match(timeRegex);
        
        if (!match) {
            return null;
        }
        
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = match[3] ? parseInt(match[3], 10) : 0;
        const milliseconds = match[4] ? parseInt(match[4], 10) : 0;
        const period = match[5] ? match[5].toUpperCase() : null;
        
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return { hours, minutes, seconds, milliseconds };
    }

    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    static parseLocalDate(dateStr, locale) {
        const formatInfo = Datej.getDateFormatInfo(locale);
        const separators = formatInfo.separators;
        const separatorPattern = separators.length > 0 
            ? `[${separators.map(Datej.escapeRegExp).join('')}]`
            : '\\s';
        
        const order = formatInfo.order;
        const dayIndex = order.indexOf('D');
        const monthIndex = order.indexOf('M');
        const yearIndex = order.indexOf('Y');
        
        const regex = new RegExp(`^(\\d{1,2})${separatorPattern}(\\d{1,2})${separatorPattern}(\\d{2,4})$`);
        const match = dateStr.match(regex);
        
        if (!match) {
            throw new Error(`Invalid date format for locale ${locale}`);
        }
        
        const day = parseInt(match[dayIndex + 1]);
        const month = parseInt(match[monthIndex + 1]) - 1;
        let year = parseInt(match[yearIndex + 1]);
        
        if (year < 100) {
            year = Datej.normalizeTwoDigitYear(year);
        }
        
        if (month < 0 || month > 11) {
            throw new Error(`Invalid month: ${month + 1}`);
        }
        
        if (day < 1 || day > 31) {
            throw new Error(`Invalid day: ${day}`);
        }
        
        const resultDate = new Date(year, month, day);
        if (resultDate.getMonth() !== month || resultDate.getDate() !== day) {
            throw new Error('Invalid date');
        }
        
        return resultDate;
    }

    static normalizeTwoDigitYear(year) {
        const currentYear = new Date().getFullYear();
        const century = Math.floor(currentYear / 100) * 100;
        let fullYear = century + year;
        
        if (fullYear > currentYear + 50) fullYear -= 100;
        if (fullYear < currentYear - 50) fullYear += 100;
        
        return fullYear;
    }

    static getDateFormatInfo(locale) {
        const testDate = new Date(2023, 11, 25);
        const formatter = new Intl.DateTimeFormat(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        const parts = formatter.formatToParts(testDate);
        
        let dayPos = -1, monthPos = -1, yearPos = -1;
        let separators = [];
        
        parts.forEach((part, index) => {
            switch (part.type) {
                case 'day':
                    dayPos = index;
                    break;
                case 'month':
                    monthPos = index;
                    break;
                case 'year':
                    yearPos = index;
                    break;
                case 'literal':
                    if (/[^a-zA-Z0-9]/.test(part.value)) {
                        separators.push(part.value);
                    }
                    break;
            }
        });
        
        let order = '';
        [dayPos, monthPos, yearPos].sort((a, b) => a - b).forEach(pos => {
            const part = parts.find(p => parts.indexOf(p) === pos);
            if (part.type === 'day') order += 'D';
            if (part.type === 'month') order += 'M';
            if (part.type === 'year') order += 'Y';
        });
        
        return {
            locale,
            formattedDate: formatter.format(testDate),
            order,
            separators: [...new Set(separators)]
        };
    }

    static getWeekStart(locale) {
        try {
            const localeInfo = new Intl.Locale(locale);
            if (localeInfo.weekInfo && localeInfo.weekInfo.firstDay !== undefined) {
                const firstDay = localeInfo.weekInfo.firstDay;
                return firstDay === 7 ? 0 : firstDay;
            }
        } catch (e) {}
        
        const parts = String(locale).match(/^([a-z]{2,3})(?:-([a-z]{3})(?=$|-))?(?:-([a-z]{4})(?=$|-))?(?:-([a-z]{2}|\d{3})(?=$|-))?/i);
        const rgn = parts?.[4];
        const lng = parts?.[1] ?? '';
        
        const rgnSat = ['AE','AF','BH','DJ','DZ','EG','IQ','IR','JO','KW','LY','OM','QA','SD','SY'];
        const rgnSun = ['AG','AR','AS','AU','BD','BR','BS','BT','BW','BZ','CA','CN','CO','DM','DO','ET','GT','GU','HK','HN',
                        'ID','IL','IN','JM','JP','KE','KH','KR','LA','MH','MM','MO','MT','MX','MZ','NI','NP','PA','PE','PH','PK',
                        'PR','PT','PY','SA','SG','SV','TH','TT','TW','UM','US','VE','VI','WS','YE','ZA','ZW'];
        const lngSat = ['ar','arq','arz','fa'];
        const lngSun = ['am','as','bn','dz','en','gn','gu','he','hi','id','ja','jv','km','kn','ko','lo','mh','ml','mr','mt','my',
                        'ne','om','or','pa','ps','sd','sm','sn','su','ta','te','th','tn','ur','zh','zu'];
        
        const weekStart = rgn 
            ? (rgnSun.includes(rgn) ? 0 : rgnSat.includes(rgn) ? 6 : 1)
            : (lngSun.includes(lng) ? 0 : lngSat.includes(lng) ? 6 : 1);
        
        return weekStart;
    }

    static convertDateToArabicDigits(dateStr, locale) {
        const digitMaps = {
            thai: {
                '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4',
                '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9'
            },
            arabicIndic: {
                '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
                '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
            },
            persian: {
                '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
                '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
            },
            bengali: {
                '০': '0', '১': '1', '২': '2', '۳': '3', '۴': '4',
                '৫': '5', '৬': '6', '۷': '7', '৮': '8', '৯': '9'
            },
            devanagari: {
                '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
                '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
            }
        };

        function detectDigitSystem(str) {
            for (const [system, map] of Object.entries(digitMaps)) {
                for (const digit of Object.keys(map)) {
                    if (str.includes(digit)) {
                        return system;
                    }
                }
            }
            return null;
        }

        function convertDigits(str, system) {
            if (!system) return str;
            
            const map = digitMaps[system];
            return str.split('').map(char => {
                return map[char] !== undefined ? map[char] : char;
            }).join('');
        }

        const digitSystem = detectDigitSystem(dateStr);
        
        if (digitSystem) {
            return convertDigits(dateStr, digitSystem);
        }

        return dateStr;
    }

    static getCalendarObject(year, month, day, locale) {
        const now = new Date();
        const nowY = now.getFullYear();
        const nowM = now.getMonth();
        const nowD = now.getDate();
        
        year = year ?? nowY;
        month = month ?? nowM;
        day = day ?? nowD;

        const _arr = (n) => Array.from({length: n}, (_, i) => i);
        const _utc = (y, m = 0, d = 1) => new Date(Date.UTC(y, m, d));
        const _iso = (date) => date.toISOString();
        const _F = (date, options) => new Intl.DateTimeFormat(locale, options).format(date);
        
        const first = _utc(year, month, 1);
        const lastDate = _utc(year, month + 1, 0).getDate();
        const weekStart = Datej.getWeekStart(locale);
        
        const weekDays = [0, 1, 2, 3, 4, 5, 6];
        const weekOrder = weekDays.slice(weekStart).concat(weekDays.slice(0, weekStart));
        
        const firstDayOffset = (first.getDay() - weekStart + 7) % 7;
        
        const totalCells = 42;
        const calendarDays = [];
        
        const prevMonthLastDate = _utc(year, month, 0).getDate();
        for (let i = firstDayOffset - 1; i >= 0; i--) {
            calendarDays.push(prevMonthLastDate - i);
        }
        
        for (let i = 1; i <= lastDate; i++) {
            calendarDays.push(i);
        }
        
        const nextMonthDays = totalCells - calendarDays.length;
        for (let i = 1; i <= nextMonthDays; i++) {
            calendarDays.push(i);
        }
        
        const todayUTC = new Date(Date.UTC(nowY, nowM, nowD));
        const obj = calendarDays.map((dayNum, index) => {
            const isPrevMonth = index < firstDayOffset;
            const isNextMonth = index >= firstDayOffset + lastDate;
            
            const dayYear = isPrevMonth ? (month === 0 ? year - 1 : year) : isNextMonth ? (month === 11 ? year + 1 : year) : year;
            const dayMonth = isPrevMonth ? (month === 0 ? 11 : month - 1) : isNextMonth ? (month === 11 ? 0 : month + 1) : month;
            
            const date = _utc(dayYear, dayMonth, dayNum);
            const dateStartOfDay = new Date(date);
            dateStartOfDay.setUTCHours(0, 0, 0, 0);
            
            return {
                date: date,
                d: date.getDate(),
                w: _F(date, { weekday: 'short' }),
                iso: _iso(date),
                utcDate: dateStartOfDay.toISOString(),
                today: dateStartOfDay.getTime() === todayUTC.getTime(),
                past: date < todayUTC,
                future: date > todayUTC,
                active: !isPrevMonth && !isNextMonth && dayNum === day,
                out: isPrevMonth ? -1 : isNextMonth ? 1 : 0,
            };
        });
        
        const weekNames = weekOrder.map(dayIndex => {
            const date = _utc(2023, 0, 1 + dayIndex);
            return _F(date, { weekday: 'short' });
        });
        
        const monthNames = _arr(12).map(monthNum => {
            return _F(_utc(year, monthNum), { month: "long" });
        });
        
        return {
            obj,
            monthNames,
            weekNames,
            first,
            _ymd: (date) => _iso(date).slice(0, 10),
            lang: locale,
        };
    }

    // Статический метод для получения pattern для input
    static getInputPattern(locale = 'en-US') {
        try {
            const formatInfo = this.getDateFormatInfo(locale);
            const separators = formatInfo.separators;
            
            // Создаем pattern на основе порядка компонентов
            let pattern = '';
            
            for (const char of formatInfo.order) {
                switch (char) {
                    case 'D':
                        pattern += '\\d{1,2}';
                        break;
                    case 'M':
                        pattern += '\\d{1,2}';
                        break;
                    case 'Y':
                        pattern += '\\d{4}';
                        break;
                }
                
                // Добавляем разделитель после каждого компонента, кроме последнего
                if (char !== formatInfo.order[formatInfo.order.length - 1]) {
                    // Экранируем специальные символы для regex
                    const separator = separators[0] || '-';
                    pattern += this.escapeRegex(separator);
                }
            }
            
            return pattern;
        } catch (e) {
            // Fallback pattern
            return '\\d{4}-\\d{2}-\\d{2}';
        }
    }

    // Альтернативная версия с более точным определением разделителей
    static getInputPatternAdvanced(locale = 'en-US') {
        try {
            // Используем конкретную дату для анализа формата
            const formatter = new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            const parts = formatter.formatToParts(new Date(2023, 10, 22));
            
            let pattern = '';
            for (const part of parts) {
                switch (part.type) {
                    case 'year':
                        pattern += '\\d{4}';
                        break;
                    case 'month':
                        pattern += '\\d{1,2}';
                        break;
                    case 'day':
                        pattern += '\\d{1,2}';
                        break;
                    case 'literal':
                        // Экранируем специальные символы
                        pattern += this.escapeRegex(part.value);
                        break;
                }
            }
            
            return pattern;
        } catch (e) {
            return '\\d{4}-\\d{2}-\\d{2}';
        }
    }

    // Метод для экранирования специальных символов в regex
    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Метод экземпляра для получения pattern
    getInputPattern() {
        return Datej.getInputPattern(this.#locale);
    }

    // Статический метод для получения placeholder
    static getPlaceholder(locale = 'en-US') {
        try {
            const formatter = new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            // Используем конкретную дату для получения двузначных значений
            const parts = formatter.formatToParts(new Date(2023, 10, 22));

            const dicts = {"ru-RU": {y: "Г", m: "М", d: "Д"}, "ru": {y: "Г", m: "М", d: "Д"}};
            const dict = dicts[locale] ?? {y: "Y", m: "M", d: "D"};
            
            let placeholder = '';
            for (const part of parts) {
                switch (part.type) {
                    case 'year':
                        placeholder += dict.y.repeat(4);
                        break;
                    case 'month':
                        placeholder += dict.m.repeat(2);
                        break;
                    case 'day':
                        placeholder += dict.d.repeat(2);
                        break;
                    default:
                        placeholder += part.value;
                }
            }
            
            return placeholder;
        } catch (e) {
            // Fallback в случае ошибки
            return 'YYYY-MM-DD';
        }
    }

    // Метод для получения placeholder с примерами значений
    static getInputPlaceholder(locale = 'en-US') {
        try {
            const formatter = new Intl.DateTimeFormat(locale, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            
            // Используем конкретную дату для получения примера
            const formatted = formatter.format(new Date(2023, 10, 22));
            
            // Заменяем цифры на соответствующие шаблоны
            return formatted
                .replace(/\d{4}/g, 'YYYY')
                .replace(/\d{2}/g, 'MM')
                .replace(/\d{1,2}/g, 'DD');
        } catch (e) {
            return 'YYYY-MM-DD';
        }
    }

    // Метод экземпляра для получения placeholder с примерами
    getInputPlaceholder() {
        return Datej.getInputPlaceholder(this.#locale);
    }
}