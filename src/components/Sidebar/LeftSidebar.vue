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
    
    <!-- 输入节点 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'input')" 
      title="输入节点"
    >
      <ToolbarIcon type="inputNode" />
    </button>
    
    <!-- 上下连接节点 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'topBottom')" 
      title="上下连接节点"
    >
      <ToolbarIcon type="topBottomNode" />
    </button>
    
    <!-- 左右连接节点 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'leftRight')" 
      title="左右连接节点"
    >
      <ToolbarIcon type="leftRightNode" />
    </button>
    
    <!-- 输出节点 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'output')" 
      title="输出节点"
    >
      <ToolbarIcon type="outputNode" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { Position } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

const { addNodes } = useVueFlow()

const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  // 获取鼠标在画布上的位置
  const { left, top } = (event.target as HTMLDivElement).getBoundingClientRect()
  const position = {
    x: event.clientX - left,
    y: event.clientY - top
  }

  // 创建新节点
  let newNode = {
    id: `${type}-${Date.now()}`,
    type,
    position,
    data: { 
      label: getDefaultLabel(type),
      fontSize: 12,
      color: '#000000'
    }
  }
  
  // 为不同类型的节点设置特定属性
  if (type === 'topBottom') {
    newNode = {
      ...newNode,
      type: 'default', // 使用默认节点类型
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top
    }
  } else if (type === 'leftRight') {
    newNode = {
      ...newNode,
      type: 'default', // 使用默认节点类型
      sourcePosition: Position.Right,
      targetPosition: Position.Left
    }
  } else if (type === 'input') {
    newNode = {
      ...newNode,
      type: 'input',
      sourcePosition: Position.Bottom
    }
  } else if (type === 'output') {
    newNode = {
      ...newNode,
      type: 'output',
      targetPosition: Position.Top
    }
  }

  addNodes([newNode])
}

// 根据节点类型获取默认标签文本
const getDefaultLabel = (type: string): string => {
  switch (type) {
    case 'textLabel': return '文本'
    case 'roundedRect': return '节点'
    case 'input': return '输入'
    case 'topBottom': return '上下连接'
    case 'leftRight': return '左右连接'
    case 'output': return '输出'
    default: return '节点'
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
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-btn:hover {
  background: var(--hover-color);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LeftSidebar'
})
</script> 