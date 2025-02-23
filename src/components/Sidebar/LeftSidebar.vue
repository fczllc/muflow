<template>
  <div class="left-sidebar">
    <!-- 文字标签控件 -->
    <button class="sidebar-btn" draggable="true" @dragstart="onDragStart('text')" title="文字标签">
      <ToolbarIcon type="textLabel" />
    </button>

    <!-- 圆角矩形节点控件 -->
    <button class="sidebar-btn" draggable="true" @dragstart="onDragStart('roundedRect')" title="圆角矩形">
      <ToolbarIcon type="roundedRect" />
    </button>
  </div>
</template>

<script setup lang="ts">
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

const onDragStart = (type: 'text' | 'roundedRect') => {
  // 处理拖拽开始事件
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