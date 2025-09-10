/* jshint esversion: 11 */
/*
const STATUSES = {
        '100': "Continue",
        '101': "Switching Protocol",
        '102': "Processing",
        '103': "Early Hints",
    '200': "OK",
    '201': "Created",
    '202': "Accepted",
    '203': "Non-Authoritative Information",
    '204': "No Content",
    '205': "Reset Content",
    '206': "Partial Content",
    '207': "Multi-Status",
    '208': "Already Reported",
    '226': "IM Used",
    '300': "Multiple Choice",
    '301': "Moved Permanently",
    '302': "Found",
    '303': "See Other",
    '304': "Not Modified",
    '305': "Use Proxy",
    '306': "unused",
    '307': "Temporary Redirect",
    '308': "Permanent Redirect",
    '400': "Bad Request",
    '401': "Unauthorized",
    '402': "Payment Required",
    '403': "Forbidden",
    '404': "Not Found",
    '405': "Method Not Allowed",
    '406': "Not Acceptable",
        '407': "Proxy Authentication Required",
    '408': "Request Timeout",
    '409': "Conflict",
    '410': "Gone",
    '411': "Length Required",
    '412': "Precondition Failed",
    '413': "Payload Too Large",
    '414': "URI Too Long",
    '415': "Unsupported Media Type",
    '416': "Range Not Satisfiable",
    '417': "Expectation Failed",
    '418': "I'm a teapot",
    '421': "Misdirected Request",
    '422': "Unprocessable Entity",
    '423': "Locked",
    '424': "Failed Dependency",
    '425': "Too Early",
    '426': "Upgrade Required",
    '428': "Precondition Required",
    '429': "Too Many Requests",
    '431': "Request Header Fields Too Large",
    '451': "Unavailable For Legal Reasons",
    '500': "Internal Server Error",
    '501': "Not Implemented",
    '502': "Bad Gateway",
    '503': "Service Unavailable",
    '504': "Gateway Timeout",
    '505': "HTTP Version Not Supported",
    '506': "Variant Also Negotiates",
    '507': "Insufficient Storage",
    '508': "Loop Detected",
    '510': "Not Extended",
    '511': "Network Authentication Required",
};
*/

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']; // HEAD?, OPTIONS?

const PARAMS = {
    /** Settings: */
    STRICT: false,
    // baseUri: '',
    apiToken: undefined,
    jsonRequest: undefined,
    jsonResponse: undefined, 
    //form // ->body ?
    //laravel // ?
    handler: {},
        // validatorStatus: '422', 
        // validator: undefined, //fn(errors)=>validator(errors) // ?response
    done: undefined,//r => r, //fn
    fail: undefined,//r => r, //fn
        // catcher
};

const OPTIONS_VARS = {
    cache: ['default', 'no-store', 'reload', 'no-cache', 'force-cache', 'only-if-cached'],
    credentials: ['same-origin', 'omit', 'include'],
    keepalive: [false, true],
    method: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // OPTIONS?
    mode: ['cors', 'no-cors', 'same-origin', 'navigate'], 
    // // priority: ['auto', 'how', 'low'],
    redirect: ['error', 'follow', 'manual'],
    // referrer, // ???'about:client'
    // referrerPolicy,
};

const OPTIONS = {
    /** Fetch options: */
    body: null,
    cache: 'default', // default, no-store, reload, no-cache, force-cache, only-if-cached
    credentials: 'same-origin', // same-origin, omit, include
    headers: new Headers(),
    integrity: '',
    keepalive: false,
    method: 'GET', // undefined ? // 'GET', 'POST', 'PUT', 'PATCH', 'DELETE' // OPTIONS?
    mode: 'cors',
    redirect: 'error', // follow, error, manual,
    referrer: '', // 'about:client',
    referrerPolicy: undefined,
    signal: undefined, // !!!AbortSignal
};

class Http {
    constructor(baseUri, options) {
        this.setBaseUri(baseUri ?? '');
        //
        this.options = {};
        this.params = {};

        // this.setOptions(options, {...Http._options}, {...Http._params});
        this.setParams(options, {...Http._params});
        
        //this.request = new Request(this.baseUri, this.options);
    }

    static get _params() {
        return PARAMS;
    }

