# Features & Workflows Document

> **Project Name**: Vite React API Admin  
> **Version**: 1.0.0  
> **Last Updated**: 2026-05-04

---

## 📋 Table of Contents

- [Feature Overview](#-feature-overview)
- [Core Feature Details](#-core-feature-details)
- [User Operation Workflows](#-user-operation-workflows)
- [Data Flow](#-data-flow)

---

## 🎯 Feature Overview

| Feature Module | Feature | Status |
|----------------|---------|--------|
| 📂 Project Management | Add/Edit/Delete/Switch Projects | ✅ Completed |
| 📖 API Browser | Categorized Display/List/Detail View | ✅ Completed |
| 🧪 API Debugging | Send Requests/View Response/Parameter Editing | ✅ Completed |
| 🔐 Authentication | Login/Logout/Token Auto-Save | ✅ Completed |
| 🔎 Global Search | Shortcut Search/Result Sorting/Quick Navigation | ✅ Completed |
| 🎨 Theme Switching | Multi-Theme/Live Preview/Persistent Storage | ✅ Completed |
| 📱 Responsive Layout | Multi-Column Layout/Collapsible Panels | ✅ Completed |

---

## 📝 Core Feature Details

### 1. Project Management

#### Description
Supports configuring Swagger/OpenAPI URLs for multiple backend projects with quick switching and management.

#### Features

| Feature | Description |
|---------|-------------|
| Add Project | Enter project name and Swagger JSON URL, automatically parse and load API data |
| Edit Project | Modify existing project name or Swagger URL |
| Delete Project | Remove project configurations no longer needed |
| Switch Project | Quickly switch between projects, automatically loading corresponding API data |
| Test Connection | Test if the Swagger URL is accessible before saving |

#### Workflow

```
User clicks settings icon
    ↓
Settings panel opens
    ↓
Click "+" to add project
    ↓
Enter project name and Swagger URL
    ↓
Click "Save & Test"
    ↓
System verifies URL → Success → Parse Swagger data → Load API list
                    ↓
                  Failed → Display error message
```

---

### 2. API Browser

#### Description
Displays all API endpoints in a clear categorized structure with multiple browsing options.

#### Features

| Feature | Description |
|---------|-------------|
| Categorized View | Auto-grouped by Swagger tags, left-side group navigation |
| API List | Middle column shows all APIs with method, path, and summary |
| Detail View | Click API to view complete info including params, request body, response format |
| Method Badges | Different HTTP methods use distinct color coding (GET green, POST blue, etc.) |
| Quick Navigation | Jump directly from list to API debug panel |

#### Component Structure

```
┌─────────────────────────────────────────────────────┐
│  Group Nav      │  API List         │  API Detail   │
│  (GroupSidebar) │  (ApiListColumn)  │ (ApiDetailPanel)│
│                │                   │                │
│  □ All APIs    │  GET /api/users   │  Request Area  │
│  □ User Mgmt   │  POST /api/users  │  Param Editor  │
│  □ Auth        │  GET /api/roles   │  Response View │
│  □ Roles       │  PUT /api/roles   │                │
│  □ Menus       │  DELETE /api/roles│                │
└─────────────────────────────────────────────────────┘
```

---

### 3. API Debugging

#### Description
Supports sending real HTTP requests and viewing response results in real-time.

#### Features

| Feature | Description |
|---------|-------------|
| Method Selection | Supports GET/POST/PUT/DELETE/PATCH |
| URL Editing | Modifiable request URL |
| Parameter Editing | Query/Path parameter key-value input |
| Headers Management | Custom request headers with global Token auto-injection |
| Body Editing | JSON format request body editing with syntax highlighting |
| Response Display | Status code, response time, response body (JSON formatted) |
| Token Auto-Save | Automatically extracts and saves Token after successful login |

#### Debug Workflow

```
Select API endpoint
    ↓
Fill request parameters
    ↓
Edit Headers (optional)
    ↓
Edit Body (POST/PUT/PATCH)
    ↓
Click "Send" button
    ↓
Send HTTP request → Wait for response
    ↓
Display response results
    ↓
If login endpoint & success → Auto-save Token
```

---

### 4. Authentication

#### Description
Built-in login functionality supporting Bearer Token authentication with automatic Token saving and management.

#### Features

| Feature | Description |
|---------|-------------|
| Login Form | Username, password, and captcha input |
| Captcha | Auto-fetch image captcha, click to refresh |
| Token Extraction | Automatically extract Token from login response |
| Token Storage | Persistent storage using Zustand |
| Auto-Injection | Subsequent requests automatically include Authorization Header |
| Logout | Clear Token and authentication state |

#### Authentication Workflow

```
Open login panel
    ↓
Enter username, password, captcha
    ↓
Click "Login"
    ↓
Send POST /api/auth/login
    ↓
Validate response → Success → Extract Token → Save to global state
                  ↓                    ↓
                Failed → Show error    Subsequent requests carry Token
```

---

### 5. Global Search

#### Description
Keyboard-triggered global search to quickly locate target APIs.

#### Features

| Feature | Description |
|---------|-------------|
| Shortcut Trigger | `Ctrl/Cmd + K` to open search panel |
| Real-time Search | Real-time API list filtering on input |
| Multi-Field Match | Supports method, path, summary, and tag search |
| Result Sorting | Sorted by relevance, most relevant results first |
| Keyboard Navigation | `↑↓` for navigation, `Enter` to select, `Esc` to close |
| Quick Navigation | Auto-navigate to corresponding API detail after selection |

---

### 6. Theme Switching

#### Description
Supports multiple theme color schemes with live preview and persistent storage.

#### Features

| Feature | Description |
|---------|-------------|
| Multi-Theme Support | Multiple carefully designed themes built-in |
| Live Preview | Theme changes take effect immediately |
| Persistence | Theme selection saved to localStorage |
| CSS Variables | Theme system implemented using CSS custom properties |

---

## 🔄 Data Flow

### API Data Loading Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Swagger    │────▶│ OpenAPI      │────▶│ apiStore     │
│  JSON URL   │     │ Parser       │     │              │
└─────────────┘     └──────────────┘     └──────────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ Extract API  │     │ Update UI    │
                    │ List & Cats  │     │ Render Pages │
                    └──────────────┘     └──────────────┘
```

### Request Debug Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ User Input   │────▶│ debugStore   │────▶│ fetch()      │
│ Params/Hdrs  │     │ Collect Data │     │ Send Request │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ Response     │
                                         │ Status/Time  │
                                         └──────────────┘
```

### Token Management Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Login       │────▶│ Extract      │────▶│ authStore    │
│ Response    │     │ Token        │     │ Save Token   │
└─────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │ Subsequent   │
                                         │ Requests     │
                                         │ Auto-Header  │
                                         └──────────────┘
```

---

## 📊 State Management Architecture

### Zustand Stores

| Store | Responsibility | Main State |
|-------|----------------|------------|
| **apiStore** | API Data Management | apiList, categories, currentApi, swaggerData |
| **authStore** | Authentication State | globalToken, tokenType |
| **themeStore** | Theme Management | currentThemeId |
| **debugStore** | Debug State | requestBody, response |
| **projectStore** | Project Info | currentProject, projects |
| **projectConfigStore** | Project Config | projects, activeProjectId |

---

*This document is auto-generated by the Vite React API Admin project*
