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
    
    <!-- 分隔线 -->
    <svg v-else-if="type === 'separator'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"></line>
    </svg>
    
    <!-- 左对齐 -->
    <svg v-else-if="type === 'alignLeft'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="4" x2="4" y2="20"></line>
      <rect x="4" y="6" width="14" height="4" rx="1"></rect>
      <rect x="4" y="14" width="10" height="4" rx="1"></rect>
    </svg>
    
    <!-- 右对齐 -->
    <svg v-else-if="type === 'alignRight'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="20" y1="4" x2="20" y2="20"></line>
      <rect x="6" y="6" width="14" height="4" rx="1"></rect>
      <rect x="10" y="14" width="10" height="4" rx="1"></rect>
    </svg>
    
    <!-- 顶对齐 -->
    <svg v-else-if="type === 'alignTop'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="4" x2="20" y2="4"></line>
      <rect x="6" y="4" width="4" height="10" rx="1"></rect>
      <rect x="14" y="4" width="4" height="14" rx="1"></rect>
    </svg>
    
    <!-- 底对齐 -->
    <svg v-else-if="type === 'alignBottom'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="20" x2="20" y2="20"></line>
      <rect x="6" y="10" width="4" height="10" rx="1"></rect>
      <rect x="14" y="6" width="4" height="14" rx="1"></rect>
    </svg>
    
    <!-- 水平居中 -->
    <svg v-else-if="type === 'alignHCenter'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="4" x2="12" y2="20"></line>
      <rect x="6" y="6" width="12" height="4" rx="1"></rect>
      <rect x="8" y="14" width="8" height="4" rx="1"></rect>
    </svg>
    
    <!-- 垂直居中 -->
    <svg v-else-if="type === 'alignVCenter'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <rect x="6" y="6" width="4" height="12" rx="1"></rect>
      <rect x="14" y="8" width="4" height="8" rx="1"></rect>
    </svg>
    
    <!-- 水平均匀分布 - 更新图标 -->
    <svg v-else-if="type === 'distributeHorizontal' || type === 'distributeH'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 左侧竖线 -->
      <line x1="4" y1="5" x2="4" y2="19"></line>
      <!-- 中间竖线 -->
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <!-- 右侧竖线 -->
      <line x1="20" y1="5" x2="20" y2="19"></line>
      <!-- 左侧矩形 -->
      <rect x="4" y="9" width="3" height="6" rx="1"></rect>
      <!-- 中间矩形 -->
      <rect x="10.5" y="9" width="3" height="6" rx="1"></rect>
      <!-- 右侧矩形 -->
      <rect x="17" y="9" width="3" height="6" rx="1"></rect>
    </svg>
    
    <!-- 垂直均匀分布 - 更新图标 -->
    <svg v-else-if="type === 'distributeVertical' || type === 'distributeV'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 顶部横线 -->
      <line x1="5" y1="4" x2="19" y2="4"></line>
      <!-- 中间横线 -->
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <!-- 底部横线 -->
      <line x1="5" y1="20" x2="19" y2="20"></line>
      <!-- 顶部矩形 -->
      <rect x="9" y="4" width="6" height="3" rx="1"></rect>
      <!-- 中间矩形 -->
      <rect x="9" y="10.5" width="6" height="3" rx="1"></rect>
      <!-- 底部矩形 -->
      <rect x="9" y="17" width="6" height="3" rx="1"></rect>
    </svg>
    
    <!-- 清除画布 -->
    <svg v-else-if="type === 'clear'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 画布外框 -->
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <!-- 叉号 -->
      <line x1="9" y1="9" x2="15" y2="15"></line>
      <line x1="15" y1="9" x2="9" y2="15"></line>
    </svg>
    
    <!-- 导出图片 -->
    <svg v-else-if="type === 'export'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 画布外框 -->
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <!-- 图片标志 -->
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    
    <!-- 保存画布 -->
    <svg v-else-if="type === 'save'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 软盘形状 -->
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <!-- 中间的矩形 -->
      <rect x="7" y="3" width="10" height="7"></rect>
      <!-- 底部的矩形 -->
      <rect x="7" y="13" width="10" height="5"></rect>
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
  // 工具栏图标
  | 'bold' | 'italic' | 'underline' | 'fontSize' | 'fontColor'
  // 连线样式图标
  | 'lineWidth' | 'lineColor' | 'lineStyle' | 'arrowStyle'
  // 对齐图标
  | 'alignLeft' | 'alignRight' | 'alignTop' | 'alignBottom' | 'alignHCenter' | 'alignVCenter'
  // 分布图标
  | 'distributeHorizontal' | 'distributeVertical' | 'distributeH' | 'distributeV'
  // 画布工具图标
  | 'clear' | 'export' | 'save'
  // 分隔线
  | 'separator' | 'divider'
  // 左侧栏控件图标
  | 'textLabel' | 'roundedRect'
  // 新增节点类型
  | 'inputNode' | 'topBottomNode' | 'leftRightNode' | 'outputNode'

const { type } = defineProps<Props>()
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