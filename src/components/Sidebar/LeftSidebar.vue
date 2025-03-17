<template>
  <div class="left-sidebar">
    <!-- 文字标签控件 -->
    <button 
      class="sidebar-btn" 
      draggable="true"
      @dragstart="onDragStart($event, 'textLabel')" 
      title="文本"
    >
      <ToolbarIcon type="textLabel" />
    </button>

    <!-- 圆角矩形节点控件 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'roundedRect')" 
      title="节点"
    >
      <ToolbarIcon type="roundedRect" />
    </button>

    <!-- 直线控件 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'line')" 
      title="直线"
    >
      <ToolbarIcon type="line" />
    </button>

        <!-- 起止控件 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'startEnd')" 
      title="起止节点"
    >
      <ToolbarIcon type="startEnd" />
    </button>

    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'condition')" 
      title="条件节点"
    >
      <ToolbarIcon type="condition" />
    </button>

    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'circle')" 
      title="圆形节点"
    >
      <ToolbarIcon type="circle" />
    </button>
    <!-- 添加画布工具到底部 -->
    <div class="canvas-tools-wrapper">
      <CanvasTools />
    </div>
  </div>
</template>

<script setup lang="ts">
import ToolbarIcon from '../Icons/ToolbarIcon.vue'
import CanvasTools from '../Toolbar/CanvasTools.vue'

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
    }
    
    button.addEventListener('dragend', handleDragEnd)
  }
}
</script>

<style scoped>
.left-sidebar {
  width: 40px;
  height: 100%;
  padding: 8px 0;
  border-right: 1px solid var(--border-color);
  background: var(--background-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  outline: none; /* 移除焦点轮廓 */
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

/* 添加画布工具容器样式 */
.canvas-tools-wrapper {
  margin-top: auto;
  padding-bottom: 8px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LeftSidebar'
})
</script> 