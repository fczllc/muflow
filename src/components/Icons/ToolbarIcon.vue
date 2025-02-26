<template>
  <div class="toolbar-icon">
    <!-- 根据类型显示不同的图标 -->
    <svg v-if="type === 'textLabel'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7V4h16v3"></path>
      <path d="M9 20h6"></path>
      <path d="M12 4v16"></path>
    </svg>
    
    <svg v-else-if="type === 'roundedRect'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
    
    <!-- 输入节点图标 -->
    <svg v-else-if="type === 'inputNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12h8"></path>
      <path d="M21 9l-4 3 4 3V9z"></path>
      <path d="M11 5v14"></path>
    </svg>
    
    <!-- 上下连接节点图标 -->
    <svg v-else-if="type === 'topBottomNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="2"></rect>
      <line x1="12" y1="4" x2="12" y2="8"></line>
      <line x1="12" y1="16" x2="12" y2="20"></line>
    </svg>
    
    <!-- 左右连接节点图标 -->
    <svg v-else-if="type === 'leftRightNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="4" width="8" height="16" rx="2"></rect>
      <line x1="4" y1="12" x2="8" y2="12"></line>
      <line x1="16" y1="12" x2="20" y2="12"></line>
    </svg>
    
    <!-- 输出节点图标 -->
    <svg v-else-if="type === 'outputNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12h-8"></path>
      <path d="M3 9l4 3-4 3V9z"></path>
      <path d="M13 5v14"></path>
    </svg>
    
    <!-- 默认图标 -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  </div>
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
  // 新增节点类型
  | 'inputNode' | 'topBottomNode' | 'leftRightNode' | 'outputNode'

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

svg {
  color: #555;
}
</style>

<script lang="ts">
export default defineComponent({
  name: 'ToolbarIcon'
})
</script> 