    static get _vars() {
        return OPTIONS_VARS;
    }

    static get _options() {
        return OPTIONS;
    }

    static get _methods() {
        return METHODS;
    }

    static fd2obj(body) {
        return body instanceof FormData ? Object.fromEntries(body.entries()) : {};
    }

    static obj2fd(body) {
        const fd = new FormData();
        Object.keys(body).forEach(k => {
            fd.append(k, body[k]); // TODO if obj
        });
        return fd;
    }

    static _findOrFirst(needle, haystack) {
        if(!Array.isArray(haystack)) haystack = [];
        return haystack.includes(needle) ? needle : haystack[0];
    }

    static _pather(p, b = '/') {
        return b + (
            typeof p === 'string'
                ? p.split('/').map(p => p?.trim()).filter(p => !!p).join('/')
                : ''
        );
    }

    static _error(error = '', entity) {
        if(!error) error = 'unknown error';
        console.error(error, {entity});
        return new Error(error);
    }

    setBaseUri(baseUri) { // string baseUri = ''
        if (!(baseUri instanceof URL)) {
            if (typeof baseUri !== 'string') {
                throw Http._error('baseUri must be type of string OR URL', baseUri);
            }

            baseUri = new URL(baseUri, window.location.origin);
        }
        this.baseUri = baseUri;
    }

    setParams(params, _params) {
        params = Object.assign({}, params);
        _params = Object.assign({}, _params);
        this.params = Object.assign({}, this.params);

        Object.keys(_params)
            .forEach(k => {
                this.params[k] = params[k] && (typeof params[k] === typeof _params[k] || _params[k] === undefined) ? params[k] : _params[k];
            });
    }

