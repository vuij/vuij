
import { get, set } from './object';

export function debounce(cb, ms = 250) {
    let timeout;
    return (...args) => {
        if(timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            cb(...args);
        }, ms);
    };
}

export function throttle(cb, ms = 250) {
    let wait = false;
    // return function() {
    //     if (wait) return;
    //     cb.apply(this, arguments);
    //     wait = true;
    //     setTimeout(() => (wait = false), ms);
    // };
    return (...args) => {
        if (wait) return;
        cb(...args);
        wait = true;
        setTimeout(() => {
            wait = false;
        }, ms);
    };
}


export default { get, set, debounce, throttle };