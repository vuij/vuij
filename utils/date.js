/* jshint esversion: 11 */
export const parseOrNow = (date, tz = true) => { //, serverTZOffset ?
    // date = (date instanceof Date) ? date : new Date(typeof(date)==='string' ? Date.parse(date.slice(0, 19).replace(" ", "T")) : Date.now());
    date = parse(date) || new Date();
    // 2 * 60000 компенсирует серверный таймзон ?
    if(tz) tz = date.getTimezoneOffset() * 1 * 60000;
    return tz ? new Date(date.getTime() - tz) : date;
};

export const iso = (date) => parseOrNow(date).toJSON();//===.toISOString()?
export const isoDate = (date, time, sec) => iso(date).slice(0, time ? (sec ? 19 : 16) : 10);
export const isoTime = (date) => iso(date).slice(11, (sec ? 19 : 16));

export const now = isoDate;

export const formatDate = (date, lang = 'ru-RU', options = {}) => {
    date = parse(date);
    return date ? date.toLocaleDateString(lang, { day: "numeric", month: "numeric", year: "numeric", ...Object(options)}) : '';
};

export const humanDate = (date, lang = 'ru-RU') => {
    if(date = parse(date)) {
        return date.toLocaleDateString(
            lang, 
            {
                day: "numeric", 
                month: "short", 
                year: date.getFullYear()!=(new Date()).getFullYear()?"numeric":undefined
            });
    }
};

/**@depricated ? */
export const validDate = (date) => (date instanceof Date) ? date : new Date(Date.parse(String(date)));

export const zeroing = (date) => {
    if(!(date instanceof Date)) date = parse(date);
    if(date instanceof Date) date.setHours(0, 0, 0, 0); //tz ?
    return date;
};
export const zeroUTC = (y=1, m=0, d=1) => new Date(new Date(new Date().setUTCHours(0,0,0,0)).setUTCFullYear(y, m, d));

// export const getHMSArray = (date)  => (date instanceof Date) ? [date.getHours(), date.getMinutes(), date.getSeconds()] : [];
// export const localized = (date, lang = 'ru-RU') => (date instanceof Date) ? new Intl.DateTimeFormat(lang).format(date) : undefined;
// export const format = (date, lang = 'ru-RU', options = undefined, parse = false) => (date instanceof Date) ? new Intl.DateTimeFormat(lang).format(date, options) : undefined;

export const format = (date, lang = 'ru-RU') => (date instanceof Date) ? new Intl.DateTimeFormat(lang).format(date) : undefined;
export const pattern = (lang = 'ru-RU') => format(new Date(1330387200000), lang);//'2012-02-28T00:00:00Z'// my daughter! :),

