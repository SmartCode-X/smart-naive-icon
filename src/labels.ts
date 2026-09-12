import type { SmartIconPickerLabels } from './types'

/** 默认英文文案。消费方可通过 SmartIconPicker 的 `labels` prop 部分覆盖(如接自己的 i18n)。 */
export const defaultLabels: SmartIconPickerLabels = {
  placeholder: 'Select icon',
  title: 'Select icon',
  search: 'Search icon name…',
  local: 'Local SVG',
  online: 'Online',
  onlinePlaceholder: 'Any Iconify name, e.g. mdi:home',
  use: 'Use',
  offlineHint: 'Offline — online icons that are not bundled cannot be previewed',
  loading: 'Loading…',
  empty: 'No matching icon',
  more: '{n} more — keep typing to narrow',
}
