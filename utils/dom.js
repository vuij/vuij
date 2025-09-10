/**
 * 🚀 majQ.js - minimalistiс another jQuery (:for seniors:)
 * @trunow
 * @version 4.0.5
 */
const $ = (s, p) => (p instanceof Node ? p : document).querySelector(s);
$.win = window;
$.doc = document;
$.title = $.doc.title;
$.head = $.doc.head;
$.body = $.doc.body;
$.html = $.doc.documentElement;
$.Node = Node;
$._ = $.prototype = $.Node.prototype;
$.isNode = (is) => is instanceof $.Node;
$.getNode = (is, or) => ($.isNode(is) ? is : $.getNode(or, $.doc));
$.all = $.$ = (s, p) => $.getNode(p).querySelectorAll(s);
$.meta = (n) => ($('meta[name="' + n + '"') || {}).content;
$.create = (tag) => $.doc.createElement(typeof tag !== "string" ? "DIV" : tag);
$.el = function (o) {
    if ($.isNode(o)) return o;
    if (o.constructor === String) o = { tag: o }; /**@todo string parser */
    if (o.constructor !== Object)
        throw new TypeError(
            "Illegal type in .push (" +
                o +
                ") on element " +
                this +
                " (must be Object)"
        );
    return $.create(o.tag).set(o);
};
$._.on = EventTarget.prototype.on = addEventListener;
$._.off = EventTarget.prototype.off = removeEventListener;
$._.set = function (o) {
    if (o.constructor === Object) {
        Object.keys(o).forEach((x) => {
            if (typeof this[x] === "function" && typeof o[x] !== "function")
                this[x](o[x]);
            else if (
                typeof this[x] !== "undefined" &&
                typeof this[x] !== typeof o[x]
            )
                throw new TypeError(
                    "Illegal type of setting prop (" +
                        x +
                        ") on element " +
                        this +
                        ", waiting type: " +
                        typeof this[x]
                );
            else this[x] = o[x];
        });
    }
    return this;
};
$._.attr = function (any, val) {
    if (val.constructor !== String) {
        if (any.constructor === Object) {
            new Map(Object.entries(any)).forEach((v, k) =>
                this.setAttribute(k, v)
            );
        } else if (any.constructor !== String) return this.getAttribute(any);
        else
            throw new TypeError(
                "Illegal type in .attr (" + any + ") on element " + this
            );
    } else this.setAttribute(any, val);
    return this;
};
$._.data = function (any, val) {
    if (val.constructor !== String) {
        if (any.constructor === Object) {
            new Map(Object.entries(any)).forEach(
                (v, k) => (this.dataset[k] = v)
            );
        } else if (any.constructor !== String) return this.dataset[any];
        else
            throw new TypeError(
                "Illegal type in .data (" + any + ") on element " + this
            );
    } else this.dataset[any] = val;
    return this;
};
$._.text = function (txt) {
    if (txt.constructor !== String) return this.textContent;
    this.textContent = txt;
    return this;
}; // ? innerText
$._.html = function (html) {
    if (html.constructor !== String) return this.innerHTML;
    this.innerHTML = html;
    return this;
};
//$._.css = function (css) { if (!css) return this.style.cssText; this.style.cssText = css; return this; }
$._.css = function (css, delay) {
    const isStr = css.constructor === String,
        isObj = css.constructor === Object,
        _set = () => {
            if (isObj)
                Object.keys(css).forEach(
                    (style) => (this.style[style] = css[style])
                );
            else this.style.cssText = css;
        };
    if (isStr || isObj) {
        if (!Number.isNaN(Number(delay))) setTimeout(_set, delay);
        else _set();
        return this;
    }
    return css == true ? this.style : this.style.cssText;
};
$._.class = function (cls) {
    let isStr = cls.constructor === String,
        isObj = cls.constructor === Object,
        isArr = cls.constructor === Array;
    if (isStr || isObj || isArr) {
        if (isStr) isArr = !!(cls = cls.split(" ").filter((c) => c));
        if (isArr) cls.forEach((c) => this.classList.toggle(c));
        else
            Object.keys(cls).forEach((k) => {
                let c = cls[k];
                if (c) this.classList.add(cls[k]);
                else if (c !== false) this.classList.remove(cls[k]);
            });
        return this;
    } //else return css == true ? this.style : this.style.cssText;
};
$._.add = function (o, pos, retThis) {
    const el = $.el(o);
    /*
	if safari < 10
	{
			append: _ => this.appendChild(_),
			prepend: _ => this.insertBefore(_, this.firstChild),
			before: _ => this.parentElement.insertBefore(_, this),
			after: _ => this.parentElement.insertBefore(_, this.nextSibling),
	}*/
    if (
        !["append", "prepend", "before", "after"].includes(pos) ||
        typeof this[pos] !== "function"
    )
        throw new TypeError(
            "Wrong pos in .add (" + pos + ") on element " + this
        );
    this[pos](el);
    return retThis ? this : el;
};
// example: $('body').add('append')
// alias ?
$._.push = function (o) {
    return this.add(o, "append");
};
$.win.$ = $;
$.meta = (n) => ($('meta[name="' + n + '"') || {}).content; //(n) => $(`meta[name="${n}"]`)?.content;//?


export default $;
