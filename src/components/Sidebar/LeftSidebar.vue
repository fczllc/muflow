<template>
  <div class="left-sidebar">
    <!-- 工具区分为三部分：顶部控件工具、中部资源工具、底部画布工具 -->
    
    <!-- 顶部控件工具 -->
    <div class="top-tools">
      <WidgetTool />
    </div>
    
    <!-- 中部资源工具 -->
    <div class="middle-tools">
      <ResourceTool />
    </div>
    
    <!-- 底部画布工具 -->
    <div class="bottom-tools">
      <CanvasTools />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import WidgetTool from './WidgetTool.vue'
import ResourceTool from './ResourceTool.vue'
import CanvasTools from '../Toolbar/CanvasTools.vue'

// 移除props定义，ResourceTool现在直接通过inject获取函数
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
  width: 40px;
}

.top-tools {
  flex: 0 0 auto;
  width: 100%;
}

.middle-tools {
  flex: 1 1 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bottom-tools {
  flex: 0 0 auto;
  width: 100%;
  margin-top: auto;
  padding-bottom: 8px;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LeftSidebar'
})
</script> 