// think! 
export const placeholder = (lang) => {
    //return pattern(lang);
    // it shouldn't be here
    const formats = {
      "af-ZA": "yyyy/MM/dd",
      "am-ET": "d/M/yyyy",
      "ar-AE": "dd/MM/yyyy",
      "ar-BH": "dd/MM/yyyy",
      "ar-DZ": "dd-MM-yyyy",
      "ar-EG": "dd/MM/yyyy",
      "ar-IQ": "dd/MM/yyyy",
      "ar-JO": "dd/MM/yyyy",
      "ar-KW": "dd/MM/yyyy",
      "ar-LB": "dd/MM/yyyy",
      "ar-LY": "dd/MM/yyyy",
      "ar-MA": "dd-MM-yyyy",
      "ar-OM": "dd/MM/yyyy",
      "ar-QA": "dd/MM/yyyy",
      "ar-SA": "dd/MM/yy",
      "ar-SY": "dd/MM/yyyy",
      "ar-TN": "dd-MM-yyyy",
      "ar-YE": "dd/MM/yyyy",
      "arn-CL": "dd-MM-yyyy",
      "as-IN": "dd-MM-yyyy",
      "az-Cyrl-AZ": "dd.MM.yyyy",
      "az-Latn-AZ": "dd.MM.yyyy",
      "ba-RU": "dd.MM.yy",
      "be-BY": "dd.MM.yyyy",
      "bg-BG": "dd.M.yyyy",
      "bn-BD": "dd-MM-yy",
      "bn-IN": "dd-MM-yy",
      "bo-CN": "yyyy/M/d",
      "br-FR": "dd/MM/yyyy",
      "bs-Cyrl-BA": "d.M.yyyy",
      "bs-Latn-BA": "d.M.yyyy",
      "ca-ES": "dd/MM/yyyy",
      "co-FR": "dd/MM/yyyy",
      "cs-CZ": "d.M.yyyy",
      "cy-GB": "dd/MM/yyyy",
      "da-DK": "dd-MM-yyyy",
      "de-AT": "dd.MM.yyyy",
      "de-CH": "dd.MM.yyyy",
      "de-DE": "dd.MM.yyyy",
      "de-LI": "dd.MM.yyyy",
      "de-LU": "dd.MM.yyyy",
      "dsb-DE": "d. M. yyyy",
      "dv-MV": "dd/MM/yy",
      "el-GR": "d/M/yyyy",
      "en-029": "MM/dd/yyyy",
      "en-AU": "d/MM/yyyy",
      "en-BZ": "dd/MM/yyyy",
      "en-CA": "dd/MM/yyyy",
      "en-GB": "dd/MM/yyyy",
      "en-IE": "dd/MM/yyyy",
      "en-IN": "dd-MM-yyyy",
      "en-JM": "dd/MM/yyyy",
      "en-MY": "d/M/yyyy",
      "en-NZ": "d/MM/yyyy",
      "en-PH": "M/d/yyyy",
      "en-SG": "d/M/yyyy",
      "en-TT": "dd/MM/yyyy",
      "en-US": "M/d/yyyy",
      "en-ZA": "yyyy/MM/dd",
      "en-ZW": "M/d/yyyy",
      "es-AR": "dd/MM/yyyy",
      "es-BO": "dd/MM/yyyy",
      "es-CL": "dd-MM-yyyy",
      "es-CO": "dd/MM/yyyy",
      "es-CR": "dd/MM/yyyy",
      "es-DO": "dd/MM/yyyy",
      "es-EC": "dd/MM/yyyy",
      "es-ES": "dd/MM/yyyy",
      "es-GT": "dd/MM/yyyy",
      "es-HN": "dd/MM/yyyy",
      "es-MX": "dd/MM/yyyy",
      "es-NI": "dd/MM/yyyy",
      "es-PA": "MM/dd/yyyy",
      "es-PE": "dd/MM/yyyy",
      "es-PR": "dd/MM/yyyy",
      "es-PY": "dd/MM/yyyy",
      "es-SV": "dd/MM/yyyy",
      "es-US": "M/d/yyyy",
      "es-UY": "dd/MM/yyyy",
      "es-VE": "dd/MM/yyyy",
      "et-EE": "d.MM.yyyy",
      "eu-ES": "yyyy/MM/dd",
      "fa-IR": "MM/dd/yyyy",
      "fi-FI": "d.M.yyyy",
      "fil-PH": "M/d/yyyy",
      "fo-FO": "dd-MM-yyyy",
      "fr-BE": "d/MM/yyyy",
      "fr-CA": "yyyy-MM-dd",
      "fr-CH": "dd.MM.yyyy",
      "fr-FR": "dd/MM/yyyy",
      "fr-LU": "dd/MM/yyyy",
      "fr-MC": "dd/MM/yyyy",
      "fy-NL": "d-M-yyyy",
      "ga-IE": "dd/MM/yyyy",
      "gd-GB": "dd/MM/yyyy",
      "gl-ES": "dd/MM/yy",
      "gsw-FR": "dd/MM/yyyy",
      "gu-IN": "dd-MM-yy",
      "ha-Latn-NG": "d/M/yyyy",
      "he-IL": "dd/MM/yyyy",
      "hi-IN": "dd-MM-yyyy",
      "hr-BA": "d.M.yyyy.",
      "hr-HR": "d.M.yyyy",
      "hsb-DE": "d. M. yyyy",
      "hu-HU": "yyyy. MM. dd.",
      "hy-AM": "dd.MM.yyyy",
      "id-ID": "dd/MM/yyyy",
      "ig-NG": "d/M/yyyy",
      "ii-CN": "yyyy/M/d",
      "is-IS": "d.M.yyyy",
      "it-CH": "dd.MM.yyyy",
      "it-IT": "dd/MM/yyyy",
      "iu-Cans-CA": "d/M/yyyy",
      "iu-Latn-CA": "d/MM/yyyy",
      "ja-JP": "yyyy/MM/dd",
      "ka-GE": "dd.MM.yyyy",
      "kk-KZ": "dd.MM.yyyy",
      "kl-GL": "dd-MM-yyyy",
      "km-KH": "yyyy-MM-dd",
      "kn-IN": "dd-MM-yy",
      "ko-KR": "yyyy. MM. dd",
      "kok-IN": "dd-MM-yyyy",
      "ky-KG": "dd.MM.yy",
      "lb-LU": "dd/MM/yyyy",
      "lo-LA": "dd/MM/yyyy",
      "lt-LT": "yyyy.MM.dd",
      "lv-LV": "yyyy.MM.dd.",
      "mi-NZ": "dd/MM/yyyy",
      "mk-MK": "dd.MM.yyyy",
      "ml-IN": "dd-MM-yy",
      "mn-MN": "yy.MM.dd",
      "mn-Mong-CN": "yyyy/M/d",
      "moh-CA": "M/d/yyyy",
      "mr-IN": "dd-MM-yyyy",
      "ms-BN": "dd/MM/yyyy",
      "ms-MY": "dd/MM/yyyy",
      "mt-MT": "dd/MM/yyyy",
      "nb-NO": "dd.MM.yyyy",
      "ne-NP": "M/d/yyyy",
      "nl-BE": "d/MM/yyyy",
      "nl-NL": "d-M-yyyy",
      "nn-NO": "dd.MM.yyyy",
      "nso-ZA": "yyyy/MM/dd",
      "oc-FR": "dd/MM/yyyy",
      "or-IN": "dd-MM-yy",
      "pa-IN": "dd-MM-yy",
      "pl-PL": "dd.MM.yyyy",
      "prs-AF": "dd/MM/yy",
      "ps-AF": "dd/MM/yy",
      "pt-BR": "d/M/yyyy",
      "pt-PT": "dd-MM-yyyy",
      "qut-GT": "dd/MM/yyyy",
      "quz-BO": "dd/MM/yyyy",
      "quz-EC": "dd/MM/yyyy",
      "quz-PE": "dd/MM/yyyy",
      "rm-CH": "dd/MM/yyyy",
      "ro-RO": "dd.MM.yyyy",
    //   "ru-RU": "dd.MM.yyyy",
      "ru-RU": "дд.ММ.гггг",
      "rw-RW": "M/d/yyyy",
      "sa-IN": "dd-MM-yyyy",
      "sah-RU": "MM.dd.yyyy",
      "se-FI": "d.M.yyyy",
      "se-NO": "dd.MM.yyyy",
      "se-SE": "yyyy-MM-dd",
      "si-LK": "yyyy-MM-dd",
      "sk-SK": "d. M. yyyy",
      "sl-SI": "d.M.yyyy",
      "sma-NO": "dd.MM.yyyy",
      "sma-SE": "yyyy-MM-dd",
      "smj-NO": "dd.MM.yyyy",
      "smj-SE": "yyyy-MM-dd",
      "smn-FI": "d.M.yyyy",
      "sms-FI": "d.M.yyyy",
      "sq-AL": "yyyy-MM-dd",
      "sr-Cyrl-BA": "d.M.yyyy",
      "sr-Cyrl-CS": "d.M.yyyy",
      "sr-Cyrl-ME": "d.M.yyyy",
      "sr-Cyrl-RS": "d.M.yyyy",
      "sr-Latn-BA": "d.M.yyyy",
      "sr-Latn-CS": "d.M.yyyy",
      "sr-Latn-ME": "d.M.yyyy",
      "sr-Latn-RS": "d.M.yyyy",
      "sv-FI": "d.M.yyyy",
      "sv-SE": "yyyy-MM-dd",
      "sw-KE": "M/d/yyyy",
      "syr-SY": "dd/MM/yyyy",
      "ta-IN": "dd-MM-yyyy",
      "te-IN": "dd-MM-yy",
      "tg-Cyrl-TJ": "dd.MM.yy",
      "th-TH": "d/M/yyyy",
      "tk-TM": "dd.MM.yy",
      "tn-ZA": "yyyy/MM/dd",
      "tr-TR": "dd.MM.yyyy",
      "tt-RU": "dd.MM.yyyy",
      "tzm-Latn-DZ": "dd-MM-yyyy",
      "ug-CN": "yyyy-M-d",
      "uk-UA": "dd.MM.yyyy",
      "ur-PK": "dd/MM/yyyy",
      "uz-Cyrl-UZ": "dd.MM.yyyy",
      "uz-Latn-UZ": "dd/MM yyyy",
      "vi-VN": "dd/MM/yyyy",
      "wo-SN": "dd/MM/yyyy",
      "xh-ZA": "yyyy/MM/dd",
      "yo-NG": "d/M/yyyy",
      "zh-CN": "yyyy/M/d",
      "zh-HK": "d/M/yyyy",
      "zh-MO": "d/M/yyyy",
      "zh-SG": "d/M/yyyy",
      "zh-TW": "yyyy/M/d",
      "zu-ZA": "yyyy/MM/dd",
    };

    let p = formats[lang];
    if(!p && typeof lang === 'string' && lang.length===2) {
        p = Object.values(formats)[Object.keys(formats).findIndex(locale => locale.startsWith(lang))];
    }
  
    return p || "dd/MM/yyyy";
}

