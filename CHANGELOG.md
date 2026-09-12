# 更新日志

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## 2.0.0 - 2026-09-12

**破坏性版本：组件、配置函数与文案类型统一改用 `Smart` 前缀，旧名字不再导出。升级时按下表替换导入名、模板标签与样式覆盖里的类名。**

### Changed

- 导出名改为 `Smart` 前缀，渲染器与选择器各有一个说明用途的名字：

  | 1.x | 2.0.0 |
  | --- | --- |
  | `OfflineIcon`（图标渲染器） | `SmartIcon` |
  | `IconPicker`（图标选择器） | `SmartIconPicker` |
  | `setupIconPicker`（同时配置渲染器与选择器） | `setupSmartIcon` |
  | `IconPickerLabels`（选择器文案类型） | `SmartIconPickerLabels` |
  | CSS 类 `.offline-icon` | `.smart-icon` |
  | CSS 类 `.icon-picker`、`.icon-picker-*` | `.smart-icon-picker`、`.smart-icon-picker-*` |
  | CSS 变量 `--icon-picker-*` | `--smart-icon-picker-*` |

  其余导出（`registerCollections`、`registerLocalIcons`、`preloadIcons`、`lucideCollection`、`defaultCollections`、`defaultLabels`、`LOCAL_PREFIX` 以及 `IconCollection`、`IconSetMeta`、`IconifyJSON`、`SetupOptions` 等）名字不变，组件的 props、`v-model` 值格式与渲染行为不变。
- 包描述改为「离线图标渲染器与选择器」，与包里同时提供的两个组件对应。
