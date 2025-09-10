
export const NoticeSchema = {
    title: null,
    body: "",
    icon: null,
    data: {
        url: null,
        level: "info",
        delay: null, // 4, // 4000,
    },
}; // TODO Web/API/Notification

export const NoticeLevels = ["info", "success", "warning", "danger"]; // primary, secondary ?

export function Notice(notice = null) {
    let res = null;

    if (notice) {
        if (typeof notice === "string") {
            res = Object.assign({...NoticeSchema}, {body: notice});
        }
        //
        else if (typeof notice === "object" && Object.keys(notice).length) {
            res = Object.assign({...NoticeSchema}, notice);
        }
    }

    if (res?.data?.level && !NoticeLevels.includes(res.data.level)) res.data.level = NoticeLevels[0];

    return res;
}

export default Notice;
