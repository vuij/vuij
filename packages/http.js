import Http from "../utils/http";

const http = {
    install: (app) => { //, options
        app.config.globalProperties.$http = (action, args) => new Http(action, args);
    },
};

export default http;
