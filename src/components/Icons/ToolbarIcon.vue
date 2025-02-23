<template>
  <span :class="['toolbar-icon', { active }]" v-html="getIcon()"></span>
</template>

<script setup lang="ts">
import { defineComponent, defineProps } from 'vue'

interface Props {
  type: IconType
  active?: boolean
}

type IconType = 
  // 线条样式
  | 'lineSolid' | 'lineDashed' | 'lineDotted'
  // 箭头样式
  | 'arrowNone' | 'arrowSingle' | 'arrowDouble'
  // 对齐方式
  | 'alignLeft' | 'alignRight' | 'alignTop' | 'alignBottom'
  | 'alignHCenter' | 'alignVCenter'
  | 'distributeH' | 'distributeV'
  // 分隔线
  | 'divider'
  // 画布工具
  | 'clear' | 'export' | 'save'
  // 左侧栏控件图标
  | 'textLabel' | 'roundedRect'

const props = defineProps<Props>()

const icons = {
  // 线条样式
  lineSolid: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="none" stroke="currentColor" stroke-width="2" d="M4 12h16"/>
  </svg>`,
  
  lineDashed: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2" d="M4 12h16"/>
  </svg>`,
  
  lineDotted: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2" d="M4 12h16"/>
  </svg>`,

  // 箭头样式
  arrowNone: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="none" stroke="currentColor" stroke-width="2" d="M4 12h16"/>
  </svg>`,
  
  arrowSingle: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="none" stroke="currentColor" stroke-width="2" d="M4 12h16"/>
    <path fill="currentColor" d="M16 8l4 4-4 4"/>
  </svg>`,
  
  arrowDouble: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="none" stroke="currentColor" stroke-width="2" d="M4 12h16"/>
    <path fill="currentColor" d="M16 8l4 4-4 4M8 8L4 12l4 4"/>
  </svg>`,

  // 对齐方式
  alignLeft: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M4 4h2v16H4zm4 4h12v2H8zm0 6h8v2H8z"/>
  </svg>`,
  
  alignRight: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M18 4h2v16h-2zM4 8h12v2H4zm4 6h8v2H4z"/>
  </svg>`,
  
  alignTop: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M4 4h16v2H4zm4 4h8v12H8z"/>
  </svg>`,
  
  alignBottom: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M4 18h16v2H4zm4-12h8v12H8z"/>
  </svg>`,
  
  alignHCenter: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M11 4h2v16h-2zm-7-1h16v2H4zm0 14h16v2H4z"/>
  </svg>`,
  
  alignVCenter: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M4 11h16v2H4zM8 4h2v16H8zm6 0h2v16h-2z"/>
  </svg>`,
  
  distributeH: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M4 4h2v16H4zm14 0h2v16h-2zM8 8h8v8H8z"/>
  </svg>`,
  
  distributeV: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M4 4h16v2H4zm0 14h16v2H4zM8 8h8v8H8z"/>
  </svg>`,

  // 分隔线
  divider: `<svg viewBox="0 0 2 24" width="2" height="24">
    <path fill="currentColor" d="M0 0h2v24H0z" opacity="0.2"/>
  </svg>`,

  // 画布工具
  clear: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/>
  </svg>`,
  
  export: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M21 15v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-4h2v4h14v-4h2zm-5-7L12 4 8 8h3v8h2V8h3z"/>
  </svg>`,
  
  save: `<svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4z"/>
  </svg>`,

  // 左侧栏控件图标
  textLabel: `<svg viewBox="0 0 24 24" width="24" height="24">
    <path fill="currentColor" d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"/>
  </svg>`,
  
  roundedRect: `<svg viewBox="0 0 24 24" width="24" height="24">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="7" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="7" r="1" fill="currentColor"/>
    <circle cx="17" cy="12" r="1" fill="currentColor"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>`
}

const getIcon = () => icons[props.type]
</script>

<style scoped>
.toolbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-icon:hover {
  opacity: 0.8;
}

.toolbar-icon.active {
  color: var(--primary-color);
}

:deep(svg) {
  width: 16px;
  height: 16px;
}
</style>

<script lang="ts">
export default defineComponent({
  name: 'ToolbarIcon'
})
</script> 