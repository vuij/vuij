/** see also https://github.com/lodash/lodash/blob/master/uniqueId.js */
const _glob = { _uId: 0 };
const uniqueId = (pref = "_uniqiue_id_")  => (typeof pref === "string" ? pref : "") + _glob._uId++;

export default uniqueId;
