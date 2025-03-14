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
    <div class="toolbar">
      <button class="load-btn" @click="loadFlowData">加载流程图</button>
      <span v-if="error" class="error-message">{{ error }}</span>
      <span v-if="status" class="status-message">{{ status }}</span>
    </div>
    <FlowViewer 
      v-if="currentFlowId"
      ref="flowViewer"
      :flowId="currentFlowId"
      :apiUrl="apiBaseUrl"
      @load-success="handleLoadSuccess"
      @load-error="handleLoadError"
    />
    <div v-else class="placeholder">
      点击上方按钮加载流程图
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FlowViewer from './components/FlowViewer.vue'

const flowViewer = ref<InstanceType<typeof FlowViewer> | null>(null)
const error = ref('')
const status = ref('')
const currentFlowId = ref<string>('')
const apiBaseUrl = '/api'

// 模拟 API 服务器设置
const setupMockApi = () => {
  const originalFetch = window.fetch
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init)
    const url = new URL(request.url, window.location.origin)
    
    // 拦截 API 请求
    if (url.pathname.startsWith('/api/flows/')) {
      console.log('拦截到 API 请求:', url.pathname)
      
      try {
        // 加载测试数据文件
        const response = await originalFetch('/flowchart_20250315_0041.json')
        if (!response.ok) {
          throw new Error('Failed to load test data')
        }
        
        // 返回测试数据
        const testData = await response.json()
        return new Response(JSON.stringify(testData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.error('加载测试数据失败:', error)
        throw error
      }
    }
    
    return originalFetch(input, init)
  }
}

// 加载流程图数据
const loadFlowData = () => {
  try {
    error.value = ''
    status.value = '正在加载...'
    
    // 设置新的 flowId 触发加载
    currentFlowId.value = `test-flow-${Date.now()}`
    
    console.log('触发加载，flowId:', currentFlowId.value)
  } catch (e: any) {
    error.value = e.message || '加载失败'
    status.value = ''
    console.error('加载出错:', e)
  }
}

// 处理加载成功
const handleLoadSuccess = (data: any) => {
  status.value = '加载成功'
  console.log('加载成功，数据:', data)
}

// 处理加载错误
const handleLoadError = (err: any) => {
  error.value = typeof err === 'string' ? err : err.message || '加载失败'
  status.value = ''
  console.error('加载失败:', err)
}

// 初始化模拟 API
setupMockApi()
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
}

.toolbar {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 12px;
}

.load-btn {
  padding: 6px 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.load-btn:hover {
  background-color: #66b1ff;
}

.error-message {
  color: #f56c6c;
  font-size: 14px;
}

.status-message {
  color: #67c23a;
  font-size: 14px;
}

.placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}
</style> 