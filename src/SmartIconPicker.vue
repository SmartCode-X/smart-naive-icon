<script setup lang="ts">
// 离线优先图标选择器(Vue3 + Naive UI)。值契约单串 `prefix:name` / `local:name`。
// 解耦:文案走 labels prop(英文默认)、主题走 useThemeVars(跟随消费方 Naive 主题)、
// 图标集/本地SVG 走注入(collections / localIcons 或 setupSmartIcon)。
import { computed, ref, watch } from 'vue'
import { NButton, NEmpty, NInput, NModal, NScrollbar, NTab, NTabs, useThemeVars } from 'naive-ui'
import SmartIcon from './SmartIcon.vue'
import {
  LOCAL_PREFIX,
  getCollections,
  getLocalIconNames,
  loadIconNames,
  registerCollections,
  registerLocalIcons,
} from './icons'
import { defaultLabels } from './labels'
import type { IconCollection, SmartIconPickerLabels, IconSetMeta } from './types'

const model = defineModel<string>({ default: '' })
const props = withDefaults(defineProps<{
  /** 覆盖全局图标集(含 loader);传了则本组件注册它。省略用已注册的(默认 Lucide)。 */
  collections?: IconCollection[]
  /** 本地 SVG 映射,`{名字:原始SVG}` 或 import.meta.glob 结果。 */
  localIcons?: Record<string, string>
  /** 文案覆盖(接自己的 i18n)。 */
  labels?: Partial<SmartIconPickerLabels>
  clearable?: boolean
  /** 搜索框图标(默认 lucide:search)。 */
  searchIcon?: string
  /** 清除图标(默认 lucide:x)。 */
  clearIcon?: string
  /** SmartIcon 空值兜底。 */
  fallbackIcon?: string
  /** 单页可见上限,超出提示继续输入(默认 300)。 */
  cap?: number
}>(), {
  clearable: true,
  searchIcon: 'lucide:search',
  clearIcon: 'lucide:x',
  fallbackIcon: '',
  cap: 300,
})

// 传入即注册到全局(loader 才可用于渲染/懒加载)
if (props.collections) registerCollections(props.collections)
if (props.localIcons) registerLocalIcons(props.localIcons)

const L = computed<SmartIconPickerLabels>(() => ({ ...defaultLabels, ...props.labels }))

// 主题:映射 Naive 主题色 → 组件局部 CSS 变量(跟随明/暗/主色)。绑定在触发器与弹窗体两处(弹窗 teleport 到 body)。
const theme = useThemeVars()
const themeStyle = computed(() => ({
  '--smart-icon-picker-border': theme.value.borderColor,
  '--smart-icon-picker-bg': theme.value.cardColor,
  '--smart-icon-picker-text-1': theme.value.textColor1,
  '--smart-icon-picker-text-2': theme.value.textColor2,
  '--smart-icon-picker-text-3': theme.value.textColor3,
  '--smart-icon-picker-hover': theme.value.hoverColor,
  '--smart-icon-picker-primary': theme.value.primaryColor,
  '--smart-icon-picker-radius': theme.value.borderRadius,
  '--smart-icon-picker-fs-sm': theme.value.fontSizeSmall,
}))

const metas = computed<IconSetMeta[]>(() => props.collections ?? getCollections())

const LOCAL_TAB = '__local__'
const ONLINE_TAB = '__online__'

const active = ref(metas.value[0]?.prefix ?? ONLINE_TAB)
const show = ref(false)
const keyword = ref('')
const names = ref<string[]>([])
const loading = ref(false)
const onlineInput = ref('')
const isOnline = ref(true)
const cache: Record<string, string[]> = {}

const placeholderText = computed(() => props.labels?.placeholder ?? defaultLabels.placeholder)

const sourceNames = computed(() => (active.value === LOCAL_TAB ? getLocalIconNames() : names.value))
const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return k ? sourceNames.value.filter((n) => n.toLowerCase().includes(k)) : sourceNames.value
})
const visibleNames = computed(() => filtered.value.slice(0, props.cap))
const overflow = computed(() => filtered.value.length - visibleNames.value.length)
const moreText = computed(() => L.value.more.replace('{n}', String(overflow.value)))

function iconId(name: string): string {
  return active.value === LOCAL_TAB ? `${LOCAL_PREFIX}:${name}` : `${active.value}:${name}`
}

async function loadTab() {
  const prefix = active.value
  if (prefix === LOCAL_TAB || prefix === ONLINE_TAB) {
    loading.value = false
    return
  }
  if (cache[prefix]) {
    // 须显式复位:上一个 Tab 加载中途切过来时,它的 finally 因 active 已变而不会复位 loading
    names.value = cache[prefix]
    loading.value = false
    return
  }
  loading.value = true
  try {
    const list = await loadIconNames(prefix)
    cache[prefix] = list
    if (active.value === prefix) names.value = list
  } finally {
    if (active.value === prefix) loading.value = false
  }
}

watch(active, () => {
  keyword.value = ''
  loadTab()
})
watch(show, (v) => {
  if (v) {
    keyword.value = ''
    onlineInput.value = ''
    isOnline.value = navigator.onLine
    loadTab()
  }
})

function pick(name: string) {
  model.value = iconId(name)
  show.value = false
}
function pickOnline() {
  const v = onlineInput.value.trim()
  if (v) {
    model.value = v
    show.value = false
  }
}
function clear() {
  model.value = ''
}
</script>