export const patternAnalize = (lang) => {
    const patternDate = pattern(lang),
        patternLength = patternDate.length,
        separatorIx = patternDate.search(/[^\d]/),
        separator = patternDate.substring(separatorIx, separatorIx+1),
        patternArr = patternDate.split(separator),
        fullYearIx = patternArr.indexOf('2012'),
        shortYearIx = patternArr.indexOf('12'),
        yearIsFull = fullYearIx > -1,
        yearLen = yearIsFull ? 4 : 2,
        yearIx = yearIsFull ? fullYearIx : shortYearIx,
        dayIx = patternArr.indexOf('28'),
        monthIx = 1*!yearIx + 1*!dayIx,
        firstSeparatorIx = patternDate.indexOf(separator), //separatorIx
        // lastSeparatorIx = patternDate.lastIndexOf(separator),
        monthMinLength = !monthIx && firstSeparatorIx==1 ? 1 : 2,
        // patternMaxLength = patternLength + (2 - monthMinLength),
        firstMaxLength = yearIx===0 ? yearLen : 2,
        secondMaxLength = yearIx===1 ? yearLen : 2,
        lastMaxLength = yearIx===2 ? yearLen : 2,
        regexInp = `^[\\d]{1,${firstMaxLength}}([\\${separator}]([\\d]{1,${secondMaxLength}}([\\${separator}]([\\d]{1,${lastMaxLength}})?)?)?)?$`,
        //
        // firstRange = monthIx===0 && monthMinLength<2 ? [1,2].join(',') : firstMaxLength,
        // secondRange = monthIx===1 && monthMinLength<2 ? [1,2].join(',') : secondMaxLength,
        // lastRange = monthIx===2 && monthMinLength<2 ? [1,2].join(',') : lastMaxLength,
        firstRange = yearIx!==0 ? [1,2].join(',') : yearLen,
        secondRange = yearIx!==1 ? [1,2].join(',') : yearLen,
        lastRange = yearIx!==2 ? [1,2].join(',') : yearLen,
        // firstRange = dayIx ? ( monthIx ? (yearIsFull ? 4 : 2) : [monthMinLength,2].join(',') ) : 2,
        // secondRange = dayIx!==1 ? ( monthIx!==1 ? (yearIsFull ? 4 : 2) : [monthMinLength,2].join(',') ) : 2,
        // lastRange = dayIx!==2 ? ( monthIx!==2 ? (yearIsFull ? 4 : 2) : [monthMinLength,2].join(',') ) : 2,
        regexStr = `^[\\d]{${firstRange}}\\${separator}[\\d]{${secondRange}}\\${separator}[\\d]{${lastRange}}$`;

    const analize = {
        // patternDate, 
        // patternLength, 
        // patternMaxLength, 
        separator, 
        // firstSeparatorIx, 
        // lastSeparatorIx, 
        dayIx, 
        monthIx, 
        yearIx, 
        yearLen, 
        monthMinLength, 
        //
        firstMaxLength,
        secondMaxLength,
        lastMaxLength,
        //
        regexInp,
        regexStr, 
    };

    
    return analize;
};

