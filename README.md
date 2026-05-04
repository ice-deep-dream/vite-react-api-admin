<div align="center">

# 🚀 Vite React API Admin

> 基于 Vite + React + TypeScript 的现代化 API 文档浏览与调试工具

[![React](https://img.shields.io/badge/React-19.2.5-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.9-646cff?logo=vite)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.12-f6d36d)](https://zustand-demo.pmnd.rs/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[English](README-en.md) | [中文](README.md)

</div>

---

## 📖 简介

**Vite React API Admin** 是一款面向开发者的 **API 文档浏览与调试工具**。它支持自动加载 Swagger/OpenAPI 文档，以清晰的三栏布局展示 API 分类、列表和详情，并提供完整的 API 调试功能。

### ✨ 核心特性

| 特性 | 描述 |
|------|------|
| 📂 **多项目管理** | 支持配置多个后端项目的 Swagger 地址，快速切换 |
| 📖 **API 文档浏览** | 三栏布局：分类导航 → API 列表 → 详情面板 |
| 🧪 **API 调试** | 发送真实 HTTP 请求，实时查看响应数据 |
| 🔐 **认证管理** | 内置登录功能，自动提取并保存 Bearer Token |
| 🔎 **全局搜索** | `Ctrl/Cmd + K` 快捷键触发，快速定位目标 API |
| 🎨 **主题切换** | 多种主题配色，实时预览并持久化存储 |
| 📱 **响应式设计** | 适配桌面端和移动端 |

---

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

### 安装

```bash
# 克隆项目
git clone https://github.com/ice-deep-dream/vite-react-api-admin.git
cd vite-react-api-admin

# 安装依赖
npm install
```

### 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建

```bash
# 生产构建
npm run build

# 预览构建结果
npm run preview
```

---

## 📁 项目结构

```
├── public/                 # 静态资源
│   ├── config.js          # 运行时配置文件
│   ├── favicon.svg        # 网站图标
│   └── logo.png           # 项目 Logo
├── src/
│   ├── components/        # UI 组件
│   │   ├── ApiDebug/      # API 调试面板
│   │   ├── ApiExplorer/   # API 浏览组件
│   │   ├── Auth/          # 认证相关组件
│   │   ├── Layout/        # 布局组件
│   │   ├── Project/       # 项目管理组件
│   │   ├── Search/        # 搜索组件
│   │   ├── Settings/      # 设置组件
│   │   └── ui/            # 通用 UI 组件
│   ├── config/            # 配置文件
│   ├── pages/             # 页面组件
│   ├── services/          # 服务层
│   ├── stores/            # 状态管理 (Zustand)
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用入口
│   └── main.tsx           # 渲染入口
├── docs/                  # 项目文档
│   ├── architecture-zh.md # 项目架构文档（中文）
│   ├── architecture-en.md # 项目架构文档（英文）
│   ├── features-zh.md     # 功能明细文档（中文）
│   └── features-en.md     # 功能明细文档（英文）
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── eslint.config.js       # ESLint 配置
```

---

## 🛠️ 技术栈

### 核心框架

- **[React 19](https://reactjs.org/)** - UI 框架
- **[TypeScript 6](https://www.typescriptlang.org/)** - 类型安全
- **[Vite 8](https://vitejs.dev/)** - 构建工具
- **[React Router 6](https://reactrouter.com/)** - 客户端路由

### 状态管理 & 工具

- **[Zustand](https://zustand-demo.pmnd.rs/)** - 轻量级状态管理
- **[Axios](https://axios-http.com/)** - HTTP 请求库
- **[Lucide React](https://lucide.dev/)** - 图标库
- **[Marked](https://marked.js.org/)** - Markdown 解析

---

## 📚 文档

| 文档 | 中文 | English |
|------|------|---------|
| 项目架构 | [architecture-zh.md](docs/architecture-zh.md) | [architecture-en.md](docs/architecture-en.md) |
| 功能明细 | [features-zh.md](docs/features-zh.md) | [features-en.md](docs/features-en.md) |

---

## 📝 使用指南

### 1. 配置项目

首次使用时，点击右上角设置图标，添加 Swagger 项目：

```
设置面板 → 点击 "+" → 输入项目名称和 Swagger 地址 → 保存并测试
```

### 2. 浏览 API

- **左侧栏**: 按分类浏览 API 分组
- **中间栏**: 查看 API 列表（方法、路径、摘要）
- **右侧栏**: 查看 API 详情和调试面板

### 3. 调试 API

1. 选择要调试的 API
2. 填写请求参数（Query/Path）
3. 编辑 Headers（可选）
4. 编辑 Body（POST/PUT/PATCH）
5. 点击 "发送" 查看响应

### 4. 登录认证

1. 点击顶部导航栏的登录按钮
2. 输入用户名、密码、验证码
3. 登录成功后自动保存 Token
4. 后续请求自动携带 Authorization Header

### 5. 全局搜索

- 按 `Ctrl/Cmd + K` 打开搜索面板
- 输入关键词搜索 API
- 使用 `↑↓` 键导航，`Enter` 选择

---

## 🎨 主题切换

点击右上角主题图标，切换不同主题配色。主题选择会自动保存到本地存储。

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

<div align="center">

**Made with ❤️ by [ice-deep-dream](https://github.com/ice-deep-dream)**

</div>
