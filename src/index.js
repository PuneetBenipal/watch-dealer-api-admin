import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import App from "./App";
import "antd/dist/antd.css";
import "./index.css";
import "./App.css";

import { bootstrapMock } from "./store/bootstrapMock";

// store.dispatch(bootstrapMock());

ReactDOM.createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <App />
    </Provider>
)