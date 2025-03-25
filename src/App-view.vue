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
      <button class="load-btn" @click="showFileSelector">导入流程图</button>
      <button 
        class="example-btn" 
        @click="loadExampleFlowChart"
      >加载示例</button>
      <button 
        class="export-btn" 
        @click="exportFlowChart"
        :disabled="!currentFlowData"
      >导出流程图</button>
      <input 
        type="file" 
        ref="fileInput" 
        style="display: none" 
        accept=".json"
        @change="handleFileImport"
      >
      <span v-if="error" class="error-message">{{ error }}</span>
      <span v-if="status" class="status-message">{{ status }}</span>
    </div>
    <FlowViewer 
      v-if="currentFlowData"
      ref="flowViewer"
      :flowData="currentFlowData"
      @load-success="handleLoadSuccess"
      @load-error="handleLoadError"
    />
    <div v-else class="placeholder">
      点击上方按钮导入流程图
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import FlowViewer from './components/FlowViewer.vue'

const flowViewer = ref<InstanceType<typeof FlowViewer> | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const status = ref('')
const currentFlowData = ref<any>(null)

// 打开文件选择器
const showFileSelector = () => {
  error.value = ''
  status.value = ''
  fileInput.value?.click()
}

// 处理文件导入
const handleFileImport = async (event: Event) => {
  try {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    
    if (!file) {
      error.value = '未选择文件'
      return
    }
    
    error.value = ''
    status.value = '正在加载...'
    
    // 读取文件内容
    const fileContent = await readFileContent(file)
    
    // 解析JSON数据
    try {
      const jsonData = JSON.parse(fileContent)
      
      console.log('JSON解析成功，原始数据:', {
        nodes: jsonData.nodes?.length || 0,
        edges: jsonData.edges?.length || 0
      })
      
      // 验证数据格式
      if (!validateFlowData(jsonData)) {
        throw new Error('无效的流程图数据格式')
      }
      
      // 预处理数据结构，确保必要的字段存在
      const processedData = preprocessFlowData(jsonData)
      
      // 设置流程图数据
      currentFlowData.value = processedData
      status.value = '加载成功'
      
      console.log('导入流程图成功，处理后数据:', processedData.nodes?.length || 0, '个节点,', processedData.edges?.length || 0, '条边')
    } catch (parseError) {
      error.value = '解析JSON失败: ' + (parseError instanceof Error ? parseError.message : String(parseError))
      status.value = ''
      console.error('JSON解析失败:', parseError)
    }
    
    // 重置文件输入，允许再次选择同一文件
    input.value = ''
  } catch (e: any) {
    error.value = e.message || '导入失败'
    status.value = ''
    console.error('导入出错:', e)
  }
}

// 预处理流程图数据，确保必要的字段存在
const preprocessFlowData = (data: any): any => {
  // 为节点添加默认属性
  const processedNodes = (data.nodes || []).map((node: any, index: number) => {
    const nodeId = node.id || `node-${Date.now()}-${index}`
    
    return {
      id: nodeId,
      type: node.type || 'roundedRect',
      position: {
        x: node.position?.x || 0,
        y: node.position?.y || 0
      },
      data: {
        label: node.data?.label || `节点 ${nodeId}`,
        style: node.data?.style || {},
        ...node.data
      },
      ...node
    }
  })
  
  // 为边添加默认属性
  const processedEdges = (data.edges || []).map((edge: any, index: number) => {
    return {
      id: edge.id || `edge-${Date.now()}-${index}`,
      source: edge.source || '',
      target: edge.target || '',
      style: edge.style || {},
      data: {
        savedLineWidth: edge.data?.savedLineWidth || edge.style?.strokeWidth || 1,
        savedLineColor: edge.data?.savedLineColor || edge.style?.stroke || '#555555',
        savedLineStyle: edge.data?.savedLineStyle || 'solid',
        savedArrowStyle: edge.data?.savedArrowStyle || 'target',
        ...edge.data
      },
      ...edge
    }
  }).filter((edge: any) => {
    // 过滤掉没有源节点或目标节点的边
    if (!edge.source || !edge.target) {
      console.warn(`移除无效的边 ${edge.id}：缺少源节点或目标节点`)
      return false
    }
    return true
  })
  
  return {
    ...data,
    nodes: processedNodes,
    edges: processedEdges
  }
}

