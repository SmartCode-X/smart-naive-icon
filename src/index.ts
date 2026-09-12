export { default as SmartIconPicker } from './SmartIconPicker.vue'
export { default as SmartIcon } from './SmartIcon.vue'
export {
  LOCAL_PREFIX,
  registerCollections,
  getCollections,
  isBundled,
  isRegistered,
  ensureCollection,
  loadIconNames,
  preloadIcons,
  registerLocalIcons,
  getLocalIconNames,
  localSvgRaw,
  lucideCollection,
  defaultCollections,
  setupSmartIcon,
} from './icons'
export { defaultLabels } from './labels'
export type { IconCollection, IconSetMeta, SmartIconPickerLabels, IconifyJSON, SetupOptions } from './types'
