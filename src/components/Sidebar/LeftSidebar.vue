<template>
  <div class="left-sidebar">
    <!-- 文字标签控件 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'textLabel')" 
      title="文字标签"
    >
      <ToolbarIcon type="textLabel" />
    </button>

    <!-- 圆角矩形节点控件 -->
    <button 
      class="sidebar-btn" 
      draggable="true" 
      @dragstart="onDragStart($event, 'roundedRect')" 
      title="圆角矩形"
    >
      <ToolbarIcon type="roundedRect" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

const { addNodes } = useVueFlow()

const onDragStart = (event: DragEvent, nodeType: 'textLabel' | 'roundedRect') => {
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
  const newNode = {
    id: `${type}-${Date.now()}`,
    type,
    position,
    data: { 
      label: type === 'textLabel' ? '文本标签' : '圆角矩形',
      fontSize: 14,
      color: '#000000'
    }
  }

  addNodes([newNode])
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