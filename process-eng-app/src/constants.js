// src/constants.js
const DESCRIPTION_MAX_CHARS = 60;
const GENERAL_STRING_MAX_CHARS = 30;
const SN_PREFIX_MAX_CHARS = 5;
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';

const constants = {
    DESCRIPTION_MAX_CHARS,
    GENERAL_STRING_MAX_CHARS,
    SN_PREFIX_MAX_CHARS,
    API_BASE
};

export default constants;