// 验证流程图数据格式
const validateFlowData = (data: any): boolean => {
  // 检查基本结构
  if (!data || typeof data !== 'object') {
    throw new Error('无效的数据格式')
  }

  // 检查nodes数组
  if (!Array.isArray(data.nodes)) {
    throw new Error('无效的节点数据：nodes必须是数组')
  }

  // 检查edges数组
  if (!Array.isArray(data.edges)) {
    throw new Error('无效的边数据：edges必须是数组')
  }

  // 验证每个节点的基本属性
  let hasInvalidNode = false
  data.nodes.forEach((node: any, index: number) => {
    if (!node.id) {
      console.warn(`节点 ${index} 缺少id属性，将自动生成`)
    }
    
    if (!node.position) {
      console.warn(`节点 ${node.id || index} 缺少position属性，将使用默认值`)
    } else if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      console.warn(`节点 ${node.id || index} 位置格式不正确，将使用默认值`)
    }
    
    if (!node.type) {
      console.warn(`节点 ${node.id || index} 缺少type属性，将使用默认类型`)
    }
  })

  // 验证每个边的基本属性
  let hasInvalidEdge = false
  data.edges.forEach((edge: any, index: number) => {
    if (!edge.id) {
      console.warn(`边 ${index} 缺少id属性，将自动生成`)
      hasInvalidEdge = true
    }
    
    if (!edge.source || !edge.target) {
      console.warn(`边 ${edge.id || index} 缺少source或target属性，导入后可能显示不正确`)
      hasInvalidEdge = true
    } else {
      // 检查源节点和目标节点是否存在
      const sourceExists = data.nodes.some((node: any) => node.id === edge.source)
      const targetExists = data.nodes.some((node: any) => node.id === edge.target)
      
      if (!sourceExists) {
        console.warn(`边 ${edge.id || index} 的源节点 ${edge.source} 不存在，导入后可能显示不正确`)
      }
      
      if (!targetExists) {
        console.warn(`边 ${edge.id || index} 的目标节点 ${edge.target} 不存在，导入后可能显示不正确`)
      }
    }
  })

  // 即使有警告，仍然返回 true，让处理函数来决定如何处理不完整的数据
  return true
}

// 读取文件内容
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('读取文件失败'))
      }
    }
    
    reader.onerror = (e) => {
      reject(new Error('读取文件发生错误: ' + e))
    }
    
    reader.readAsText(file)
  })
}

// 处理加载成功
const handleLoadSuccess = (data: any) => {
  status.value = '加载成功'
  error.value = ''
  console.log('加载成功，数据:', data.nodes?.length || 0, '个节点,', data.edges?.length || 0, '条边')
}

// 处理加载错误
const handleLoadError = (err: any) => {
  error.value = typeof err === 'string' ? err : err.message || '加载失败'
  status.value = ''
  console.error('加载失败:', err)
}

// 导出流程图数据
const exportFlowChart = () => {
  try {
    if (!currentFlowData.value) {
      error.value = '没有可导出的流程图数据'
      return
    }
    
    // 将流程图数据转换为JSON字符串
    const jsonString = JSON.stringify(currentFlowData.value, null, 2)
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' })
    
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = url
    
    // 设置文件名 (使用当前时间戳)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    downloadLink.download = `flowchart-${timestamp}.json`
    
    // 触发下载
    document.body.appendChild(downloadLink)
    downloadLink.click()
    
    // 清理
    URL.revokeObjectURL(url)
    document.body.removeChild(downloadLink)
    
    status.value = '导出成功'
    error.value = ''
    
    console.log('流程图数据导出成功')
  } catch (e: any) {
    error.value = e.message || '导出失败'
    status.value = ''
    console.error('导出流程图数据失败:', e)
  }
}

// 加载示例流程图
const loadExampleFlowChart = async () => {
  try {
    error.value = ''
    status.value = '正在加载示例...'

    // 加载示例流程图JSON文件
    const response = await fetch('/example-flowchart.json')
    if (!response.ok) {
      throw new Error(`加载示例失败: ${response.status} ${response.statusText}`)
    }
    
    const exampleData = await response.json()
    
    console.log('示例JSON加载成功，原始数据:', {
      nodes: exampleData.nodes?.length || 0,
      edges: exampleData.edges?.length || 0
    })
    
    // 验证数据格式
    if (!validateFlowData(exampleData)) {
      throw new Error('示例数据格式无效')
    }
    
    // 预处理数据结构，确保必要的字段存在
    const processedData = preprocessFlowData(exampleData)
    
    // 设置流程图数据
    currentFlowData.value = processedData
    status.value = '示例加载成功'
    
    console.log('示例流程图加载成功，处理后数据:', processedData.nodes?.length || 0, '个节点,', processedData.edges?.length || 0, '条边')
  } catch (e: any) {
    error.value = e.message || '加载示例失败'
    status.value = ''
    console.error('加载示例流程图失败:', e)
  }
}

// 组件挂载完成
onMounted(() => {
  console.log('FlowViewer组件已挂载，准备导入流程图')
})
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
  padding: 8px 16px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f8f9fa;
}

.load-btn, .example-btn, .export-btn {
  padding: 6px 16px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.load-btn {
  background-color: #409eff;
}

.load-btn:hover {
  background-color: #66b1ff;
}

.example-btn {
  background-color: #909399;
}

.example-btn:hover {
  background-color: #a6a9ad;
}

.export-btn {
  background-color: #67c23a;
}

.export-btn:hover {
  background-color: #85ce61;
}

.export-btn:disabled {
  background-color: #c8c9cc;
  cursor: not-allowed;
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