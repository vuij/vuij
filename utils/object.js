// типа lodash.get
export const get = (n, h) => n.split(".").reduce((o, i) => o ? o[i] : void (0), h);

//https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method
export const set = (obj, path, value) => {
    if (Object(obj) !== obj) return obj;
    if (!Array.isArray(path)) path = path.toString().match(/[^.[\]]+/g) || []; 
    path.slice(0,-1).reduce((a, c, i) => Object(a[c]) === a[c] ? a[c] : (a[c] = Math.abs(path[i+1])>>0 === +path[i+1] ? [] : {}), obj)[path[path.length-1]] = value;
    return obj;
};

export function Obj2QS(o, p, n) {
  return Object
                .keys(Object(o)) // .keys({...o})
                .map(x => {
                    const v = o[x], e = encodeURIComponent, k = p ? `${e(p)}[${!n&&Array.isArray(o)?'':e(x)}]` : e(x);
                    if (v !== undefined) return (v && typeof(v)==='object') ? Obj2QS(v, x) : `${k}${v===null?'':'='+e(v)}`;
                })
                .filter(p => !!p)
                .join('&');
}

export function QS2Obj(s) {
    const obj = {};
    s = String(s??'');
	if (s.search(/\[.\]$/gi) > -1) {
		let i=0, x;
        s = s.replace(/([^&]+)\[\]/gi, (m, p1) => {
            i = (x === p1) ? i + 1 : 0;
            x = p1;
            return `${p1}[${i}]`;
        });
	}
    s.replace('?', '').split('&').forEach(p => {
        let ps = p.split('='), k = ps[0], v = ps[1]??'';
        if(k) {
            k = k.replace(']', '').replace('[', '.');
            set(obj, k, decodeURIComponent(v));
        }
    });
	return obj;
}

export function Form2Obj(form, cb) {
    if (typeof (cb) !== 'function') cb = (n, v) => ([n, v]);
    return Object.fromEntries([...new FormData(form).entries()].map(x => cb(x[0], x[1])).filter(v => !!v));
}

// export function sortObj(o, cb) {
//     return Object.keys(o).sort(cb).reduce((a, k) => { a[k] = o[k]; return a; }, {});
// }

export function* chunks(arr, n) {
    for (let i = 0; i < arr.length; i += n) {
        yield arr.slice(i, i + n);
    }
}
export function mergeDeep(...objects) {
    const isObject = obj => obj && typeof obj === 'object';
    
    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];
        
        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = pVal.concat(...oVal);
        }
        else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = mergeDeep(pVal, oVal);
        }
        else {
          prev[key] = oVal;
        }
      });
      
      return prev;
    }, {});
}

/** ADM1N */
export const isString = obj => (typeof obj === 'string');
export const isNumber = obj => (typeof obj === 'number'); /* ODO likeNumber */
export const isFunction = obj => (typeof obj === 'function');
export const isArray = arr => !!Array.isArray(arr);
export const likeArray = arr => isArray(arr) || Object.keys(arr).sort().join() === Object.keys(arr).map((_,i) => i).join();
export const isObject = obj => (typeof obj === 'object');
export const isObjectNotArray = obj => isObject(obj) && !isArray(obj);
export const isPlainObject = obj => (obj?.constructor === Object || Object.getPrototypeOf(obj ?? 0) === null);
export const isPlainObjectOrArray = obj => isPlainObject(obj) || isArray(obj);
export const isDate = obj => (obj?.constructor === Date);

export function fromQuery(s) {
    return fromEntries(new URLSearchParams(decodeURI(s)).entries());
}
export function fromForm(form) { 
    return fromEntries(new FormData(form).entries());
}

