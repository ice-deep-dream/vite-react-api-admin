# Project Architecture Document

> **Project Name**: Vite React API Admin  
> **Version**: 1.0.0  
> **Last Updated**: 2026-05-04

---

## 📋 Table of Contents

- [Application Scenarios](#-application-scenarios)
- [Project Architecture](#-project-architecture)
- [Technical Dependencies](#-technical-dependencies)
- [Project Structure](#-project-structure)

---

## 🎯 Application Scenarios

**Vite React API Admin** is an **API documentation browser and debugging tool** designed for developers, suitable for the following scenarios:

| Scenario | Description |
|----------|-------------|
| 🔍 **API Documentation Browser** | Automatically loads Swagger/OpenAPI documents and displays all API endpoints in a clear categorized view |
| 🧪 **API Debugging** | Supports sending real HTTP requests and viewing response data, status codes, and response times in real-time |
| 🔐 **Token Management** | Built-in login functionality that automatically extracts and saves Bearer Tokens for subsequent API debugging |
| 📂 **Multi-Project Management** | Supports configuring Swagger URLs for multiple backend projects with quick switching |
| 🔎 **Global Search** | Keyboard-triggered global search to quickly locate target APIs |
| 🎨 **Theme Switching** | Supports multiple theme color schemes to meet different visual preferences |

### Target Users

- **Frontend Developers**: Quickly understand backend API structure and debug interface integration
- **Backend Developers**: Self-test API endpoints and verify response data formats
- **QA Engineers**: Manually test API functionality and validate business logic
- **Technical Writers**: Browse and export API documentation structure

---

## 🏗️ Project Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────┐
│                  Application Layer (UI)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Home     │ │ API Detail│ │ Settings/Login/  │ │
│  │ Page     │ │ Panel    │ │ Search           │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                State Management Layer             │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ apiStore │ │authStore │ │ themeStore/...   │ │
│  │ (Zustand)│ │(Zustand) │ │   (Zustand)      │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────┤
│                Service Layer                      │
│  ┌──────────────────┐ ┌───────────────────────┐ │
│  │ OpenAPI Parser   │ │ Runtime Config        │ │
│  │ (Doc Parsing)    │ │ (API URL Config)      │ │
│  └──────────────────┘ └───────────────────────┘ │
├─────────────────────────────────────────────────┤
│                Build Tool Layer                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ Vite     │ │ TypeScript│ │ ESLint          │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

### Architecture Design Principles

1. **Componentization**: Split components by functionality, maintaining single responsibility
2. **Centralized State**: Use Zustand for global state management
3. **Type Safety**: Comprehensive TypeScript usage with complete type definitions
4. **Route-Driven**: URL and API state synchronization via React Router
5. **Configurable**: Runtime configuration of API service URLs

### Core Modules

| Module | Path | Responsibility |
|--------|------|----------------|
| **API Data Management** | `src/stores/apiStore.ts` | API list, categories, currently selected API state |
| **Authentication** | `src/stores/authStore.ts` | Token storage, login state management |
| **Theme Management** | `src/stores/themeStore.ts` | Theme switching, CSS variable application |
| **OpenAPI Parser** | `src/services/openapiParser.ts` | Swagger JSON parsing, API data extraction |
| **Runtime Config** | `src/config/runtime.ts` | Dynamic API service URL configuration |
| **Component Library** | `src/components/` | UI components organized by functional modules |

---

## 📦 Technical Dependencies

### Production Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| **react** | ^19.2.5 | UI Framework |
| **react-dom** | ^19.2.5 | React DOM Rendering |
| **react-router-dom** | 6 | Client-side Routing |
| **zustand** | ^5.0.12 | Lightweight State Management |
| **axios** | ^1.15.2 | HTTP Request Library |
| **lucide-react** | ^1.8.0 | Icon Library |
| **marked** | ^18.0.3 | Markdown Parsing & Rendering |

### Development Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| **vite** | ^8.0.9 | Frontend Build Tool |
| **typescript** | ~6.0.2 | Type Checking |
| **@vitejs/plugin-react** | ^6.0.1 | Vite React Plugin |
| **eslint** | ^9.39.4 | Code Linting |
| **typescript-eslint** | ^8.58.2 | TypeScript ESLint Rules |
| **eslint-plugin-react-hooks** | ^7.1.1 | React Hooks Rules |
| **@types/react** | ^19.2.14 | React Type Definitions |
| **@types/node** | ^24.12.2 | Node.js Type Definitions |

---

## 📁 Project Structure

```
frontend/
├── public/                 # Static Assets
│   ├── config.js          # Runtime Configuration
│   ├── favicon.svg        # Favicon
│   └── logo.png           # Project Logo
├── src/
│   ├── components/        # UI Components
│   │   ├── ApiDebug/      # API Debug Panel Components
│   │   ├── ApiExplorer/   # API Browser Components
│   │   ├── Auth/          # Authentication Components
│   │   ├── Layout/        # Layout Components
│   │   ├── Project/       # Project Management Components
│   │   ├── Search/        # Search Components
│   │   ├── Settings/      # Settings Components
│   │   └── ui/            # Common UI Components
│   ├── config/            # Configuration Files
│   │   └── runtime.ts     # Runtime Configuration
│   ├── pages/             # Page Components
│   │   ├── Home.tsx       # Home Page
│   │   ├── ApiDetail.tsx  # API Detail Page
│   │   └── Settings.tsx   # Settings Page
│   ├── services/          # Service Layer
│   │   ├── openapiParser.ts      # OpenAPI Parser
│   │   └── initBackendProject.ts # Project Initialization
│   ├── stores/            # State Management
│   │   ├── apiStore.ts    # API Data State
│   │   ├── authStore.ts   # Authentication State
│   │   ├── themeStore.ts  # Theme State
│   │   └── ...            # Other States
│   ├── styles/            # Global Styles
│   ├── types/             # TypeScript Type Definitions
│   ├── utils/             # Utility Functions
│   ├── App.tsx            # Application Entry
│   └── main.tsx           # Render Entry
├── docs/                  # Project Documentation
├── package.json           # Project Configuration
├── tsconfig.json          # TypeScript Configuration
├── vite.config.ts         # Vite Configuration
└── eslint.config.js       # ESLint Configuration
```

---

*This document is auto-generated by the Vite React API Admin project*
