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

export function sortObj(o, cb) {
    return Object.keys(o).sort(cb).reduce((a, k) => { a[k] = o[k]; return a; }, {});
}

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

const obj = { get, set, Obj2QS, QS2Obj, Form2Obj, sortObj, chunks, mergeDeep };

export default obj;