export function fromEntries(es) { // ignoreEmpty? sort?
    let p = [...es];
    let n = [], d = {}, r = {};
    p.forEach(([k,v], i) => {
        if(p.filter(([_k,_v])=>_k===k&&_v!==v).length) {
            if(!d[k]) d[k] = [];
            d[k].push(v)
        }
        else n.push([k,v])
    });
    Object.entries(d).forEach(([_k, _d]) => {
        _d.forEach((v,i) => {
            let li = _k.lastIndexOf("[]"),
                k = _k.slice(0, li) + "[" + i + "]" + _k.slice(li+2);
            n.push([k,v]);
        });
    });
    n.forEach(([k,v]) => {
        const path = k.replaceAll("[]", "[0]").replaceAll("]", "").replaceAll("[", ".").split(".");
        path
            .slice(0,-1)
            .reduce(
                (a, c, i) => {
                    return Object(a[c]) === a[c] 
                        ? a[c] 
                        : (a[c] = Math.abs(path[i+1])>>0 === +path[i+1] ? [] : {})
                }, r
            )[path.at(-1)]/*[path[path.length-1]]*/ = v;
           
        return r;
    });
    return r;
    /* example: fromQuery('a=1&b=2&c[0]=xxx&c[1]=yyy&j[]=JJJ&j[]=jjj&t[][]=TTT&t[][]=t')); */
}
export const toObj = (a) => isArray(a) ? Object.fromEntries(a.filter(v=>v!==undefined).map((v,i)=>[i,v])) : (isPlainObject(a) ? a : {});
export const toArr = (a) => isArray(a) ? a : (likeArray(a) ? Object.values(a).sort() : undefined);
export const asQuery = (k=null, v='', n=null, f=v=>v??'', s='&') => k 
				? (
                    v && (isPlainObject(v) || isArray(v))
                        ? Object.entries(toObj(v)).map(([_k,_v])=> asQuery(_k, _v,  `${(n ?? k)}[${_k}]`, f) ).join(s)
                        : [(n ?? k), f(v)].join('=') 
                  ) 
				: undefined;
export const toQuery = (o={}, n=null, f=v=>v??'', s='&') => Object.entries(o)
				      .reduce((a,[k,v])=>[...a, asQuery(k, v, n, f, s)],[])
				      .filter(p => !!p)
				      .join(s);

export const toQueryString = (o={}, n=null) => toQuery(o, n, encodeURIComponent, '&');

export function getFormInfo(form, strict) {
    const data = new FormData(form), 
        params = new URLSearchParams(data),
        query = strict 
                ? fromForm(form) 
                : Object.fromEntries(params.entries()),
        search = strict 
                ? toQueryString(query)
                : params.toString(),
        body = JSON.stringify(query);
    return { form, data, params, search, query, body, strict };
}

export const sortObj = (o, options = {}) => isArray(o) 
    ? o.sort(options?.compareArrFn ?? options?.compareObjFn) 
    : Object.keys(o).sort(options?.compareObjFn).reduce((a, k) => { a[k] = o[k]; return a; }, {});

export const mapObj = (o, options = {mapEntriesFn: (v,k) => ([k,v]), formatDate: (d) => d?.toJSON()}) => isFunction(options.mapEntriesFn) 
    ? (isArray(o) 
        ? Object.values(Object.fromEntries(o.filter(v=>v!==undefined).map((v,k) => options.mapEntriesFn(v,k)))) 
        : (isPlainObject(o) 
            ? (likeArray(o) ? mapObj(toArr(o), options.mapEntriesFn) : Object.fromEntries(Object.entries(o).map(([k,v]) => options.mapEntriesFn(v,k)))) 
            : (isDate(o) && isFunction(options.formatDate) ? options.formatDate(o) : o))
        ) 
    : o;

    
export const sortDeep = (o, options = {formatDate: (d) => d?.toJSON()}) => sortObj(
    mapObj(o, {
        mapEntriesFn: (v,k)=>{
            // if(k==='d') console.warn({v,k}, isPlainObjectOrArray(v));
            return [k, isPlainObjectOrArray(v) ? sortObj(v, options) : (isDate(v) && isFunction(options.formatDate) ? options.formatDate(v) : v)]
        }
    }), 
    options
);

// const obj = { get, set, Obj2QS, QS2Obj, Form2Obj, sortObj, chunks, mergeDeep };
const obj = { 
    get, 
    set, 
    Obj2QS, QS2Obj, Form2Obj,
    isString, 
    isNumber, 
    isFunction, 
    isArray, 
    likeArray, 
    isObject, 
    isObjectNotArray, 
    isPlainObject, 
    isPlainObjectOrArray, 
    isDate, 
    fromQuery, 
    fromEntries, 
    fromForm, 
    toArr, 
    toObj, 
    asQuery, 
    toQuery, 
    toQueryString, 
    getFormInfo, 
    sortObj, 
    mapObj, 
    sortDeep, 
    mergeDeep, 
    chunks 
};

export default obj;