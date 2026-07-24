import { createTheme } from "@mui/material/styles";

// 全局主题配置，定义主色调、副色调和字体
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // 主色调：标准 MUI 蓝色
    },
    secondary: {
      main: "#dc004e", // 副色调：标准 MUI 粉色
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // 使用 Roboto 字体
  },
});

export default theme;
