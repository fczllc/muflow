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
  <div class="app">
    <FlowEditor ref="flowEditorRef" />
    <div class="test-panel">
      <button @click="testExportFlow">测试导出流程图</button>
      <div v-if="previewUrl" class="preview-container">
        <p>预览图片（高度: {{ imageHeight }}px）：</p>
        <img :src="previewUrl" alt="Flow Preview" style="border: 1px solid #ccc;" />
      </div>
      <div class="log-container">
        <h3>测试日志：</h3>
        <pre>{{ logs.join('\n') }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FlowEditor from './components/FlowEditor.vue'

const flowEditorRef = ref()
const previewUrl = ref('')
const imageHeight = ref(0)
const logs = ref<string[]>([])

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.push(`[${timestamp}] ${message}`)
}

const testExportFlow = async () => {
  addLog('开始测试导出流程图...')
  
  try {
    if (!flowEditorRef.value) {
      addLog('错误：FlowEditor引用未找到')
      return
    }

    addLog('调用 exportFlowAsBlobAndHeight 方法...')
    const result = await flowEditorRef.value.exportFlowAsBlobAndHeight()
    
    if (result) {
      const { blob, height } = result
      addLog(`成功获取结果：高度 = ${height}px, Blob大小 = ${blob.size} bytes`)
      addLog(`Blob类型：${blob.type}`)
      
      // 清除之前的预览
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      
      // 创建新的预览URL
      previewUrl.value = URL.createObjectURL(blob)
      imageHeight.value = height
      
      // 测试Blob内容
      const reader = new FileReader()
      reader.onload = () => {
        const base64Data = reader.result as string
        addLog(`Base64数据长度：${base64Data.length}`)
        if (base64Data === 'data:image/png;base64,') {
          addLog('警告：图片数据为空！')
        }
      }
      reader.readAsDataURL(blob)
      
    } else {
      addLog('警告：返回结果为null（可能是空画布）')
    }
  } catch (error) {
    addLog(`错误：${error instanceof Error ? error.message : String(error)}`)
    console.error('测试过程出错：', error)
  }
}
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

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.test-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 800px;
  width: 800px;
  z-index: 1000;
}

.preview-container {
  margin-top: 15px;
  max-width: 100%;
  overflow: auto;
}

.preview-container img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.log-container {
  margin-top: 15px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.log-container pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
  line-height: 1.4;
}
</style> 