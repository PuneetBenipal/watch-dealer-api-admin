import axios from "axios";

import mock from "./mock";
import env from "../env"

// const USE_MOCK = String(process.env.REACT_APP_MOCK) === "1";
const USE_MOCK = env.REACT_APP_MOCK == 1;

const http = USE_MOCK
    ? mock
    : axios.create({ baseURL: env.REACT_APP_API_BASE_URL, timeout: 20000 });

export const setAuthToken = (token) => {
    if (USE_MOCK) return;
    if (token) http.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete http.defaults.headers.common.Authorization;
};

http.interceptors?.response?.use?.(
    (res) => res,
    (err) => Promise.reject(err)
);

export default http;
