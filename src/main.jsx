import "bootstrap/dist/css/bootstrap.min.css";
import "./css/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

console.log("MAIN: Starting app render");

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

console.log("MAIN: ReactDOM.render finished");
