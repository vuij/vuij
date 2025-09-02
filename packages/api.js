import Http from "../utils/http";
// import catcher from "../packages/catcher";

const api = {
    install: (app, options) => {
        const vm = app.config.globalProperties;

        // if (!vm.$catcher) app.use(catcher); // ?

        const http = new Http(options.baseUri, options);
        /**
         * specific for rest (json) api
         * @param {*} action
         * @param {*} args
         * @returns
         */
        vm.$api = (action, args) => http.fetch(action, args);
        vm.$api.http = http;
        
        // vm.$api = (action, args) =>
        //     new Http(
        //         action,
        //         args,
        //         Object.assign(options, { fail: vm.$catcher })
        //     );
     
        // vm.$api.defaultOptions = options;

        app.provide('api', vm.$api);
    },
};

export default api;
