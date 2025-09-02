// it's only for Options API

import _ from './utils'; // типа lodash
import $ from './utils/dom'; // типа jQ
import $date from "./utils/date";

import i18n from "./packages/i18n";
import http from "./packages/http";

import notify from "./packages/notify";
        
const vuij = {
    install: (app, options) => {

        const vm = app.config.globalProperties;

        /**
         * fakes: lodash, jQuery (really tiny)
         * @TODO сделать переопределяемыми в options.lodash ? options.dom ? .$ ?
         * 
         * this._ И this.$ в Vue заняты (это ссылка из компонента на себя самого).
         * Поэтому займём this.$_ и this.$$ соответственно
         */
        // fake-lodash
        vm.$_ = _;
        // fake-jQ
        vm.$$ = $;

        // @TODO what if is SSR? globalThis? // isClient/isServer?
        vm.$window = window;

        /**
         * helpers for work with dates
         * @TODO moment syntx ?
         */
        vm.$date = $date;

        if ( !vm.__ || typeof(options.i18n)==="object") {
            app.use(i18n, { i18n: options.i18n });
        }

        if (!vm.$http) {
            app.use(http, options.api);
        }

        if (!vm.$notify ) {
            app.use(notify);
        }

        if (typeof(options.user)==="object") {
            vm.$user = options.user;
        }

        if (typeof(options.global)==="object") {
            vm.$1 = new Proxy(options.global, {});
        }

    }
};

export default vuij;