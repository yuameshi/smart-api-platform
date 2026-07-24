import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import theme from "./theme";
import App from "./App";

// 应用入口文件，挂载全局提供者
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 路由提供者：启用前端路由 */}
    <BrowserRouter>
      {/* 主题提供者：应用 MUI 主题 */}
      <ThemeProvider theme={theme}>
        {/* CssBaseline：重置浏览器默认样式 */}
        <CssBaseline />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
