<div align="center">

# 🚀 Vite React API Admin

> A modern API documentation browser and debugging tool built with Vite + React + TypeScript

[![React](https://img.shields.io/badge/React-19.2.5-61dafb?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.9-646cff?logo=vite)](https://vitejs.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0.12-f6d36d)](https://zustand-demo.pmnd.rs/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[English](README-en.md) | [中文](README.md)

🌐 **Live Demo**: [http://api.admin.bingchihan.top/](http://api.admin.bingchihan.top/)

</div>

---

## 📖 Introduction

**Vite React API Admin** is an **API documentation browser and debugging tool** designed for developers. It supports automatic loading of Swagger/OpenAPI documents, displaying API categories, lists, and details in a clean three-column layout, and provides complete API debugging functionality.

### ✨ Core Features

| Feature | Description |
|---------|-------------|
| 📂 **Multi-Project Management** | Configure Swagger URLs for multiple backend projects with quick switching |
| 📖 **API Documentation Browser** | Three-column layout: Category Navigation → API List → Detail Panel |
| 🧪 **API Debugging** | Send real HTTP requests and view response data in real-time |
| 🔐 **Authentication** | Built-in login functionality with automatic Bearer Token extraction and saving |
| 🔎 **Global Search** | `Ctrl/Cmd + K` shortcut to quickly locate target APIs |
| 🎨 **Theme Switching** | Multiple theme color schemes with live preview and persistent storage |
| 📱 **Responsive Design** | Adapts to desktop and mobile devices |

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/ice-deep-dream/vite-react-api-admin.git
cd vite-react-api-admin

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Visit http://localhost:5173
```

### Build

```bash
# Production build
npm run build

# Preview build results
npm run preview
```

---

## 📁 Project Structure

```
├── public/                 # Static Assets
│   ├── config.js          # Runtime Configuration
│   ├── favicon.svg        # Favicon
│   └── logo.png           # Project Logo
├── src/
│   ├── components/        # UI Components
│   │   ├── ApiDebug/      # API Debug Panel
│   │   ├── ApiExplorer/   # API Browser Components
│   │   ├── Auth/          # Authentication Components
│   │   ├── Layout/        # Layout Components
│   │   ├── Project/       # Project Management Components
│   │   ├── Search/        # Search Components
│   │   ├── Settings/      # Settings Components
│   │   └── ui/            # Common UI Components
│   ├── config/            # Configuration Files
│   ├── pages/             # Page Components
│   ├── services/          # Service Layer
│   ├── stores/            # State Management (Zustand)
│   ├── styles/            # Global Styles
│   ├── types/             # TypeScript Type Definitions
│   ├── utils/             # Utility Functions
│   ├── App.tsx            # Application Entry
│   └── main.tsx           # Render Entry
├── docs/                  # Project Documentation
│   ├── architecture-zh.md # Architecture Document (Chinese)
│   ├── architecture-en.md # Architecture Document (English)
│   ├── features-zh.md     # Features Document (Chinese)
│   └── features-en.md     # Features Document (English)
├── package.json           # Project Configuration
├── tsconfig.json          # TypeScript Configuration
├── vite.config.ts         # Vite Configuration
└── eslint.config.js       # ESLint Configuration
```

---

## 🛠️ Tech Stack

### Core Frameworks

- **[React 19](https://reactjs.org/)** - UI Framework
- **[TypeScript 6](https://www.typescriptlang.org/)** - Type Safety
- **[Vite 8](https://vitejs.dev/)** - Build Tool
- **[React Router 6](https://reactrouter.com/)** - Client-side Routing

### State Management & Tools

- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight State Management
- **[Axios](https://axios-http.com/)** - HTTP Request Library
- **[Lucide React](https://lucide.dev/)** - Icon Library
- **[Marked](https://marked.js.org/)** - Markdown Parsing

---

## 📚 Documentation

| Document | 中文 | English |
|----------|------|---------|
| Architecture | [architecture-zh.md](docs/architecture-zh.md) | [architecture-en.md](docs/architecture-en.md) |
| Features | [features-zh.md](docs/features-zh.md) | [features-en.md](docs/features-en.md) |

---

## 📝 Usage Guide

### 1. Configure Project

On first use, click the settings icon in the top-right corner to add a Swagger project:

```
Settings Panel → Click "+" → Enter project name and Swagger URL → Save & Test
```

### 2. Browse APIs

- **Left Column**: Browse API categories
- **Middle Column**: View API list (method, path, summary)
- **Right Column**: View API details and debug panel

### 3. Debug API

1. Select the API to debug
2. Fill in request parameters (Query/Path)
3. Edit Headers (optional)
4. Edit Body (POST/PUT/PATCH)
5. Click "Send" to view response

### 4. Authentication

1. Click the login button in the top navigation bar
2. Enter username, password, and captcha
3. Token is automatically saved after successful login
4. Subsequent requests automatically include Authorization Header

### 5. Global Search

- Press `Ctrl/Cmd + K` to open search panel
- Enter keywords to search APIs
- Use `↑↓` keys to navigate, `Enter` to select

---

## 🎨 Theme Switching

Click the theme icon in the top-right corner to switch between different color schemes. Theme selection is automatically saved to local storage.

---

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

<div align="center">

**Made with ❤️ by [ice-deep-dream](https://github.com/ice-deep-dream)**

</div>
