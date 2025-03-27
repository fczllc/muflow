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
        saveAPI: true,
        help: true,
        mermaid: true
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
  importMermaidFlowchart: (script: string) => { success: boolean; message?: string };
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
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  position: relative;
  overflow: hidden;
  will-change: transform;
}

/* 防止导出图片时UI抖动 */
body.exporting-image .left-sidebar {
  pointer-events: none !important; /* 防止交互 */
  will-change: transform !important; /* 优化性能 */
  transition: none !important; /* 禁用所有过渡 */
  /* 保持完全可见，不透明 */
  opacity: 1 !important; 
  visibility: visible !important;
  position: relative !important;
}

body.exporting-image .vue-flow__controls, 
body.exporting-image .vue-flow__minimap, 
body.exporting-image .top-toolbar,
body.exporting-image .node-toolbar {
  pointer-events: none !important; /* 防止交互 */
  will-change: transform !important; /* 优化性能 */
  transition: none !important; /* 禁用所有过渡 */
  visibility: visible !important; /* 确保元素保持可见 */
  opacity: 0.3 !important; /* 使元素半透明而不是完全消失 */
}

/* 导出图片时确保画布位置固定 */
body.exporting-image .vue-flow {
  will-change: transform !important; 
  transition: none !important;
  /* 保持可见，但不要修改其位置 */
  position: relative !important;
  overflow: visible !important;
}

/* 确保变换面板也固定，防止画布抖动 */
body.exporting-image .vue-flow__transformationpane {
  will-change: transform !important; 
  transition: none !important;
  /* 重要：确保在动画过程中保持其位置 */
  transform-origin: center center !important;
}

/* 确保左侧边栏不会抖动 */
.left-sidebar {
  position: relative !important;
  z-index: 10 !important;
  will-change: transform !important;
  transform: translateZ(0) !important; /* 强制GPU加速 */
  transition: none !important; /* 禁用所有过渡效果 */
  box-shadow: none !important; /* 移除可能引起重绘的阴影 */
}

/* 稳定化Vue Flow容器 */
.vue-flow {
  will-change: transform !important;
  transform: translateZ(0) !important; /* 强制GPU加速 */
  position: relative !important; /* 确保容器位置稳定 */
  overflow: visible !important; /* 防止因溢出处理引起的视觉变化 */
}

/* 稳定化变换面板 */
.vue-flow__transformationpane {
  will-change: transform !important;
  backface-visibility: hidden !important; /* 减少3D变换时的视觉抖动 */
  transform-style: preserve-3d !important; /* 优化3D变换 */
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

/* 优化导出过程: 
   1. 创建一个覆盖层，遮挡可能的视觉变化
   2. 使用CSS动画来平滑过渡 
*/
body.exporting-image::after {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.01); /* 几乎透明的遮罩 */
  z-index: 9999; /* 置于最上层 */
  pointer-events: none; /* 不阻止交互 */
  animation: fade-in-out 1s ease-in-out; /* 平滑过渡 */
}

@keyframes fade-in-out {
  0% { opacity: 0; }
  50% { opacity: 0.05; } /* 轻微的闪烁效果分散注意力 */
  100% { opacity: 0; }
}

/* 为Webkit浏览器隐藏滚动条但保留功能 */
html::-webkit-scrollbar, body::-webkit-scrollbar {
  display: none;
}
</style> 