export const dateStringAnalize = (dateStr, lang) => { //, onInput
    dateStr = String(dateStr).trim();
    if(!dateStr) return undefined;

    const {separator, dayIx, monthIx, yearIx, regexStr, monthMinLength} = patternAnalize(lang);

        if (String(dateStr).match(new RegExp(regexStr))) {
                const dateArr = String(dateStr).replace(/[^\d]/gi, separator).split(separator);
        return new Date(dateArr[yearIx], dateArr[monthIx]-1, dateArr[dayIx], 0, 0, 0); // ?TZ
    }

    return undefined;
};


export const parse = (date, lang = 'ru-RU', fast = true) => {
    if(fast && date instanceof Date) return date;
    // only string
    date = (typeof date === 'string') ? date.trim() : '';
    // only not short
    // if(date.length < 8) return undefined; // 6 digits + 2 separators
    if(date.length < 6) return undefined; // 4 digits (min) + 2 separators

    // detect iso
    if(date.length >= 10 && date.indexOf('-')===4 && date.indexOf('-', 5)===7) {
        // it is may be iso // todo check regex !
        //
        if(/^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))$/.test(date.substring(0,10))) {
            //
                        //
            if(date.length === 10) {
                // return new Date(Date.parse(date + 'T00:00:00'));//????
                return new Date(Date.parse(date + 'T00:00:00Z'));
            }
            else if( /^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))(T|\s)(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9])(:(0[0-9]|[1-5][0-9])(\.[0-9]{3,6}Z|Z)?)?$/.test(date) ) {
                return new Date(Date.parse(date.replace(' ', 'T')));
            }
        }
    }

    return dateStringAnalize(date, lang);
};

