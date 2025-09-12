import notify from "../packages/notify";

const catcher = {
    install: (app) => { //, options
        const vm = app.config.globalProperties;

        if (!vm.$notify) app.use(notify);

        vm.$catcher = (e) => vm.$notify({ body: e.message || "🐞", data: {level: 'danger', delay: 5000} });
    },
};

export default catcher;
