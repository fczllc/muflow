<!--
 * MuFlow - Vue Flow based flow chart editor
 * Copyright (c) 2024 tianyi
 * 
 * This project is based on Vue Flow (https://github.com/bcakmakoglu/vue-flow)
 * Vue Flow Copyright (c) bcakmakoglu - Released under MIT License
 * 
 * @license MIT
 -->

<template>
  <div class="app-container">
    <FlowEditor 
      ref="flowEditorRef"
      :canvasTools="{
        clear: true,
        export: true,
        import: true,
        saveLocal: true,
        saveAPI: false,
        help: true
      }" 
    />
    
    <!-- 示例按钮，用于测试直接调用FlowEditor的方法 -->
    <button class="test-btn" @click="exportFlowDataDirectly">导出流程图数据</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FlowEditor from './components/FlowEditor.vue'

// 定义FlowEditor暴露的方法类型
interface FlowEditorMethods {
  exportFlowData: () => void;
  getDataUrl: (format?: 'jpg' | 'png', download?: boolean) => Promise<string | null>;
  // 可以根据需要添加其他方法
}

// 获取FlowEditor实例的引用
const flowEditorRef = ref<InstanceType<typeof FlowEditor> | null>(null)

// 直接调用FlowEditor暴露的方法
const exportFlowDataDirectly = () => {
  if (flowEditorRef.value) {
    // 使用类型断言
    const flowEditor = flowEditorRef.value as unknown as FlowEditorMethods;
    flowEditor.exportFlowData();
  }
}
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  position: relative;
}

.test-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.test-btn:hover {
  background-color: #45a049;
}
</style> 