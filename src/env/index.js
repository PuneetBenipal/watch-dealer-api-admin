const REACT_APP_MOCK = 0;

let REACT_APP_API_BASE_URL = "http://localhost:5000/api";

if (process.env.NODE_ENV === "production") REACT_APP_API_BASE_URL = "https://watch-dealer-hub-server-rtgw.onrender.com/api";

export default {
    REACT_APP_MOCK,
    REACT_APP_API_BASE_URL
}