<template>
  <div class="smart-icon-picker">
    <div class="smart-icon-picker-trigger" :class="{ empty: !model }" :style="themeStyle" @click="show = true">
      <SmartIcon v-if="model" :icon="model" :size="18" :fallback="fallbackIcon" />
      <span class="smart-icon-picker-val">{{ model || placeholderText }}</span>
      <span v-if="clearable && model" class="smart-icon-picker-clear" @click.stop="clear">
        <SmartIcon :icon="clearIcon" :size="13" />
      </span>
    </div>

    <n-modal
      v-model:show="show"
      preset="card"
      :title="L.title"
      class="smart-icon-picker-modal"
      :style="{ width: '600px', maxWidth: '94vw' }"
      :bordered="false"
    >
      <div class="smart-icon-picker-body" :style="themeStyle">
        <div class="smart-icon-picker-search">
          <n-input v-model:value="keyword" :placeholder="L.search" clearable>
            <template #prefix><SmartIcon :icon="searchIcon" :size="16" /></template>
          </n-input>
        </div>

        <n-tabs :value="active" type="line" size="small" @update:value="(v: string) => (active = v)">
          <n-tab v-for="m in metas" :key="m.prefix" :name="m.prefix" :tab="m.name" />
          <n-tab :name="LOCAL_TAB" :tab="L.local" />
          <n-tab :name="ONLINE_TAB" :tab="L.online" />
        </n-tabs>

        <!-- 高度封顶必须走内联 style,不能用 scoped class:NScrollbar 是 inheritAttrs:false 组件,
             父作用域的 [data-v-*] 不会落到 .n-scrollbar 根,scoped 选择器选不中它(class 能透传、scopeId 不能)。
             内联 style 经 $attrs 直达根 → 容器 max-height:inherit 即在框内滚动。
             常规/高屏封顶 340px(约 5 行,防弹窗随大显示器变「非常高」);矮窗(<~680px)收到 50vh 防溢出。 -->
        <n-scrollbar :style="{ maxHeight: 'min(340px, 50vh)' }">
          <!-- 在线自由输入 -->
          <div v-if="active === ONLINE_TAB" class="smart-icon-picker-online">
            <n-input v-model:value="onlineInput" :placeholder="L.onlinePlaceholder" @keyup.enter="pickOnline">
              <template #suffix>
                <SmartIcon v-if="onlineInput.trim()" :icon="onlineInput.trim()" :size="20" />
              </template>
            </n-input>
            <n-button type="primary" :disabled="!onlineInput.trim()" @click="pickOnline">{{ L.use }}</n-button>
            <p v-if="!isOnline" class="smart-icon-picker-hint">{{ L.offlineHint }}</p>
          </div>

          <!-- 图标网格 -->
          <div v-else-if="loading" class="smart-icon-picker-state">{{ L.loading }}</div>
          <n-empty v-else-if="!visibleNames.length" class="smart-icon-picker-state" :description="L.empty" />
          <template v-else>
            <div class="smart-icon-picker-grid">
              <button
                v-for="name in visibleNames"
                :key="name"
                type="button"
                class="smart-icon-picker-cell"
                :class="{ sel: model === iconId(name) }"
                :title="iconId(name)"
                @click="pick(name)"
              >
                <SmartIcon :icon="iconId(name)" :size="22" />
                <span class="smart-icon-picker-name">{{ name }}</span>
              </button>
            </div>
            <p v-if="overflow > 0" class="smart-icon-picker-more">{{ moreText }}</p>
          </template>
        </n-scrollbar>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
.smart-icon-picker-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--smart-icon-picker-border);
  border-radius: var(--smart-icon-picker-radius);
  background: var(--smart-icon-picker-bg);
  color: var(--smart-icon-picker-text-1);
  cursor: pointer;
  transition: border-color 0.2s;
}
.smart-icon-picker-trigger:hover {
  border-color: var(--smart-icon-picker-primary);
}
.smart-icon-picker-trigger.empty .smart-icon-picker-val {
  color: var(--smart-icon-picker-text-3);
}
.smart-icon-picker-val {
  flex: 1;
  min-width: 0;
  font-size: var(--smart-icon-picker-fs-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.smart-icon-picker-clear {
  display: inline-flex;
  color: var(--smart-icon-picker-text-3);
}
.smart-icon-picker-clear:hover {
  color: var(--smart-icon-picker-text-1);
}

.smart-icon-picker-search {
  margin-bottom: 8px;
}
.smart-icon-picker-state {
  padding: 40px 0;
  text-align: center;
  color: var(--smart-icon-picker-text-3);
}
.smart-icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
  padding: 8px 4px;
}
.smart-icon-picker-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  border: 1px solid transparent;
  border-radius: var(--smart-icon-picker-radius);
  background: transparent;
  color: var(--smart-icon-picker-text-2);
  cursor: pointer;
  transition: all 0.15s;
}
.smart-icon-picker-cell:hover {
  background: var(--smart-icon-picker-hover);
  color: var(--smart-icon-picker-text-1);
}
.smart-icon-picker-cell.sel {
  background: color-mix(in srgb, var(--smart-icon-picker-primary) 12%, transparent);
  border-color: var(--smart-icon-picker-primary);
  color: var(--smart-icon-picker-primary);
}
.smart-icon-picker-name {
  max-width: 100%;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.smart-icon-picker-more {
  padding: 4px 0 8px;
  text-align: center;
  font-size: var(--smart-icon-picker-fs-sm);
  color: var(--smart-icon-picker-text-3);
}
.smart-icon-picker-online {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px 4px;
}
.smart-icon-picker-hint {
  width: 100%;
  margin: 0;
  font-size: var(--smart-icon-picker-fs-sm);
  color: var(--smart-icon-picker-text-3);
}
</style>
