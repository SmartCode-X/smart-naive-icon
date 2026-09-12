<div align="center">

# smart-naive-icon

An offline icon picker for **Vue 3 + Naive UI**<br>
Browse multiple icon sets by tab, zero network requests, supports local SVGs — the selected value is just a string

[![npm](https://img.shields.io/npm/v/smart-naive-icon?color=18a058)](https://www.npmjs.com/package/smart-naive-icon)
[![license](https://img.shields.io/github/license/SmartCode-X/smart-naive-icon?color=18a058)](./LICENSE)

[简体中文](./README.md) | English

</div>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-dark.png">
    <img alt="smart-naive-icon preview" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-light.png" width="640">
  </picture>
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#recipes">Recipes</a> ·
  <a href="#localization-i18n">Localization</a> ·
  <a href="#api">API</a>
</p>

## Features

- **Multiple icon sets**: Lucide, Ant Design, Element Plus, Phosphor, and more — register as many as you like and each becomes a tab, so users can pick from sets they already know
- **Truly offline**: icon data ships with your app and is lazy-loaded only when its tab is opened, with no requests to the Iconify CDN
- **Works out of the box**: Lucide is built in, so it works right after install with zero configuration
- **Follows the Naive theme**: light/dark mode, primary color, and border radius automatically follow `<n-config-provider>` — no CSS required
- **Local SVGs**: register your project's own SVGs with a single `import.meta.glob` call and pick them via `local:filename`
- **Online fallback**: for icons that aren't bundled, type an Iconify name (e.g. `mdi:home`) and use it while online
- **The value is just a string**: `v-model` holds a plain string like `lucide:rocket` that you can store directly in your database and render anywhere with `<OfflineIcon>`
- **Lightweight**: the component itself is under 5 KB gzipped, ships as ESM with built-in TypeScript types, and injects its own styles

<table>
  <tr>
    <td width="50%" align="center">
      <img alt="Switching icon sets" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-ant.png"><br>
      <sub><b>Multiple icon sets</b>: one tab per set, lazy-loaded on demand</sub>
    </td>
    <td width="50%" align="center">
      <img alt="Local SVGs" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/picker-local.png"><br>
      <sub><b>Local SVGs</b>: pick your own project icons too</sub>
    </td>
  </tr>
</table>

## Install

```bash
npm i smart-naive-icon
```

Your project needs `vue >= 3.3`, `naive-ui >= 2.34`, and `@iconify/vue` (4.x or 5.x) installed. Styles are injected automatically with the component, so there's no separate CSS to import.

## Quick start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { IconPicker, OfflineIcon } from 'smart-naive-icon'

const icon = ref('lucide:rocket')
</script>

<template>
  <!-- 1. Pick: click to open the picker; the selection is written back to v-model -->
  <IconPicker v-model="icon" />

  <!-- 2. Render: display the saved value anywhere — menus, tables, etc. -->
  <OfflineIcon :icon="icon" :size="18" />
</template>
```

<p align="center">
  <img alt="IconPicker trigger" src="https://raw.githubusercontent.com/SmartCode-X/smart-naive-icon/main/assets/trigger.png" width="560">
</p>

The `v-model` value comes in only two formats:

| Value | Meaning |
| --- | --- |
| `lucide:rocket` | icon set prefix + icon name |
| `local:star` | local SVG (`local:` + filename) |

Just store it as a plain string column in your database — no extra convention needed between frontend and backend.

> **Tip**: place the component inside `<n-config-provider>` for dark mode and the primary color to take effect. The component's built-in labels default to English; for Chinese labels see [Localization (i18n)](#localization-i18n). The screenshot above comes from this repo's [playground](./playground/App.vue).

## Recipes

### Register more icon sets

Each registered icon set becomes a tab in the picker. Icon data is not bundled into this component — each set is its own lazy-loaded chunk in your project and only loads the first time its tab is opened (Lucide is about 85 KB gz, Phosphor about 946 KB gz), so you only pay for what you use.

```bash
npm i @iconify-json/ant-design @iconify-json/ep @iconify-json/ph
```

```ts
// main.ts
import { setupIconPicker, lucideCollection, type IconifyJSON } from 'smart-naive-icon'

setupIconPicker({
  collections: [
    lucideCollection, // built in, no install needed
    { prefix: 'ant-design', name: 'Ant Design',   loader: () => import('@iconify-json/ant-design/icons.json').then((m) => m.default as IconifyJSON) },
    { prefix: 'ep',         name: 'Element Plus', loader: () => import('@iconify-json/ep/icons.json').then((m) => m.default as IconifyJSON) },
    { prefix: 'ph',         name: 'Phosphor',     loader: () => import('@iconify-json/ph/icons.json').then((m) => m.default as IconifyJSON) },
  ],
})
```

`prefix` must match the icon set, since the stored value carries it (e.g. `ant-design:home-outlined`). See [icon-sets.iconify.design](https://icon-sets.iconify.design) for the full list of available icon sets.

> If `collections` doesn't include Lucide, change `search-icon` and `clear-icon` to icons from a set you have registered — otherwise those two icons will be loaded online.

### Local SVGs

Once registered, your project's SVGs show up under the "Local SVG" tab, with the value `local:filename`:

```ts
// main.ts (Vite)
import { setupIconPicker } from 'smart-naive-icon'

setupIconPicker({
  localIcons: import.meta.glob<string>('/src/assets/svg/*.svg', { query: '?raw', import: 'default', eager: true }),
})
// src/assets/svg/star.svg → local:star
```

- You can also call `registerLocalIcons(map)` directly. Registration is overwrite-based — the last call wins
- In non-Vite projects, just assemble a `{ name: SVG string }` map yourself — the component itself has no dependency on Vite
- Local SVGs are rendered inline via `v-html`, so only register SVG files you trust

### Render in menus and tables

Hand the selected string to `<OfflineIcon>` to render it, pairing naturally with Naive's `render` functions:

```ts
import { h } from 'vue'
import type { DataTableColumns, MenuOption } from 'naive-ui'
import { OfflineIcon } from 'smart-naive-icon'

interface MenuItem {
  path: string
  title: string
  icon: string // the value picked with IconPicker and stored, e.g. 'lucide:house'
}

// Menu (menus is your menu data)
const menuOptions: MenuOption[] = menus.map((m) => ({
  key: m.path,
  label: m.title,
  icon: () => h(OfflineIcon, { icon: m.icon }),
}))

// Table column
const columns: DataTableColumns<MenuItem> = [
  { key: 'icon', title: 'Icon', render: (row) => h(OfflineIcon, { icon: row.icon, size: 18 }) },
]
```

## Localization (i18n)

The component has no dependency on any i18n library — all labels come from the `labels` prop, which defaults to English. Pass only the keys you want to change; any key you omit keeps its default.

For example, a Simplified Chinese label pack:

```ts
// icon-picker-zh.ts
import type { IconPickerLabels } from 'smart-naive-icon'

export const zhLabels: IconPickerLabels = {
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
  more: '还有 {n} 个，继续输入以缩小范围', // {n} is replaced with the number of hidden icons
}
```

```vue
<IconPicker v-model="icon" :labels="zhLabels" />
```

When using vue-i18n, wrap the result of `t()` in a `computed` so it updates automatically when the locale changes:

```ts
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultLabels, type IconPickerLabels } from 'smart-naive-icon'

const { t } = useI18n()

// Organize your locale messages under iconPicker.<key>; { n: '{n}' } keeps the placeholder in `more` literal, letting the component fill it in
const labels = computed(() => {
  const keys = Object.keys(defaultLabels) as (keyof IconPickerLabels)[]
  return Object.fromEntries(keys.map((k) => [k, t(`iconPicker.${k}`, { n: '{n}' })])) as IconPickerLabels
})
```

> The component has no global label configuration. If you use it in multiple places, consider wrapping it in a project-level component (e.g. `AppIconPicker.vue`) that supplies `labels` consistently.

## Behavior notes

- Registered icon sets are lazy-loaded from your own site; rendering waits for the set's registration to finish and never falls back to the Iconify CDN
- Icons with an unregistered prefix (including names typed into the "Online" tab) are loaded from the Iconify API while online — this is the only source of network requests; when the picker is opened offline, the "Online" tab shows a notice
- Search does a case-insensitive substring match on names within the current tab; at most `cap` icons (300 by default) are rendered per page, and going over that prompts you to keep typing
- Runs in the browser only (it uses `navigator.onLine`, `v-html`, and Iconify's `addCollection`) — under SSR / Nuxt, render it inside `<ClientOnly>`

## API

### setupIconPicker

Call once at your app's entry point; every option is optional. If you never call it, only the built-in Lucide set is available.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `collections` | `IconCollection[]` | `defaultCollections` (Lucide only) | Icon sets shown as tabs |
| `localIcons` | `Record<string, string>` | — | Local SVGs, a `{ name: SVG string }` map or the result of `import.meta.glob` |
| `preloadPrefix` | `string` | the first icon set | The icon set to preload at startup, so first-screen icons show up immediately |

`IconCollection` has the shape `{ prefix: string; name: string; loader: () => Promise<IconifyJSON> }`; `name` is the tab's title.

### IconPicker Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `v-model` | `string` | `''` | The selected icon, `prefix:name` or `local:name` |
| `collections` | `IconCollection[]` | the globally registered icon sets | Icon sets shown by this instance; passing it also overrides the global registration |
| `local-icons` | `Record<string, string>` | — | Local SVGs; passing it also overrides the global registration |
| `labels` | `Partial<IconPickerLabels>` | English | Override some or all labels; see [Label keys](#label-keys) |
| `clearable` | `boolean` | `true` | Whether to show the clear button |
| `cap` | `number` | `300` | Maximum number of icons rendered per page |
| `search-icon` | `string` | `'lucide:search'` | Search box icon |
| `clear-icon` | `string` | `'lucide:x'` | Clear button icon |
| `fallback-icon` | `string` | `''` | The `fallback` passed to the `<OfflineIcon>` inside the trigger |

### OfflineIcon Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | `''` | `prefix:name` or `local:name` |
| `size` | `number \| string` | `18` | Numbers are treated as px; you can also pass a CSS size like `'1.5em'` |
| `fallback` | `string` | `''` | The icon rendered instead when `icon` is empty |

### Label keys

| Key | Purpose | Default |
| --- | --- | --- |
| `placeholder` | Trigger placeholder text | `Select icon` |
| `title` | Dialog title | `Select icon` |
| `search` | Search box placeholder text | `Search icon name…` |
| `local` | Local SVG tab title | `Local SVG` |
| `online` | Online tab title | `Online` |
| `onlinePlaceholder` | Online input placeholder text | `Any Iconify name, e.g. mdi:home` |
| `use` | Online "Use" button | `Use` |
| `offlineHint` | Notice shown while offline | `Offline — online icons that are not bundled cannot be previewed` |
| `loading` | Loading state | `Loading…` |
| `empty` | No matching results | `No matching icon` |
| `more` | Shown when results exceed `cap`; `{n}` is the remaining count | `{n} more — keep typing to narrow` |

### Other exports

- `registerCollections(list)`: overwrite-register icon sets; `setupIconPicker` calls this internally
- `registerLocalIcons(map)`: overwrite-register local SVGs
- `preloadIcons(prefix?)`: preload an icon set, defaulting to the first one
- `lucideCollection`, `defaultCollections`, `defaultLabels`, `LOCAL_PREFIX` (value `'local'`)
- `getCollections`, `getLocalIconNames`, `localSvgRaw`, `ensureCollection`, `loadIconNames`, `isBundled`, `isRegistered`
- Types: `IconCollection`, `IconSetMeta`, `IconPickerLabels`, `IconifyJSON`, `SetupOptions`

## Development

```bash
npm install
npm run dev        # start the playground (the screenshots on this page come from here)
npm run typecheck  # type-check
npm run build      # build to dist/
```

## License

[Apache-2.0](./LICENSE)
