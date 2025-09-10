/* jshint esversion: 11 */
export function cropper(e) {
    const img = e.target,
        pg = 8;

    function add({className, parent, css} = {}) {
        const el = document.createElement('div');
        if(className) el.className = className;
        if(typeof css === 'string') el.style.cssText = css;
        if(typeof css === 'object') Object.keys(css).forEach(p => el.style[p]=css[p]);
        if(parent instanceof Element) parent.append(el);
        return el;
    }
    
    if(!img._cropper) {
        //top: auto;bottom: auto;left: auto;right: auto;
        const cCss = `position: absolute;width: ${pg * 2}px;height: ${pg * 2}px;border-radius: 50%;background-color: #06f5;`,
            w = add({className: 'cr0p-wrap', parent: img.parentNode, css: `position: absolute;max-width: 100%;max-height: 100%;z-index: 999999;`}),
            f = add({className: 'cr0p', parent: w, css: `position: absolute;top: 0;left: 0;width: 100%;height: 100%;outline: rgba(0, 0, 0, 0.25) solid 100vmax;cursor: move;`});
        add({className: 'cr0p__ctrl', parent: f, css: cCss+`top: ${-pg}px;left: ${-pg}px;cursor: nwse-resize;`}).dataset.ctrlpos = "top-left";
        add({className: 'cr0p__ctrl', parent: f, css: cCss+`top: ${-pg}px;right: ${-pg}px;cursor: nesw-resize;`}).dataset.ctrlpos = "top-right";
        add({className: 'cr0p__ctrl', parent: f, css: cCss+`bottom: ${-pg}px;left: ${-pg}px;cursor: nesw-resize;`}).dataset.ctrlpos = "bottom-left";
        add({className: 'cr0p__ctrl', parent: f, css: cCss+`bottom: ${-pg}px;right: ${-pg}px;cursor: nwse-resize;`}).dataset.ctrlpos = "bottom-right";
        img.style.cssText = `position: absolute;max-width: 100%;max-height: 100%;z-index: -1;user-select: none;-webkit-user-drag: none;`;
        w.prepend(img);
    }

    const w = img.parentElement,
        f = img.nextElementSibling,
        b = w.parentElement,
        _b = {width: 0, height: 0, top: 0, left: 0, ratio: 0},
        _w = {..._b},
        _f = {..._b},
        imgRatio = img.naturalWidth / img.naturalHeight;

    let m = {},
        ratio = parseFloat(img.dataset.ratio)||0,
        scale = parseFloat(img.dataset.scale)||1;

    if(ratio<0) ratio = 0;//Math.abs?
    if(!scale || scale>1) scale = 1;

    initCropper();
    window.addEventListener('resize', () => {
        throttle(resizeCropper(), 222);
    });

    function resetFrame() {
        if(img._cropper?.client) {
            const _c = {...img._cropper.client};

            _c.scale = (_c.maxHeight < _w.height) ? _c.maxHeight / _w.height : _c.maxWidth / _w.width; 
            ['top', 'left', 'width', 'height'].forEach(key => {
                _f[key] = _c[key] / _c.scale;
            });
            _f.maxWidth = _w.width;
            _f.maxHeight = _w.height;

            setCropperInfo();
            setSizesStyle(f, _f);

                        img.style.visibility = 'visible';
        }
        // else error ?
    }

    function setWrap() {
        // 
        
        img.style.visibility = 'hidden';

        const boxStyle = window.getComputedStyle(b);

        _b.width = parseFloat(boxStyle.width);
        _b.height = parseFloat(boxStyle.height);

        const boxRatio = _b.width / _b.height;

        let maxWrapWidth = _b.width;
        let maxWrapHeight = _b.height;

        // если бокс "горизонтальнее" картинки (?) - пляшем от высоты бокса (пересчитаем ширину)
        if(boxRatio > imgRatio) {
            maxWrapWidth = maxWrapHeight  * imgRatio;
        }
        // иначе пляшем от ширины бокса (пересчитаем высоту)
        else {
            maxWrapHeight= maxWrapWidth / imgRatio;
        }

        // скейлим
        const wrapScale = 0.92;// it must be <= 1
        _w.width = maxWrapWidth * wrapScale;
        _w.height = maxWrapHeight * wrapScale;

        _w.top = (_b.height - _w.height) / 2;
        _w.left = (_b.width - _w.width) / 2;

        // set w styles
        setSizesStyle(w, _w);
        w.style.zIndex = "999";
    }

    function setFrame() {
        _f.width = _f.maxWidth = _w.width;
        _f.height = _f.maxHeight = _w.height;

        if(ratio) {
            _f.ratio = ratio;
            if(_f.width / _f.ratio > _w.height) {
                _f.width = _w.height * _f.ratio;
            }
            if(_f.height * _f.ratio > _w.width) {
                _f.height = _w.width / _f.ratio;
            }
        }

        if(scale<1) {
            _f.width = _f.width * scale;
            _f.height = _f.height * scale;
        }

        if(_w.width > _f.width) _f.left = (_w.width - _f.width) / 2;
        if(_w.height > _f.height) _f.top = (_w.height - _f.height) / 2;

        // set f styles
        setSizesStyle(f, _f);

                img.style.visibility = 'visible';
    }

    function resizeCropper() {
        setWrap();
        resetFrame();
    }

    function initCropper() {
        b.style.overflow = "hidden";

        setWrap();
        setFrame();

        // set img styles
        img.style.position = "absolute";
        img.style.zIndex = "-1";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.top = "0px";
        img.style.left = "0px";
        // img.style.maxWidth = "100%";
        // img.style.maxHeight = "100%";
        // img.style.objectFit = "contain";

        setCropperInfo();

        w.addEventListener('mousedown', start);
    }

    function throttle(f, ms){
        let shhh = false;
        return function () {
            if (shhh) return;
            f.apply(this, arguments);
            shhh = true;
            setTimeout(() => (shhh = false), ms);
        };
    }

    function start(e) {
        if(e.target.closest('.cr0p')) {
            m = {...img._cropper.client};
            m.x = 0;
            m.y = 0;
            m.d = {x: 0, y: 0};
            m.e = {x: e.x, y: e.y};
            m.pos = e.target.dataset.ctrlpos;

            document.addEventListener('mouseup', end);
            w.addEventListener('mousemove', move);
        }
        // else end(e);
    }

    function move(e) {
        if(m.e!==undefined) {
            m.x = e.x - m.e.x;
            m.y = e.y - m.e.y;

            m.d.x = m.left - m.x;
            m.d.y = m.top - m.y;

            throttle(moveFrame(), 88);
        }
    }

    function end(e) {
        m = {..._f};
        m.x = 0;
        m.y = 0;
        m.d = {x: 0, y: 0};
        m.e = undefined;
        m.pos = undefined;

        setCropperInfo();

        img.dispatchEvent(new CustomEvent('cropend', {detail: img._cropper}));

        document.removeEventListener('mouseup', end);
        w.removeEventListener('mousemove', move);
    }

    function getOrigin() {        
        const float = n => 1* n.toFixed(4),
            clientScale = _f.maxWidth / img.naturalWidth,
            origin = {scale: 1};
        
        origin.width = float(_f.width / clientScale);
        origin.height = float(_f.height / clientScale);
        origin.left = float(_f.left / clientScale);
        origin.top = float(_f.top / clientScale);
        origin.ratio = float(origin.width / origin.height);

        if(!_f.ratio) _f.ratio = _f.width / _f.height;
        // if(!_f.ratio) 

        if(_f.ratio && origin.ratio != _f.ratio) {
            if(origin.ratio < _f.ratio) {
                origin.height = float(origin.width / _f.ratio);
            }
            else {
                origin.width = float(origin.height * _f.ratio);
            }
            origin.ratio = _f.ratio;
        }

        if(origin.left + origin.width>img.naturalWidth) origin.left = img.naturalWidth - origin.width;
        if(origin.top + origin.height>img.naturalHeight) origin.top = img.naturalHeight - origin.height;

        return origin;
    }

    function setCropperInfo() {
        if(!img._cropper) {
            img._cropper = {reinit: resetFrame};
        }
        img._cropper.client = _f;
        img._cropper.origin = getOrigin();
    }

    function moveFrame() {
        if(m.e) {
            const pos = (typeof(m.pos)==="string") ? m.pos : false,
                p = pos ? pos.split('-') : [],
                isLeft = !pos || p[1] === 'left',
                isTop = !pos || p[0] === 'top',
                coef = {
                    left: isLeft ? 1 : 0,
                    width: !pos ? 0 : isLeft ? -1 : 1,
                    top: isTop ? 1 : 0,
                    height: !pos ? 0 : isTop ? -1 : 1,
                };

            _f.x = _f.left = m.left + coef.left * m.x;
            _f.y = _f.top = m.top + coef.top * m.y;

            if(!pos) {
                if(_f.x + _f.width > _w.width) _f.x = _f.left = _w.width - _f.width;
                if(_f.y + _f.height > _w.height) _f.y = _f.top = _w.height - _f.height;
            }

            // validate coords
            if(_f.x < 0) _f.x = _f.left = 0;
            if(_f.x > _w.width) _f.x = _f.left = _w.width;
            if(_f.y < 0) _f.y = _f.top = 0;
            if(_f.y > _w.height) _f.y = _f.top = _w.height;

            _f.width = m.width + coef.width * m.x;
            _f.height = m.height + coef.height * m.y;

            // validate sizes
            if(_f.width < 0) _f.width = 0;
            if(_f.x + _f.width > _w.width) _f.width = _w.width - _f.x;
            if(_f.height < 0) _f.height = 0;
            if(_f.y + _f.height > _w.height) _f.height = _w.height - _f.y;

            // validate ratio
            if(ratio) {
                let calcRatio = _f.width / _f.height;
                if(calcRatio != ratio) {
                    if(calcRatio < ratio) {
                        _f.height = _f.width / ratio;
                    }
                    else {
                        _f.width = _f.height * ratio;
                    }
                }
            }

            //bottom?right?
            setSizesStyle(f, _f);
        }
    }

    function setSizesStyle(el, ob) { 
        el.style.left = ob.left + "px";
        el.style.top = ob.top + "px";
        el.style.width = ob.width + "px";
        el.style.height = ob.height + "px";
    }
    
}

export default { cropper };