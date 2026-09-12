<script setup lang="ts">
// 统一图标渲染器:`local:` → 内联本地 SVG;其余 → iconify(内置集等离线注册完再渲,避免命中外部 CDN;非内置直接在线兜底)。
import { computed, ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { LOCAL_PREFIX, ensureCollection, isBundled, isRegistered, localSvgRaw } from './icons'

const props = withDefaults(defineProps<{
  /** 图标值:`prefix:name` 或 `local:name`。 */
  icon?: string
  /** 尺寸,数字按 px。 */
  size?: number | string
  /** 空值时的兜底图标(默认空 = 不渲染;不假设任何图标集)。 */
  fallback?: string
}>(), {
  icon: '',
  size: 18,
  fallback: '',
})

const name = computed(() => (props.icon && props.icon.trim()) || props.fallback)
const prefix = computed(() => {
  const i = name.value.indexOf(':')
  return i > 0 ? name.value.slice(0, i) : ''
})
const isLocal = computed(() => prefix.value === LOCAL_PREFIX)
const localRaw = computed(() => (isLocal.value ? localSvgRaw(name.value.slice(LOCAL_PREFIX.length + 1)) : undefined))

// 内置集须等注册完再渲染,否则 <Icon> 会回落到外部 iconify CDN;非内置直接渲染(联网兜底)。
// name 变化时作废上一轮未完成的加载:否则旧集先加载完会把 ready 置 true,新集未注册就渲染而命中 CDN。
// 用回调第三参 onCleanup 而非 onWatcherCleanup(后者 Vue 3.5+,peer 范围是 ^3.3)。
const iconifyReady = ref(false)
watch(
  name,
  (_name, _prev, onCleanup) => {
    if (!name.value || isLocal.value) return
    const p = prefix.value
    if (!isBundled(p) || isRegistered(p)) {
      iconifyReady.value = true
      return
    }
    iconifyReady.value = false
    let stale = false
    onCleanup(() => {
      stale = true
    })
    ensureCollection(p).then(() => {
      if (!stale) iconifyReady.value = true
    })
  },
  { immediate: true },
)

const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html — 本地 SVG 为注入的可信资产 -->
  <span v-if="isLocal" class="smart-icon" :style="{ width: px, height: px }" v-html="localRaw || ''" />
  <Icon v-else-if="name && iconifyReady" :icon="name" :width="px" :height="px" />
  <span v-else class="smart-icon" :style="{ width: px, height: px }" />
</template>

<style scoped>
.smart-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.smart-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
