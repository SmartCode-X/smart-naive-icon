<div align="center">

# smart-naive-icon

基于 **Vue 3 + Naive UI** 的离线图标渲染器与选择器<br>
多个图标库分 Tab 浏览、零网络请求、支持本地 SVG，选中的值就是一个字符串

[![npm](https://img.shields.io/npm/v/smart-naive-icon?color=18a058)](https://www.npmjs.com/package/smart-naive-icon)
[![license](https://img.shields.io/github/license/SmartCode-X/smart-naive-icon?color=18a058)](./LICENSE)

简体中文 | [English](./README.en.md)

</div>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-dark.png">
    <img alt="smart-naive-icon 效果图" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-light.png" width="640">
  </picture>
</p>

<p align="center">
  <a href="#快速上手">快速上手</a> ·
  <a href="#常用写法">常用写法</a> ·
  <a href="#中文文案与国际化">中文文案</a> ·
  <a href="#api">API</a>
</p>

## 特性

- **多图标库**：Lucide、Ant Design、Element Plus、Phosphor……注册几个就有几个 Tab，用户在熟悉的库里挑
- **真正离线**：图标数据随你的应用一起打包，点开 Tab 时才懒加载，不会请求 Iconify 的 CDN
- **开箱即用**：内置 Lucide，装好即可使用，无需任何配置
- **跟随 Naive 主题**：亮色 / 暗色、主色、圆角自动跟随 `<n-config-provider>`，不用写一行 CSS
- **本地 SVG**：一行 `import.meta.glob` 注册项目里的 SVG，以 `local:文件名` 选用
- **在线兜底**：没有打包的图标，输入 Iconify 名称（如 `mdi:home`）也能在联网时使用
- **值就是字符串**：`v-model` 是 `lucide:rocket` 这样的字符串，直接存库，任何地方用 `<SmartIcon>` 渲染
- **轻量**：组件本体 gzip 后不到 5 KB，ESM，自带 TypeScript 类型，样式自动注入

<table>
  <tr>
    <td width="50%" align="center">
      <img alt="切换图标库" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-ant.png"><br>
      <sub><b>多图标库</b>：每个库一个 Tab，按需懒加载</sub>
    </td>
    <td width="50%" align="center">
      <img alt="本地 SVG" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-local.png"><br>
      <sub><b>本地 SVG</b>：项目自己的图标也能选</sub>
    </td>
  </tr>
</table>

## 安装

```bash
npm i smart-naive-icon
```

项目中需已安装 `vue >= 3.3`、`naive-ui >= 2.34` 和 `@iconify/vue`（4.x 或 5.x）。样式随组件自动注入，无需单独引入 CSS。

## 快速上手

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { SmartIconPicker, SmartIcon } from 'smart-naive-icon'

const icon = ref('lucide:rocket')
</script>

<template>
  <!-- ① 选择：点击弹出选择框，选中后写回 v-model -->
  <SmartIconPicker v-model="icon" />

  <!-- ② 渲染：在菜单、表格等任意位置显示保存的值 -->
  <SmartIcon :icon="icon" :size="18" />
</template>
```

<p align="center">
  <img alt="SmartIconPicker 选择器" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/trigger.png" width="560">
</p>

`v-model` 的值只有两种格式：

| 值 | 含义 |
| --- | --- |
| `lucide:rocket` | 图标库前缀 + 图标名 |
| `local:star` | 本地 SVG（`local:` + 文件名） |

直接存进数据库的字符串字段即可，前后端不需要任何额外约定。

> **提示**：把组件放在 `<n-config-provider>` 内，暗色主题和主色才会生效。组件自带文案默认是英文，中文项目请看 [中文文案与国际化](#中文文案与国际化)。上图出自本仓库的 [playground](./playground/App.vue)。

## 常用写法

### 注册更多图标库

每个注册的图标库就是选择器里的一个 Tab。图标数据不打包进本组件：每个库在你的项目里是一个独立的懒加载 chunk，第一次点开对应 Tab 时才加载（Lucide 约 85 KB gz，Phosphor 约 946 KB gz），用多少加载多少。

```bash
npm i @iconify-json/ant-design @iconify-json/ep @iconify-json/ph
```

```ts
// main.ts
import { setupSmartIcon, lucideCollection, type IconifyJSON } from 'smart-naive-icon'

setupSmartIcon({
  collections: [
    lucideCollection, // 内置，无需安装
    { prefix: 'ant-design', name: 'Ant Design',   loader: () => import('@iconify-json/ant-design/icons.json').then((m) => m.default as IconifyJSON) },
    { prefix: 'ep',         name: 'Element Plus', loader: () => import('@iconify-json/ep/icons.json').then((m) => m.default as IconifyJSON) },
    { prefix: 'ph',         name: 'Phosphor',     loader: () => import('@iconify-json/ph/icons.json').then((m) => m.default as IconifyJSON) },
  ],
})
```

`prefix` 必须与图标库一致，保存的值会带上它（如 `ant-design:home-outlined`）。全部可用的图标库见 [icon-sets.iconify.design](https://icon-sets.iconify.design)。

> 如果 `collections` 里没有 Lucide，请把 `search-icon`、`clear-icon` 换成已注册库中的图标，否则这两个图标会走在线加载。

### 本地 SVG

注册后，项目里的 SVG 会出现在「Local SVG」Tab 中，值为 `local:文件名`：

```ts
// main.ts（Vite）
import { setupSmartIcon } from 'smart-naive-icon'

setupSmartIcon({
  localIcons: import.meta.glob<string>('/src/assets/svg/*.svg', { query: '?raw', import: 'default', eager: true }),
})
// src/assets/svg/star.svg → local:star
```

- 也可以单独调用 `registerLocalIcons(map)`。注册是覆盖式的，多次调用以最后一次为准
- 非 Vite 项目自行组装 `{ 名字: SVG 字符串 }` 传入即可，组件本身不依赖 Vite
- 本地 SVG 通过 `v-html` 内联渲染，请只注册你信任的 SVG 文件

### 在菜单和表格中渲染

选出的字符串交给 `<SmartIcon>` 就能渲染，配合 Naive 的 `render` 函数使用：

```ts
import { h } from 'vue'
import type { DataTableColumns, MenuOption } from 'naive-ui'
import { SmartIcon } from 'smart-naive-icon'

interface MenuItem {
  path: string
  title: string
  icon: string // 用 SmartIconPicker 选出并存库的值，如 'lucide:house'
}

// 菜单（menus 为你的菜单数据）
const menuOptions: MenuOption[] = menus.map((m) => ({
  key: m.path,
  label: m.title,
  icon: () => h(SmartIcon, { icon: m.icon }),
}))

// 表格列
const columns: DataTableColumns<MenuItem> = [
  { key: 'icon', title: '图标', render: (row) => h(SmartIcon, { icon: row.icon, size: 18 }) },
]
```

## 中文文案与国际化

组件不依赖任何 i18n 库，所有文案都来自 `labels` prop，默认英文。只传需要改的键即可，没传的键保持默认。

中文项目可以直接复制这份文案：

```ts
// smart-icon-picker-zh.ts
import type { SmartIconPickerLabels } from 'smart-naive-icon'

export const zhLabels: SmartIconPickerLabels = {
  placeholder: '选择图标',
  title: '选择图标',
  search: '搜索图标名称…',
  local: '本地 SVG',
  online: '在线',
  onlinePlaceholder: '任意 Iconify 名称，如 mdi:home',
  use: '使用',
  offlineHint: '当前离线，未注册的在线图标无法预览',
  loading: '加载中…',
  empty: '没有匹配的图标',
  more: '还有 {n} 个，继续输入以缩小范围', // {n} 会替换为未显示的数量
}
```

```vue
<SmartIconPicker v-model="icon" :labels="zhLabels" />
```

使用 vue-i18n 时，把 `t()` 的结果用 `computed` 包起来传入，切换语言后自动更新：

```ts
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultLabels, type SmartIconPickerLabels } from 'smart-naive-icon'

const { t } = useI18n()

// 语言包中按 iconPicker.<键> 组织文案；{ n: '{n}' } 让 more 里的占位原样保留，交给组件填充
const labels = computed(() => {
  const keys = Object.keys(defaultLabels) as (keyof SmartIconPickerLabels)[]
  return Object.fromEntries(keys.map((k) => [k, t(`iconPicker.${k}`, { n: '{n}' })])) as SmartIconPickerLabels
})
```

> 组件没有全局文案配置。多处使用时，建议在项目里封装一层组件（如 `AppIconPicker.vue`）统一传入 `labels`。

## 行为说明

- 已注册的图标库从你自己的站点懒加载，渲染前会等图标库注册完成，不会回落到 Iconify CDN
- 未注册前缀的图标（包括「Online」Tab 中输入的名称）在联网时由 Iconify API 加载，这是唯一的网络请求来源；打开选择框时处于离线状态，「Online」Tab 会给出提示
- 搜索在当前 Tab 内按名称做不区分大小写的包含匹配；单页最多渲染 `cap`（默认 300）个图标，超出时提示继续输入
- 仅在浏览器中运行（用到 `navigator.onLine`、`v-html` 和 Iconify 的 `addCollection`），SSR / Nuxt 下请放在 `<ClientOnly>` 中渲染

## API

### setupSmartIcon

在应用入口调用一次，所有选项均可省略；不调用时只有内置的 Lucide。

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `collections` | `IconCollection[]` | `defaultCollections`（仅 Lucide） | 作为 Tab 显示的图标库 |
| `localIcons` | `Record<string, string>` | — | 本地 SVG，`{ 名字: SVG 字符串 }` 或 `import.meta.glob` 的结果 |
| `preloadPrefix` | `string` | 第一个图标库 | 启动时预加载的图标库，让首屏图标立即显示 |

`IconCollection` 的结构为 `{ prefix: string; name: string; loader: () => Promise<IconifyJSON> }`，`name` 即 Tab 标题。

### SmartIconPicker Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | 选中的图标，`prefix:name` 或 `local:name` |
| `collections` | `IconCollection[]` | 全局注册的图标库 | 本组件显示的图标库，传入后同时覆盖全局注册 |
| `local-icons` | `Record<string, string>` | — | 本地 SVG，传入后同时覆盖全局注册 |
| `labels` | `Partial<SmartIconPickerLabels>` | 英文 | 覆盖部分或全部文案，见 [文案键](#文案键) |
| `clearable` | `boolean` | `true` | 是否显示清除按钮 |
| `cap` | `number` | `300` | 单页最多渲染的图标数 |
| `search-icon` | `string` | `'lucide:search'` | 搜索框图标 |
| `clear-icon` | `string` | `'lucide:x'` | 清除按钮图标 |
| `fallback-icon` | `string` | `''` | 传给触发器内 `<SmartIcon>` 的 `fallback` |

### SmartIcon Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | `prefix:name` 或 `local:name` |
| `size` | `number \| string` | `18` | 数字按 px 处理，也可传 `'1.5em'` 等 CSS 尺寸 |
| `fallback` | `string` | `''` | `icon` 为空时改为渲染的图标 |

### 文案键

| 键 | 用途 | 默认值 |
| --- | --- | --- |
| `placeholder` | 触发器占位文字 | `Select icon` |
| `title` | 弹窗标题 | `Select icon` |
| `search` | 搜索框占位文字 | `Search icon name…` |
| `local` | 本地 SVG Tab 标题 | `Local SVG` |
| `online` | 在线 Tab 标题 | `Online` |
| `onlinePlaceholder` | 在线输入框占位文字 | `Any Iconify name, e.g. mdi:home` |
| `use` | 在线「使用」按钮 | `Use` |
| `offlineHint` | 离线时的提示 | `Offline — online icons that are not bundled cannot be previewed` |
| `loading` | 加载中 | `Loading…` |
| `empty` | 无匹配结果 | `No matching icon` |
| `more` | 超出 `cap` 时的提示，`{n}` 为剩余数量 | `{n} more — keep typing to narrow` |

### 其它导出

- `registerCollections(list)`：覆盖式注册图标库，`setupSmartIcon` 内部即调用它
- `registerLocalIcons(map)`：覆盖式注册本地 SVG
- `preloadIcons(prefix?)`：预加载某个图标库，默认第一个
- `lucideCollection`、`defaultCollections`、`defaultLabels`、`LOCAL_PREFIX`（值为 `'local'`）
- `getCollections`、`getLocalIconNames`、`localSvgRaw`、`ensureCollection`、`loadIconNames`、`isBundled`、`isRegistered`
- 类型：`IconCollection`、`IconSetMeta`、`SmartIconPickerLabels`、`IconifyJSON`、`SetupOptions`

## 本地开发

```bash
npm install
npm run dev        # 启动 playground（本页截图即来自这里）
npm run typecheck  # 类型检查
npm run build      # 构建到 dist/
```

## License

[Apache-2.0](./LICENSE)
