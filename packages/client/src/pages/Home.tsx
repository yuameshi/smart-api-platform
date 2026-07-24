import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router";

/**
 * 首页组件
 * 包含顶部导航栏和欢迎内容区域
 */
export default function Home() {
  // 获取路由导航函数
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* ===== 顶部导航栏 ===== */}
      <AppBar position="static">
        <Toolbar>
          {/* 平台标题 */}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Smart API Platform
          </Typography>
          {/* 登录按钮，点击跳转到登录页 */}
          <Button color="inherit" onClick={() => navigate("/login")}>
            登录
          </Button>
        </Toolbar>
      </AppBar>

      {/* ===== 主内容区域 ===== */}
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", mt: 8 }}>
          {/* 平台主标题 */}
          <Typography variant="h3" component="h1" gutterBottom>
            API 交付链路自动化平台
          </Typography>
          {/* 欢迎副标题 */}
          <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
            欢迎使用 Smart API Platform
          </Typography>
          {/* 开始使用按钮，点击跳转到登录页 */}
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 4 }}
            onClick={() => navigate("/login")}
          >
            开始使用
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
