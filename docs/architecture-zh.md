# 项目架构文档

> **项目名称**: Vite React API Admin  
> **版本**: 1.0.0  
> **更新日期**: 2026-05-04

---

## 📋 目录

- [项目场景应用](#-项目场景应用)
- [项目架构](#-项目架构)
- [技术依赖](#-技术依赖)
- [项目结构](#-项目结构)

---

## 🎯 项目场景应用

### 应用场景

**Vite React API Admin** 是一款面向开发者的 **API 文档浏览与调试工具**，适用于以下场景：

| 场景 | 描述 |
|------|------|
| 🔍 **API 文档浏览** | 自动加载 Swagger/OpenAPI 文档，以清晰的分类视图展示所有 API 接口 |
| 🧪 **API 接口调试** | 支持发送真实 HTTP 请求，实时查看响应数据、状态码和响应时间 |
| 🔐 **Token 管理** | 内置登录功能，自动提取并保存 Bearer Token，方便后续接口调试 |
| 📂 **多项目管理** | 支持配置多个后端项目的 Swagger 地址，快速切换 |
| 🔎 **全局搜索** | 快捷键触发全局搜索，快速定位目标 API |
| 🎨 **主题切换** | 支持多种主题配色，满足不同视觉偏好 |

### 目标用户

- **前端开发者**: 快速了解后端 API 结构，调试接口对接
- **后端开发者**: 自测 API 接口，验证返回数据格式
- **测试工程师**: 手动测试 API 功能，验证业务逻辑
- **技术文档编写者**: 浏览和导出 API 文档结构

---

## 🏗️ 项目架构

### 技术栈

```
┌─────────────────────────────────────────────────┐
│                  应用层 (UI)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 首页     │ │ API 详情 │ │ 设置/登录/搜索   │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                状态管理层                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ apiStore │ │authStore │ │ themeStore/...   │ │
│  │ (Zustand)│ │(Zustand) │ │   (Zustand)      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                服务层                            │
│  ┌──────────────────┐ ┌───────────────────────┐ │
│  │ OpenAPI Parser   │ │ Runtime Config        │ │
│  │ (文档解析)       │ │ (API 地址配置)        │ │
│  └──────────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────┤
│                构建工具层                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Vite     │ │ TypeScript│ │ ESLint          │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 架构设计原则

1. **组件化**: 按功能拆分组件，保持单一职责
2. **状态集中**: 使用 Zustand 进行全局状态管理
3. **类型安全**: 全面使用 TypeScript，提供完整的类型定义
4. **路由驱动**: 基于 React Router 实现 URL 与 API 状态的同步
5. **配置化**: 支持运行时配置 API 服务地址

### 核心模块

| 模块 | 路径 | 职责 |
|------|------|------|
| **API 数据管理** | `src/stores/apiStore.ts` | API 列表、分类、当前选中 API 的状态管理 |
| **认证管理** | `src/stores/authStore.ts` | Token 存储、登录状态管理 |
| **主题管理** | `src/stores/themeStore.ts` | 主题切换、CSS 变量应用 |
| **OpenAPI 解析** | `src/services/openapiParser.ts` | Swagger JSON 解析、API 数据提取 |
| **运行时配置** | `src/config/runtime.ts` | API 服务地址动态配置 |
| **组件库** | `src/components/` | UI 组件，按功能模块组织 |

---

## 📦 技术依赖

### 生产依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| **react** | ^19.2.5 | UI 框架 |
| **react-dom** | ^19.2.5 | React DOM 渲染 |
| **react-router-dom** | 6 | 客户端路由 |
| **zustand** | ^5.0.12 | 轻量级状态管理 |
| **axios** | ^1.15.2 | HTTP 请求库 |
| **lucide-react** | ^1.8.0 | 图标库 |
| **marked** | ^18.0.3 | Markdown 解析渲染 |

### 开发依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| **vite** | ^8.0.9 | 前端构建工具 |
| **typescript** | ~6.0.2 | 类型检查 |
| **@vitejs/plugin-react** | ^6.0.1 | Vite React 插件 |
| **eslint** | ^9.39.4 | 代码检查 |
| **typescript-eslint** | ^8.58.2 | TypeScript ESLint 规则 |
| **eslint-plugin-react-hooks** | ^7.1.1 | React Hooks 规则 |
| **@types/react** | ^19.2.14 | React 类型定义 |
| **@types/node** | ^24.12.2 | Node.js 类型定义 |

---

## 📁 项目结构

```
frontend/
├── public/                 # 静态资源
│   ├── config.js          # 运行时配置文件
│   ├── favicon.svg        # 网站图标
│   └── logo.png           # 项目 Logo
├── src/
│   ├── components/        # UI 组件
│   │   ├── ApiDebug/      # API 调试面板组件
│   │   ├── ApiExplorer/   # API 浏览组件
│   │   ├── Auth/          # 认证相关组件
│   │   ├── Layout/        # 布局组件
│   │   ├── Project/       # 项目管理组件
│   │   ├── Search/        # 搜索组件
│   │   ├── Settings/      # 设置组件
│   │   └── ui/            # 通用 UI 组件
│   ├── config/            # 配置文件
│   │   └── runtime.ts     # 运行时配置
│   ├── pages/             # 页面组件
│   │   ├── Home.tsx       # 首页
│   │   ├── ApiDetail.tsx  # API 详情页
│   │   └── Settings.tsx   # 设置页
│   ├── services/          # 服务层
│   │   ├── openapiParser.ts      # OpenAPI 解析
│   │   └── initBackendProject.ts # 项目初始化
│   ├── stores/            # 状态管理
│   │   ├── apiStore.ts    # API 数据状态
│   │   ├── authStore.ts   # 认证状态
│   │   ├── themeStore.ts  # 主题状态
│   │   └── ...            # 其他状态
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 应用入口
│   └── main.tsx           # 渲染入口
├── docs/                  # 项目文档
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── eslint.config.js       # ESLint 配置
```

---

*本文档由 Vite React API Admin 项目自动生成*
