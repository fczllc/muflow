<template>
  <div class="resource-tools">
    <!-- 图标库按钮 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-icon-btn"
        @click="toggleIconSelector"
        :class="{ 'active': showIconSelector }"
        title="图标库"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <circle cx="15.5" cy="8.5" r="1.5"></circle>
          <circle cx="8.5" cy="15.5" r="1.5"></circle>
          <circle cx="15.5" cy="15.5" r="1.5"></circle>
        </svg>
      </button>
      <div class="tooltip" v-show="activeTooltip === 'iconSelector'">图标库</div>
    </div>
    
    <!-- 后续可添加其他资源工具按钮 -->
    
  </div>
  
  <!-- 图标选择器组件 -->
  <IconSelector 
    :is-open="showIconSelector" 
    @close="toggleIconSelector"
    @select="onIconSelect"
  />
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import IconSelector from '../Icons/IconSelector.vue'

// 从VueFlow获取添加节点的方法
const addNodes = inject('addNodes') as (nodes: any[]) => void
const saveToHistory = inject('saveToHistory') as () => void

// 控制图标选择器的显示/隐藏
const showIconSelector = ref(false)
const activeTooltip = ref('')

// 隐藏提示
const hideTooltip = () => {
  activeTooltip.value = ''
}

// 切换图标选择器显示状态
const toggleIconSelector = () => {
  showIconSelector.value = !showIconSelector.value
  hideTooltip()
}

// 处理图标选择
const onIconSelect = (iconData: { type: string, name: string }) => {
 
  // 创建新的SVG图标节点
  if (addNodes) {
    const newNode = {
      id: `svgIcon-${Date.now()}`,
      type: 'svgIcon',
      position: {
        x: 100,
        y: 100
      },
      data: {
        iconType: iconData.type,
        width: 24,
        height: 24,
        strokeWidth: 2,
        color: '#333333'
      },
      draggable: true,
      selectable: true,
      connectable: false
    }
    
    // 添加节点到画布
    addNodes([newNode])
    
    // 保存历史记录
    if (saveToHistory) {
      saveToHistory()
    }
  }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ResourceTool'
})
</script>

<style scoped>
.resource-tools {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.tool-btn-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.sidebar-icon-btn {
  width: 24px;
  height: 24px;
  padding: 4px;
  border: 0px;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.sidebar-icon-btn:hover {
  background: var(--hover-color);
}

.sidebar-icon-btn.active {
  background: var(--hover-color);
}

.tooltip {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
}

.tooltip::before {
  content: '';
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  border-width: 4px 4px 4px 0;
  border-style: solid;
  border-color: transparent rgba(0, 0, 0, 0.7) transparent transparent;
}
</style> 