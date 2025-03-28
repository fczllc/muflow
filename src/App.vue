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
        help: true
      }" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FlowEditor from './components/FlowEditor.vue'

// 获取FlowEditor实例的引用
const flowEditorRef = ref<InstanceType<typeof FlowEditor> | null>(null)
</script>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

/* 为Webkit浏览器隐藏滚动条但保留功能 */
html::-webkit-scrollbar, body::-webkit-scrollbar {
  display: none;
}

/* App容器样式 */
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
</style> 