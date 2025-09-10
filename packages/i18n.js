/* jshint esversion: 11 */
import { get } from "../utils/object"; // типа lodash

const i18n = {
    install: (app, options) => {

        let dict = {};

        // локализация
        const __ =  (key) => { // @todo add second attribute (vars?) for gettext ?
            return (
                (dict ? dict[key] : key) || get(key, dict) || key
            );
            // if(!dict?.[key]) console.log(dict, key);
            // return dict?.[key] || key;
        };
        app.config.globalProperties.__ = __;

        const $i18n = (langJson)  => dict = langJson;

        // сразу и установим базовый язык для локализации, если он был передан в main.js :: app.use(vew, {..тут })
        $i18n(options?.i18n || {});
        

        // возможность [пере]установить язык из компонента - типа this.$i18n({..другой язык});
        app.config.globalProperties.$i18n = $i18n;

        // для composition api
        app.provide("i18n", $i18n);
        app.provide("__", __);
    },
};

export default i18n;