    setUrl(url) {
        if (!(url instanceof URL)) {
            if (typeof url !== 'string') {
                throw Http._error('url must be type of string OR URL', url);
            }

            try {
                url = new URL(url);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            catch (_e) {
                // // url = new URL(this.baseUri.href + Http._pather(url)); // what about ?search=params // .searchParams.append(?)
                const _url = new URL(this.baseUri),
                    [_pathname, _search] = url.split('?');
                _url.pathname += _pathname; // Http._pather ?
                if(_search) {
                    
                    _url.search = _search;// .searchParams.append(?)
                }
                url = _url;
            }
        }
        
        this.url = url;
    }

    getMethod(method) {
        return Http._findOrFirst(String(method).toUpperCase(), Http._methods);
    }

    setMethod(method) {
        this.options.method = this.getMethod(method);
    }

    setHeaders(headers) {
        if(!(this.options.headers instanceof Headers)) this.options.headers = new Headers();

        if(!(headers instanceof Headers)) {
            headers = new Headers((typeof headers === 'object') ? headers : {}); //Record<ByteString, ByteString>
        }
        headers.entries().forEach(([k,v])=>{
            this.options.headers.set(k, v);
        });

    }

    correctHeaders() {
        if(!this.params.STRICT) {
            if(!!this.params.apiToken) { // && typeof 'string'
                if(this.params.jsonRequest===undefined) console.warn('this.params.jsonRequest = true');//this.params.jsonRequest = true;
                if(this.params.jsonResponse===undefined) this.params.jsonResponse = true;

                this.options.headers.set('authorization', 'Bearer ' + this.params.apiToken);
            }

            // if(this.params.jsonRequest && this.options.headers.get('content-type') !== 'application/json') this.options.headers.set('content-type', 'application/json');
            // if(!this.params.jsonRequest && this.options.headers.get('content-type') === 'application/json') this.params.jsonRequest = true;
            if(this.params.jsonRequest) this.options.headers.set('content-type', 'application/json');

            if(this.params.jsonResponse && this.options.headers.get('accept') !== 'application/json') this.options.headers.set('accept', 'application/json');
            // if(!this.params.jsonResponse && this.options.headers.get('accept') === 'application/json') this.params.jsonResponse = true;
        }
        // else throw
    }

    getRequest(url, options) {
        return new Request(url, options);
    }

    setRequest(url, options) { // baseRequest ?
        this.request = this.getRequest(url, options);
    }

    //updRequest() { let request = this.request?.clone() }

    setOptions(options, _options, _params) {

        if(_params) this.setParams(options, _params);

        options = Object.assign({}, options);
        _options = Object.assign({}, _options);
        this.options = Object.assign({}, this.options);

        this.setMethod(options.method);
        this.setHeaders(options.headers);

        // console.warn({options, _options});

        Object.keys(_options)
            .filter(k => !['method', 'headers', 'body'].includes(k))
            .forEach(k => {
                let option;

                if(options[k] && Object.keys(Http._vars).includes(k)) option = Http._findOrFirst(options[k], Http._vars[k]);
                else {
                    // if STRICT && typeof options[k] !== typeof _options[k] throw
                    option = options[k] && typeof options[k] === typeof _options[k] ? options[k] : _options[k];
                }
                
                this.options[k] = option;
            })


        this.setCorrectBody(options.body);

        
    }
    

    setCorrectBody(body) {
        let _body = body;

        /*
        const isForm = body instanceof HTMLFormElement,
            hasFiles = isForm && !![...body.elements].filter(i => i.files).length;
        
        if(hasFiles) { // html way 
            // body.enctype = 'multipart/form-data';
            if(this.options.headers.get('content-type') && !this.options.headers.get('content-type').startsWith('multipart/form-data')) this.options.headers.delete('content-type');
            this.params.jsonRequest = false;
        }
        else if(this.options.headers.get('content-type')==='application/x-www-form-urlencoded') this.params.jsonRequest = false;
        else if(this.options.headers.get('content-type')==='application/json') this.params.jsonRequest = true;
        */

        console.log('setCorrectBody BEFORE', { _body, params: this.params, options: this.options});

        if(!_body) _body = undefined;
        else {
            if(this.params.STRICT) {
                if(this.options.method === 'GET') throw Http._error('Request with GET method cannot have body.', _body);
                if(this.params.jsonRequest && typeof body !== 'string') throw Http._error('jsonRequest does expect a stringify body.', _body);
                if(!this.params.jsonRequest && !(body instanceof FormData)) throw Http._error('non-jsonRequest does expect FormData as body.', _body);
                // files?
            }
            else {
                // if(!!_body && this.options.method === 'GET') {
                //     this.options.method === 'POST';
                // }

                    // if(this.options.method === 'GET') {
                    //     //this.mergeSearchParams(_body) //this.url.searchParams
                    //     _body = undefined;
                    // }

                if(this.options.method !== 'GET' && this.options.method !== 'HEAD') {
                    if(this.params.jsonRequest && typeof _body !== 'string') {
                        if(_body instanceof HTMLFormElement) _body = new FormData(_body);
                        if(_body instanceof FormData) _body = Http.fd2obj(_body);
                        _body = JSON.stringify(_body);
                        alert('wtf?');
                    }

                    if(!this.params.jsonRequest && !(_body instanceof FormData)) {
                        if(_body instanceof HTMLFormElement) _body = new FormData(_body);
                        else if(typeof _body === 'object') _body = Http.obj2fd(_body);
                        else if(typeof _body === 'string') _body = Http.obj2fd(JSON.parse(_body));
                        else throw Http._error('non-jsonRequest does expect FormData as body.', _body);
                        
                        this.params.jsonRequest = false;
                    }
                    // files?

                    // LARAVEL way
                    if(!this.params.jsonRequest && this.options.method !== 'POST') {
                        _body.append('_method', this.options.method);
                        this.options.method = 'POST';
                    }

                }

            }

        }

        this.correctHeaders();
        this.options.body = _body;
    }

    async fetch(url, options) {
        this.setUrl(url);

        
        this.setOptions(options, this.options, options);//, this.params)

        //const request = new Request(url, this.options);// updRequest(url, this.options)
        let res = fetch(this.url, this.options).then(r => {
        // let res = await fetch(request).then(r => {
            //  handler, validator
            if(typeof this.params?.handler?.[String(r.status)] === 'function') {
                return this.params.handler[String(r.status)](r);
            } 
            if(!r.ok && typeof this.params?.fail === 'function') {
                return this.params.fail(r);
            } 
            if(r.ok && typeof this.params?.done === 'function') {
                return this.params.done(r); // if !STRICT && jsonResponse => check / fake json ?
            } 

            return r;
        });

        return await (this.params.jsonResponse) ? res.then(r => r.json()) : res;
    }
}

export default Http;