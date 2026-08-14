import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/theme.css";
import "./index.css"; // Nếu bạn có file css chung
import "./styles/responsive.css"; // Chỉnh giao diện responsive cho điện thoại & máy tính bảng

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);