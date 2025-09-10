import { createApp } from "vue";
import { Notice } from "../utils/notice.js"; // форматирует сообщение в объект для $notify
import VuijNotifies from "../components/VuijNotifies.vue";

const notify = {
    install: (app) => { //, options

        const notifiesApp = createApp(VuijNotifies);
        notifiesApp.mount(
            document.body.appendChild(document.createElement("DIV"))
        );

        const $notify = function (notice = null) {
            notice = new Notice(notice);
            if (notice) {
                // notifiesApp._instance.setupState.push(notice);
                notifiesApp._instance.props.notifies = [notice];
                // console.warn({notifiesApp, notice});
            }
        };
        // $notify({ body: "TEST 🐞", data: {level: 'danger', delay: 3000} });

        app.config.globalProperties.$notify = $notify;
        app.provide("notify", $notify);

    },
};

export default notify;
