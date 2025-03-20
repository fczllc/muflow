<template>
  <div class="widget-tools">
    <!-- 文字标签控件 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-btn" 
        draggable="true"
        @dragstart="onDragStart($event, 'textLabel')" 
        @mouseover="showTooltip('textLabel')"
        @mouseleave="hideTooltip"
        title="文本"
      >
        <ToolbarIcon type="textLabel" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'textLabel'">文本标签</div>
    </div>

    <!-- 圆角矩形节点控件 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-btn" 
        draggable="true" 
        @dragstart="onDragStart($event, 'roundedRect')" 
        @mouseover="showTooltip('roundedRect')"
        @mouseleave="hideTooltip"
        title="节点"
      >
        <ToolbarIcon type="roundedRect" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'roundedRect'">矩形节点</div>
    </div>

    <!-- 起止控件 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-btn" 
        draggable="true" 
        @dragstart="onDragStart($event, 'startEnd')" 
        @mouseover="showTooltip('startEnd')"
        @mouseleave="hideTooltip"
        title="起止节点"
      >
        <ToolbarIcon type="startEnd" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'startEnd'">起止节点</div>
    </div>

    <!-- 条件节点控件 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-btn" 
        draggable="true" 
        @dragstart="onDragStart($event, 'condition')" 
        @mouseover="showTooltip('condition')"
        @mouseleave="hideTooltip"
        title="条件节点"
      >
        <ToolbarIcon type="condition" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'condition'">条件节点</div>
    </div>

    <!-- 圆形节点控件 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-btn" 
        draggable="true" 
        @dragstart="onDragStart($event, 'circle')" 
        @mouseover="showTooltip('circle')"
        @mouseleave="hideTooltip"
        title="圆形节点"
      >
        <ToolbarIcon type="circle" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'circle'">圆形节点</div>
    </div>

    
    <!-- 直线控件 -->
    <div class="tool-btn-wrapper">
      <button 
        class="sidebar-btn" 
        draggable="true" 
        @dragstart="onDragStart($event, 'line')" 
        @mouseover="showTooltip('line')"
        @mouseleave="hideTooltip"
        title="直线"
      >
        <ToolbarIcon type="line" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'line'">直线</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

// 提示工具状态控制
const activeTooltip = ref('')

// 显示提示
const showTooltip = (type: string) => {
  activeTooltip.value = type
}

// 隐藏提示
const hideTooltip = () => {
  activeTooltip.value = ''
}

// 处理拖拽开始事件
const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
    
    // 添加拖拽结束后移除焦点的处理
    const button = event.target as HTMLButtonElement
    
    // 使用 dragend 事件移除焦点
    const handleDragEnd = () => {
      button.blur() // 移除焦点
      button.removeEventListener('dragend', handleDragEnd)
      hideTooltip() // 拖拽结束时隐藏提示
    }
    
    button.addEventListener('dragend', handleDragEnd)
  }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'WidgetTool'
})
</script>

<style scoped>
.widget-tools {
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

.sidebar-btn {
  width: 32px;
  height: 32px;
  padding: 4px;
  border: 0px;
  border-radius: 4px;
  background: transparent;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.sidebar-btn:hover {
  background: var(--hover-color);
}

/* 移除焦点状态的轮廓 */
.sidebar-btn:focus {
  outline: none;
}

.sidebar-btn:focus-visible {
  outline: none;
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