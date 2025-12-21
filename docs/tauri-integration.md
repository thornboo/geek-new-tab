# Tauri 桌面应用集成方案

> ⚠️ 该文档已弃用：项目已明确为纯 Web 应用，不再规划桌面端集成。

> 从 Web 应用到跨平台桌面应用的完整实施方案

## 目录

- [为什么选择 Tauri](#为什么选择-tauri)
- [架构设计](#架构设计)
- [项目初始化](#项目初始化)
- [核心功能集成](#核心功能集成)
- [原生能力增强](#原生能力增强)
- [打包与发布](#打包与发布)
- [最佳实践](#最佳实践)

---

## 为什么选择 Tauri

### Tauri vs Electron

| 维度 | Tauri | Electron |
|------|-------|----------|
| **运行时** | 系统 WebView | Chromium |
| **后端语言** | Rust | Node.js |
| **包体积** | **~3-5MB** | ~50-100MB |
| **内存占用** | **~100MB** | ~300-500MB |
| **安全性** | **沙箱隔离** | 需手动配置 |
| **启动速度** | **快 (< 1s)** | 慢 (~3s) |
| **生态成熟度** | 新兴 | 成熟 |
| **跨平台** | Win/Mac/Linux | Win/Mac/Linux |

**选择 Tauri 的理由:**

- **轻量级** - 包体积是 Electron 的 1/20
- **高性能** - Rust 后端,系统原生 WebView
- **高安全** - 默认沙箱隔离
- **现代化** - 与 Vite + Vue 3 完美集成

---

## 架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Application                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐         ┌──────────────────┐    │
│  │   Frontend (Vue)   │ ◄─────► │  Backend (Rust)  │    │
│  │  - UI 渲染          │  IPC    │  - 系统 API 调用  │    │
│  │  - 业务逻辑         │         │  - 文件操作       │    │
│  │  - Pinia Store     │         │  - 窗口管理       │    │
│  └────────────────────┘         └──────────────────┘    │
│           ↓                              ↓               │
│  ┌────────────────────┐         ┌──────────────────┐    │
│  │    System WebView  │         │   Tauri Core     │    │
│  │  - macOS: WKWebView│         │  - API 抽象层     │    │
│  │  - Win: WebView2   │         │  - 插件系统       │    │
│  │  - Linux: WebKitGTK│         │  - 安全沙箱       │    │
│  └────────────────────┘         └──────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
Vue 组件
   ↓
Pinia Store
   ↓
Tauri Commands (IPC)
   ↓
Rust 后端
   ↓
系统 API (文件/窗口/剪贴板等)
```

---

## 项目初始化

### 1. 安装 Tauri CLI

```bash
# 安装 Rust (如果未安装)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 安装 Tauri CLI
npm install --save-dev @tauri-apps/cli
```

---

### 2. 初始化 Tauri 项目

```bash
# 在现有 Vue 项目中初始化
npm run tauri init
```

**配置提示:**

```
? What is your app name? geek-new-tab
? What should the window title be? Geek New Tab
? Where are your web assets located? ../dist
? What is the url of your dev server? http://localhost:5173
? What is your frontend dev command? npm run dev
? What is your frontend build command? npm run build
```

---

### 3. 项目结构

```
geek-new-tab/
├── src/                    # Vue 前端代码
├── src-tauri/              # Tauri 后端代码
│   ├── src/
│   │   └── main.rs         # Rust 主入口
│   ├── tauri.conf.json     # Tauri 配置
│   ├── Cargo.toml          # Rust 依赖
│   ├── icons/              # 应用图标
│   └── build.rs            # 构建脚本
├── package.json
└── vite.config.ts
```

---

### 4. 配置 tauri.conf.json

```json
{
  "package": {
    "productName": "Geek New Tab",
    "version": "1.0.0"
  },
  "build": {
    "distDir": "../dist",
    "devPath": "http://localhost:5173",
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "identifier": "com.geek.newtab",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": [],
      "externalBin": [],
      "copyright": "",
      "category": "Productivity",
      "shortDescription": "极客导航 - 程序员的新标签页",
      "longDescription": "",
      "deb": {
        "depends": []
      },
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "",
        "license": "",
        "useBootstrappers": false
      },
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "exists": true,
        "scope": ["$APPDATA/*", "$APPCONFIG/*"]
      },
      "window": {
        "all": false,
        "close": true,
        "hide": true,
        "show": true,
        "maximize": true,
        "minimize": true,
        "unmaximize": true,
        "unminimize": true,
        "setTitle": true,
        "setAlwaysOnTop": true
      },
      "shell": {
        "all": false,
        "open": true
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "clipboard": {
        "all": false,
        "readText": true,
        "writeText": true
      },
      "globalShortcut": {
        "all": true
      },
      "notification": {
        "all": true
      }
    },
    "windows": [
      {
        "title": "Geek New Tab",
        "width": 1200,
        "height": 800,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "transparent": false,
        "alwaysOnTop": false,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https:"
    },
    "updater": {
      "active": false
    },
    "systemTray": {
      "iconPath": "icons/icon.png",
      "iconAsTemplate": true
    }
  }
}
```

---

## 核心功能集成

### 1. Tauri Commands (Rust 后端)

```rust
// src-tauri/src/main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, Window};
use std::fs;
use std::path::PathBuf;

// 获取应用配置目录
#[tauri::command]
fn get_app_config_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    match app_handle.path_resolver().app_config_dir() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Failed to get config dir".to_string()),
    }
}

// 读取文件
#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

// 写入文件
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

// 导出数据到文件
#[tauri::command]
async fn export_data(data: String) -> Result<String, String> {
    use tauri::api::dialog::blocking::FileDialogBuilder;

    // 打开保存对话框
    let path = FileDialogBuilder::new()
        .set_title("导出数据")
        .set_file_name("geek-tab-backup.json")
        .add_filter("JSON", &["json"])
        .save_file();

    match path {
        Some(p) => {
            fs::write(&p, data).map_err(|e| e.to_string())?;
            Ok(p.to_string_lossy().to_string())
        }
        None => Err("User cancelled".to_string()),
    }
}

// 导入数据
#[tauri::command]
async fn import_data() -> Result<String, String> {
    use tauri::api::dialog::blocking::FileDialogBuilder;

    let path = FileDialogBuilder::new()
        .set_title("导入数据")
        .add_filter("JSON", &["json"])
        .pick_file();

    match path {
        Some(p) => fs::read_to_string(p).map_err(|e| e.to_string()),
        None => Err("User cancelled".to_string()),
    }
}

// 窗口控制
#[tauri::command]
fn toggle_always_on_top(window: Window) {
    let is_always_on_top = window.is_always_on_top().unwrap_or(false);
    window.set_always_on_top(!is_always_on_top).ok();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_app_config_dir,
            read_file,
            write_file,
            export_data,
            import_data,
            toggle_always_on_top
        ])
        .setup(|app| {
            // 创建系统托盘
            use tauri::CustomMenuItem;
            use tauri::SystemTray;
            use tauri::SystemTrayMenu;
            use tauri::SystemTrayMenuItem;

            let quit = CustomMenuItem::new("quit".to_string(), "退出");
            let show = CustomMenuItem::new("show".to_string(), "显示");
            let tray_menu = SystemTrayMenu::new()
                .add_item(show)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(quit);

            let tray = SystemTray::new().with_menu(tray_menu);

            app.set_activation_policy(tauri::ActivationPolicy::Regular);

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

### 2. 前端调用 Tauri Commands

```typescript
// lib/tauri.ts
import { invoke } from '@tauri-apps/api/tauri'

/**
 * 导出数据到文件
 */
export async function exportDataToFile(data: any): Promise<string> {
  const json = JSON.stringify(data, null, 2)
  return await invoke<string>('export_data', { data: json })
}

/**
 * 从文件导入数据
 */
export async function importDataFromFile(): Promise<any> {
  const json = await invoke<string>('import_data')
  return JSON.parse(json)
}

/**
 * 切换窗口置顶
 */
export async function toggleAlwaysOnTop(): Promise<void> {
  await invoke('toggle_always_on_top')
}

/**
 * 获取应用配置目录
 */
export async function getAppConfigDir(): Promise<string> {
  return await invoke('get_app_config_dir')
}
```

**在组件中使用:**

```vue
<script setup lang="ts">
import { exportDataToFile, importDataFromFile } from '@/lib/tauri'
import { useSiteStore, useSettingsStore } from '@/stores'

const siteStore = useSiteStore()
const settingsStore = useSettingsStore()

// 导出数据
async function handleExport() {
  const data = {
    customSites: siteStore.customSites,
    settings: settingsStore.settings
  }

  try {
    const path = await exportDataToFile(data)
    console.log('Exported to:', path)
  } catch (e) {
    console.error('Export failed:', e)
  }
}

// 导入数据
async function handleImport() {
  try {
    const data = await importDataFromFile()
    siteStore.customSites = data.customSites
    settingsStore.settings = data.settings
  } catch (e) {
    console.error('Import failed:', e)
  }
}
</script>

<template>
  <div>
    <Button @click="handleExport">导出数据</Button>
    <Button @click="handleImport">导入数据</Button>
  </div>
</template>
```

---

## 原生能力增强

### 1. 窗口控制

```typescript
// composables/useWindow.ts
import { appWindow } from '@tauri-apps/api/window'

export function useWindow() {
  // 最小化窗口
  async function minimize() {
    await appWindow.minimize()
  }

  // 最大化窗口
  async function maximize() {
    await appWindow.maximize()
  }

  // 切换最大化
  async function toggleMaximize() {
    const isMaximized = await appWindow.isMaximized()
    if (isMaximized) {
      await appWindow.unmaximize()
    } else {
      await appWindow.maximize()
    }
  }

  // 关闭窗口
  async function close() {
    await appWindow.close()
  }

  // 隐藏窗口
  async function hide() {
    await appWindow.hide()
  }

  // 显示窗口
  async function show() {
    await appWindow.show()
  }

  // 置顶窗口
  async function setAlwaysOnTop(onTop: boolean) {
    await appWindow.setAlwaysOnTop(onTop)
  }

  return {
    minimize,
    maximize,
    toggleMaximize,
    close,
    hide,
    show,
    setAlwaysOnTop
  }
}
```

**自定义标题栏:**

```vue
<!-- components/layout/CustomTitleBar.vue -->
<script setup lang="ts">
import { useWindow } from '@/composables/useWindow'

const { minimize, toggleMaximize, close } = useWindow()
</script>

<template>
  <div class="title-bar" data-tauri-drag-region>
    <div class="title-bar__logo">
      <img src="/logo.svg" alt="Logo" />
      <span>Geek New Tab</span>
    </div>

    <div class="title-bar__actions">
      <button class="title-bar__btn" @click="minimize">
        <Icon icon="mdi:minus" />
      </button>
      <button class="title-bar__btn" @click="toggleMaximize">
        <Icon icon="mdi:window-maximize" />
      </button>
      <button class="title-bar__btn title-bar__btn--close" @click="close">
        <Icon icon="mdi:close" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  height: 32px;
  background: var(--title-bar-bg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
  user-select: none;
}

.title-bar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-bar__actions {
  display: flex;
  gap: 4px;
}

.title-bar__btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.title-bar__btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.title-bar__btn--close:hover {
  background: #e81123;
  color: #fff;
}
</style>
```

---

### 2. 系统托盘

```rust
// src-tauri/src/main.rs (系统托盘事件处理)
use tauri::{Manager, SystemTrayEvent};

fn main() {
    tauri::Builder::default()
        .system_tray(tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

### 3. 全局快捷键

```typescript
// composables/useGlobalShortcut.ts
import { register, unregister } from '@tauri-apps/api/globalShortcut'

export function useGlobalShortcut() {
  // 注册全局快捷键
  async function registerShortcut(shortcut: string, handler: () => void) {
    try {
      await register(shortcut, handler)
      console.log(`Registered global shortcut: ${shortcut}`)
    } catch (e) {
      console.error('Failed to register shortcut:', e)
    }
  }

  // 取消注册
  async function unregisterShortcut(shortcut: string) {
    try {
      await unregister(shortcut)
      console.log(`Unregistered global shortcut: ${shortcut}`)
    } catch (e) {
      console.error('Failed to unregister shortcut:', e)
    }
  }

  return {
    registerShortcut,
    unregisterShortcut
  }
}
```

**使用示例:**

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useGlobalShortcut } from '@/composables/useGlobalShortcut'
import { appWindow } from '@tauri-apps/api/window'

const { registerShortcut, unregisterShortcut } = useGlobalShortcut()

onMounted(async () => {
  // 注册 Ctrl+Shift+G 显示/隐藏窗口
  await registerShortcut('Ctrl+Shift+G', async () => {
    const isVisible = await appWindow.isVisible()
    if (isVisible) {
      await appWindow.hide()
    } else {
      await appWindow.show()
      await appWindow.setFocus()
    }
  })
})

onUnmounted(async () => {
  await unregisterShortcut('Ctrl+Shift+G')
})
</script>
```

---

### 4. 剪贴板操作

```typescript
// composables/useClipboard.ts
import { readText, writeText } from '@tauri-apps/api/clipboard'

export function useClipboard() {
  // 读取剪贴板
  async function read(): Promise<string> {
    return await readText() || ''
  }

  // 写入剪贴板
  async function write(text: string): Promise<void> {
    await writeText(text)
  }

  // 复制网站链接
  async function copySiteUrl(url: string): Promise<void> {
    await write(url)
    // TODO: 显示通知
  }

  return {
    read,
    write,
    copySiteUrl
  }
}
```

---

### 5. 桌面通知

```typescript
// composables/useNotification.ts
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/api/notification'

export function useNotification() {
  // 发送通知
  async function notify(title: string, body: string) {
    let permissionGranted = await isPermissionGranted()

    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }

    if (permissionGranted) {
      sendNotification({ title, body })
    }
  }

  // 同步完成通知
  async function notifySyncComplete(count: number) {
    await notify(
      '数据同步完成',
      `已同步 ${count} 个网站到云端`
    )
  }

  return {
    notify,
    notifySyncComplete
  }
}
```

---

## 打包与发布

### 1. 开发模式

```bash
# 启动 Tauri 开发服务器
npm run tauri dev
```

---

### 2. 生产构建

```bash
# 构建应用
npm run tauri build
```

**构建产物:**

```
src-tauri/target/release/
├── geek-new-tab              # 可执行文件 (Linux/macOS)
├── geek-new-tab.exe          # 可执行文件 (Windows)
└── bundle/
    ├── dmg/                  # macOS 安装包
    │   └── geek-new-tab_1.0.0_x64.dmg
    ├── msi/                  # Windows 安装包
    │   └── geek-new-tab_1.0.0_x64.msi
    └── deb/                  # Linux 安装包
        └── geek-new-tab_1.0.0_amd64.deb
```

---

### 3. 应用图标

**生成多尺寸图标:**

```bash
# 使用 tauri-apps/tauricon 生成
npm install -g @tauri-apps/tauricon

# 从 icon.png (1024x1024) 生成所有尺寸
tauricon ./src-tauri/icons/icon.png
```

**生成的图标:**

```
src-tauri/icons/
├── 32x32.png
├── 128x128.png
├── 128x128@2x.png
├── icon.icns       # macOS
├── icon.ico        # Windows
└── icon.png
```

---

### 4. 代码签名 (可选)

#### macOS 签名

```bash
# 申请 Apple Developer 证书
# 在 tauri.conf.json 配置
```

```json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
      }
    }
  }
}
```

#### Windows 签名

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
        "digestAlgorithm": "sha256"
      }
    }
  }
}
```

---

### 5. 自动更新 (Tauri Updater)

```rust
// src-tauri/src/main.rs
use tauri::updater::UpdaterBuilder;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            // 检查更新
            tauri::async_runtime::spawn(async move {
                match UpdaterBuilder::new().check().await {
                    Ok(update) => {
                        if update.is_update_available() {
                            println!("Update available: {}", update.latest_version());
                            update.download_and_install().await.ok();
                        }
                    }
                    Err(e) => println!("Failed to check update: {}", e),
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

---

## 最佳实践

### 1. 安全策略

```json
// tauri.conf.json
{
  "tauri": {
    "allowlist": {
      "all": false,  // 默认禁用所有 API
      "fs": {
        "scope": ["$APPDATA/*", "$APPCONFIG/*"]  // 限制文件访问范围
      }
    },
    "security": {
      "csp": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';"
    }
  }
}
```

---

### 2. 错误处理

```typescript
// 优雅降级
async function exportData() {
  try {
    if (window.__TAURI__) {
      // Tauri 环境
      await exportDataToFile(data)
    } else {
      // Web 环境 - 降级方案
      downloadAsJson(data)
    }
  } catch (e) {
    console.error('Export failed:', e)
  }
}
```

---

### 3. 性能优化

```rust
// 使用异步 Command
#[tauri::command]
async fn heavy_task() -> Result<String, String> {
    tokio::task::spawn_blocking(|| {
        // 耗时操作
        std::thread::sleep(Duration::from_secs(5));
        Ok("Done".to_string())
    })
    .await
    .map_err(|e| e.to_string())?
}
```

---

## 总结

### Tauri 集成收益

| 维度 | 收益 |
|------|------|
| **包体积** | 从 ~50MB (Web) → ~5MB (Tauri) |
| **性能** | 原生性能,启动速度 < 1s |
| **功能** | 文件系统、窗口控制、系统托盘、全局快捷键 |
| **安全** | 沙箱隔离,最小权限原则 |
| **跨平台** | 一次构建,支持 Win/Mac/Linux |

---

**相关文档:**

- [← 性能优化](./performance.md)
- [返回架构总览 →](./ARCHITECTURE.md)