export function getWeekStart(lang) {
    /**  also see https://gist.github.com/mlconnor/1887156  */
    /**  also see https://en.wikipedia.org/wiki/Date_format_by_country  */
    /**  also see https://dev.1c-bitrix.ru/api_help/main/general/lang/format.php  */
    /**  also see https://github.com/jerryurenaa/language-list/blob/main/language-list-json.json  */
    /**  need to check it! */
    const parts = String(lang).match(/^([a-z]{2,3})(?:-([a-z]{3})(?=$|-))?(?:-([a-z]{4})(?=$|-))?(?:-([a-z]{2}|\d{3})(?=$|-))?/i),
          rgn = parts?.[4],
          lng = parts?.[1],
          rgnSat = ['AE','AF','BH','DJ','DZ','EG','IQ','IR','JO','KW','LY','OM','QA','SD','SY'],
          rgnSun = ['AG','AR','AS','AU','BD','BR','BS','BT','BW','BZ','CA','CN','CO','DM','DO','ET','GT','GU','HK','HN',
                    'ID','IL','IN','JM','JP','KE','KH','KR','LA','MH','MM','MO','MT','MX','MZ','NI','NP','PA','PE','PH','PK',
                    'PR','PT','PY','SA','SG','SV','TH','TT','TW','UM','US','VE','VI','WS','YE','ZA','ZW'],
          lngSat = ['ar','arq','arz','fa'],
          lngSun = ['am','as','bn','dz','en','gn','gu','he','hi','id','ja','jv','km','kn','ko','lo','mh','ml','mr','mt','my',
                    'ne','om','or','pa','ps','sd','sm','sn','su','ta','te','th','tn','ur','zh','zu'];
    /* first day in week: 0 - sun, 1 - mon, 2 - sat */
    return rgn ? ( rgnSun.includes(rgn) ? 0 : rgnSat.includes(rgn) ? 2 : 1 ) 
               : ( lngSun.includes(lng) ? 0 : lngSat.includes(lng) ? 2 : 1 );
}
export function getCalendarObject(y, m, d, lang) {
    

    const now = new Date(), nowY = now.getFullYear(), nowM = now.getMonth(), nowD = now.getDate();
    y = y ?? nowY;
    m = m ?? nowM;
    d = d ?? nowD;
    let obj = [],
        // lang = document.head.parentElement.lang || navigator.language, //config
        _arr = (n) => ([...Array(n).keys()]),
        _utc = (y, m = 0, d = 1) => new Date(Date.UTC(y, m, d)),
        _iso = (utc) => utc.toJSON(),
        _ymd = (utc) => _iso(utc).slice(0, 10),
        _F = (dt, o) => new Intl.DateTimeFormat(lang, o).format(dt),
        first = _utc(y, m, 1),
        lastDt = _utc(y, m+1, 0).getDate(),
        weekStart = getWeekStart(lang), //config
        week = weekStart > 1 ? [6,0,1,2,3,4,5] : (weekStart > 0 ? [1,2,3,4,5,6,0] : [0,1,2,3,4,5,6]),
        fdIx = week.indexOf(first.getDay()),
        weekNames = [...week.keys()].map(x => _F(_utc(y, m, (x + 8 - fdIx)), { weekday: 'short' })),
        monthNames = [...Array(12).keys()].map(_m => _F(_utc(y, _m), { month: "long" })), // 
        calArr = _arr(fdIx).reverse().map(x => 0-x).concat(_arr(lastDt).map(x => x+1));
    calArr = calArr.concat(_arr(42-calArr.length).map(x => lastDt+x+1));
    obj = [...calArr].map((_d) => {
        let utc = _utc(y, m, _d);
                return {
            date: utc,
            d: utc.getDate(),
            w: _F(utc, { weekday: 'short' }),
            // f: _F(utc),/**@todo format by lang/cnfg? */
            // ymd: _ymd(utc),
            iso: _iso(utc),
            today: (_d===nowD && m===nowM && y===nowY),
            past: utc<now,
            future: utc>now,
            active: _d===d,
            out: _d < 1 ? -1 : (_d > lastDt ? 1 : 0),
        };
    });

    return {
        obj,
        monthNames,
        weekNames, 
        first, 
        _ymd, 
        lang,
    };

}

export default {
    parseOrNow,
    isoDate,
    isoTime,
    formatDate,
    humanDate,
    now,
    validDate,
    //
    format,
    pattern,
    parse,
};