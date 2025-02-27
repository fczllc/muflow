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

    <!-- 添加画布工具到底部 -->
    <div class="canvas-tools-wrapper">
      <CanvasTools />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { Position } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'
import CanvasTools from '../Toolbar/CanvasTools.vue'

const { addNodes } = useVueFlow()

const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
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
}

.sidebar-btn:hover {
  background: var(--hover-color);
}

/* 添加画布工具容器样式 */
.canvas-tools-wrapper {
  margin-top: auto;
  width: 100%;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LeftSidebar'
})
</script> 