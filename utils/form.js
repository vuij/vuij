export const CHECK_TYPES = ['checkbox', 'radio'];
export function isCheck(type) {
    return CHECK_TYPES.includes(type);
}

export function validClass(_class) {
    switch (typeof _class) {
        case "string":
            break;
        case "object":
            _class = Array.isArray(_class)
                ? _class.join(" ")
                : Object.keys(_class)
                        .filter((k) => _class[k])
                        .join(" ");
            break;
        default:
            _class = null;
            break;
    }
    return _class;
}


export function buildClass(_classes, _custom) {
    _classes = validClass(_classes);
    _custom = validClass(_custom);
    
    _classes =  (Array.isArray(_classes)) ? _classes : (_classes ? [_classes] : []);

    if (_custom) {
        if (Array.isArray(_custom)) _classes = _classes.concat(_custom);
        else _classes.push(_custom);
    }

    return _classes;//.join(" ");
}

export function getKeyValue (some, valueKey) {
    switch (typeof some) {
        case "number":
        case "string":
            some = String(some);
            break;
        case "object":
            some = Array.isArray(some)
                ? undefined
                : String(some?.[valueKey]);
            break;
        default:
            some = undefined;
            break;
    }
    return some;
}
export function toOptionsArray (some, valueKey) {
    return Array.isArray(some) ? some.map(v => getKeyValue(v, valueKey)) : [getKeyValue(some, valueKey)];
}
export function toOptionsObject (some = null, idKey = 'id', textKey = 'text', index) {
    if(!some) return [];
    const someObj = Object(some);
    if(someObj.constructor===Array) return some.map((item, index) => toOptionsObject(item, idKey, textKey, index));
    else if(someObj.constructor===Number) some = {[idKey]: index!==undefined ? index : 0, [textKey]: some};
    else if(someObj.constructor===String) some = {[idKey]: index!==undefined ? index : 0, [textKey]: some};
    else if(someObj.constructor===Object && some) {
        some = {[idKey]: someObj[idKey], [textKey]: someObj[textKey]}
    }
    return index!==undefined ? some : Array(some);
}

export default {
    CHECK_TYPES,
    isCheck,
    validClass,
    buildClass,
    getKeyValue,
    toOptionsArray,
    toOptionsObject
}