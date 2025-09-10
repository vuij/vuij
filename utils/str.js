export const trim = (str, char = " ") => {
    return typeof(str) === "string"
            ? str.trim().replace(new RegExp("^["+char+"]+|["+char+"]+$", "gi"), "")
            : null;
};

const str = { trim };

export default str;