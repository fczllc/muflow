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
  <div class="flow-viewer">
    <div class="main-content">
      <div class="canvas-container">
        <VueFlow
          v-if="!error"
          ref="vueFlowInstance"
          :nodes="nodes"
          :edges="edges"
          :node-types="nodeTypes"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :connection-mode="ConnectionMode.Loose"
          :zoom-on-scroll="true"     
          :zoom-on-pinch="true" 
          :pan-On-Drag="true"
          :min-zoom="0.1"               
          :max-zoom="2"               
          :pannable="true"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :draggable="false"
          :node-draggable="false"
          :selectable="false"
          :elements-selectable="false"
          :nodes-draggable="false"
          :nodes-connectable="false"
          :edges-updatable="false"
          :edges-selectable="false"
          :auto-connect="false"
          :elevate-edges-on-select="false"
          :fit-view-on-init="true"
          :fit-view-padding="0.2"
          class="vue-flow-wrapper"
          @nodesDragged="onNodesChange"
          @edgesChange="onEdgesChange"
          @init="onInit"
        >
          <!-- 注册自定义节点 -->
          <template #node-roundedRect="nodeProps">
            <RoundedRectNode v-bind="nodeProps" />
          </template>
          <template #node-textLabel="nodeProps">
            <TextLabelNode v-bind="nodeProps" />
          </template>
          <template #node-line="nodeProps">
            <LineNode v-bind="nodeProps" />
          </template>
        </VueFlow>
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FlowViewer'
})
</script>

<script setup lang="ts">
import { markRaw, ref, watch, onBeforeUnmount } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode, MarkerType } from '@vue-flow/core'
import RoundedRectNode from './Nodes/RoundedRectNode.vue'
import TextLabelNode from './Nodes/TextLabelNode.vue'
import LineNode from './Nodes/LineNode.vue'
import type { Node, Edge, Styles } from '@vue-flow/core'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// 组件属性
const props = defineProps<{
  flowId?: string
  apiUrl?: string
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'load-success', data: any): void
  (e: 'load-error', error: any): void
}>()

// 状态
const error = ref<string | null>(null)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const vueFlowInstance = ref()

// 注册自定义节点类型
const nodeTypes = {
  roundedRect: markRaw(RoundedRectNode),
  textLabel: markRaw(TextLabelNode),
  line: markRaw(LineNode)
}

// 创建一个取消控制器的引用
let abortController: AbortController | null = null

// 视图初始化处理
const onInit = (instance: any) => {
  vueFlowInstance.value = instance
  // 如果已经有数据，立即执行视图适应
  if (nodes.value.length > 0) {
    instance.fitView({
      padding: 0.2,
      includeHidden: false,
      minZoom: 0.1,
      maxZoom: 2
    })
  }
}

// 节点变化处理
const onNodesChange = (nodeChanges: any[]) => {
  // 不直接设置 changes，而是应用变化
  const updatedNodes = [...nodes.value]
  nodeChanges.forEach(change => {
    if (change.type === 'position' && change.position) {
      const node = updatedNodes.find(n => n.id === change.id)
      if (node) {
        node.position = change.position
      }
    }
  })
  nodes.value = updatedNodes
}

// 边变化处理
const onEdgesChange = (edgeChanges: any[]) => {
  // 不直接设置 changes，而是应用变化
  const updatedEdges = [...edges.value]
  edgeChanges.forEach(change => {
    if (change.type === 'remove') {
      const index = updatedEdges.findIndex(e => e.id === change.id)
      if (index > -1) {
        updatedEdges.splice(index, 1)
      }
    }
  })
  edges.value = updatedEdges
}

// 验证流程图数据
const validateFlowData = (flowData: any) => {
  // 验证数据结构
  if (!flowData || typeof flowData !== 'object') {
    throw new Error('无效的流程图数据格式')
  }

  if (!Array.isArray(flowData.nodes) || !Array.isArray(flowData.edges)) {
    throw new Error('流程图数据缺少节点或连线数据')
  }

  // 验证节点数据
  const validNodes = flowData.nodes.every((node: any) => {
    if (!node.id || !node.type || !node.position) {
      return false
    }
    if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      return false
    }
    if (!['roundedRect', 'textLabel', 'line'].includes(node.type)) {
      return false
    }
    return true
  })

  if (!validNodes) {
    throw new Error('节点数据格式不正确')
  }

  // 验证边数据
  const validEdges = flowData.edges.every((edge: any) => {
    if (!edge.id || !edge.source || !edge.target) {
      return false
    }
    // 验证source和target是否存在于nodes中
    const sourceExists = flowData.nodes.some((node: any) => node.id === edge.source)
    const targetExists = flowData.nodes.some((node: any) => node.id === edge.target)
    if (!sourceExists || !targetExists) {
      return false
    }
    return true
  })

  if (!validEdges) {
    throw new Error('连线数据格式不正确')
  }

  return true
}

// 处理流程图数据
const processFlowData = async (flowData: any) => {
  try {
    // 验证数据
    validateFlowData(flowData)
    
    // 重置错误状态
    error.value = null
    
    // 处理节点数据
    const nodesWithDisabledDrag = flowData.nodes.map((node: Node) => {
      // 提取基本属性
      const baseNode = {
        id: node.id,
        type: node.type,
        position: {
          x: node.position.x,
          y: node.position.y
        },
        data: {
          label: node.data?.label || '',
          style: node.data?.style || {},
          fontSize: node.data?.fontSize || 14,
          color: node.data?.color || '#000000'
        },
        draggable: false,
        selectable: false,
        connectable: false
      }

      // 根据节点类型添加特定属性
      if (node.type === 'line') {
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            width: node.data?.width || 120,
            angle: node.data?.angle || 0,
            arrowStyle: node.data?.arrowStyle || 'none',
            style: {
              ...node.data?.style,
              strokeWidth: node.data?.style?.strokeWidth || 1,
              stroke: node.data?.style?.stroke || '#000000'
            }
          }
        }
      } else if (node.type === 'roundedRect') {
        return {
          ...baseNode,
          data: {
            ...baseNode.data,
            style: {
              width: node.data?.style?.width || '120px',
              height: node.data?.style?.height || '42px'
            }
          }
        }
      } else {
        return baseNode
      }
    })
    
    // 处理边数据
    const edgesWithStyle = flowData.edges.map((edge: Edge) => {
      const edgeStyle = (edge.style || {}) as Record<string, any>
      const edgeData = edge.data || {}
      
      return {
        id: edge.id,
        type: 'smoothstep',
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        style: {
          strokeWidth: edgeData.savedLineWidth || edgeStyle.strokeWidth || 1,
          stroke: edgeData.savedLineColor || edgeStyle.stroke || '#555555',
          strokeDasharray: edgeStyle.strokeDasharray
        } as Styles,
        markerEnd: edgeData.savedArrowStyle === 'target' || edgeData.savedArrowStyle === 'both' ? {
          type: MarkerType.Arrow,
          color: edgeData.savedLineColor || edgeStyle.stroke || '#555555',
          width: 15,
          height: 15,
          strokeWidth: 2
        } : undefined,
        markerStart: edgeData.savedArrowStyle === 'source' || edgeData.savedArrowStyle === 'both' ? {
          type: MarkerType.Arrow,
          color: edgeData.savedLineColor || edgeStyle.stroke || '#555555',
          width: 15,
          height: 15,
          strokeWidth: 2
        } : undefined,
        data: {
          savedLineWidth: edgeData.savedLineWidth || edgeStyle.strokeWidth || 1,
          savedLineColor: edgeData.savedLineColor || edgeStyle.stroke || '#555555',
          savedLineStyle: edgeData.savedLineStyle || (edgeStyle.strokeDasharray === '5 5' ? 'dashed' : edgeStyle.strokeDasharray === '2 2' ? 'dotted' : 'solid'),
          savedArrowStyle: edgeData.savedArrowStyle || 'target'
        }
      }
    })
    
    // 更新画布
    nodes.value = nodesWithDisabledDrag
    edges.value = edgesWithStyle
    
    // 如果实例已经初始化，立即执行视图适应
    if (vueFlowInstance.value) {
      vueFlowInstance.value.fitView({
        padding: 0.2,
        includeHidden: false,
        minZoom: 0.1,
        maxZoom: 2
      })
    }
    
  } catch (err: any) {
    error.value = err.message || '流程图数据格式不正确'
    nodes.value = []
    edges.value = []
    return Promise.reject(err)
  }
}

// 组件卸载前
onBeforeUnmount(() => {
  try {
    // 取消所有未完成的请求
    if (abortController) {
      abortController.abort()
    }
    
    // 清理节点和边
    nodes.value = []
    edges.value = []
    
    // 清理 Vue Flow 实例
    const { setNodes, setEdges } = useVueFlow()
    setNodes([])
    setEdges([])
    
  } catch (error) {
    console.warn('组件清理时发生错误:', error)
  }
})

// 添加错误边界处理
const handleError = (error: any) => {
  console.error('Flow Viewer 错误:', error)
  error.value = '流程图加载出错，请刷新页面重试'
}

// 修改数据加载方法
const loadFlowDataFromApi = async (flowId: string) => {
  try {
    error.value = null
    const baseUrl = props.apiUrl?.replace(/\/$/, '') || '/api'
    
    // 创建新的取消控制器
    abortController = new AbortController()
    
    const response = await fetch(`${baseUrl}/flows/${flowId}`, {
      signal: abortController.signal
    })
    
    if (!response.ok) {
      throw new Error('获取流程图数据失败')
    }
    
    const flowData = await response.json()
    
    await processFlowData(flowData)
    emit('load-success', flowData)
  } catch (err: any) {
    // 如果是取消请求导致的错误，不显示错误信息
    if (err.name === 'AbortError') {
      return
    }
    
    const errorMessage = err.message || '加载流程图数据失败'
    error.value = errorMessage
    emit('load-error', errorMessage)
    nodes.value = []
    edges.value = []
    handleError(err)
  }
}

// 修改 watch 逻辑
watch(() => props.flowId, (newFlowId) => {
  // 如果存在之前的请求，取消它
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  
  if (newFlowId) {
    loadFlowDataFromApi(newFlowId).catch(handleError)
  }
}, { immediate: true })

// 暴露 processFlowData 方法供外部调用
defineExpose({
  processFlowData
})
</script>

<style>
.flow-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.vue-flow-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Vue Flow 相关样式 */
:root {
  --vf-node-bg: #fff;
  --vf-node-text: #222;
  --vf-connection-path: #b1b1b7;
  --vf-handle: #555;
}

.vue-flow__background {
  background-color: #f8f8f8;
}

.vue-flow__background-pattern {
  color: #aaa;
}

/* 连线样式 */
.vue-flow__edge {
  pointer-events: none !important;
}

.vue-flow__edge-path {
  pointer-events: none !important;
  fill: none !important;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  filter: none !important;
}

.vue-flow__edge.animated .vue-flow__edge-path {
  stroke-dasharray: 5 !important;
  animation: dashdraw 0.5s linear infinite !important;
}

.vue-flow__edge-text {
  pointer-events: none !important;
}

.vue-flow__edge-textbg {
  pointer-events: none !important;
}

.vue-flow__connection {
  pointer-events: none !important;
}

.vue-flow__connection-path {
  fill: none !important;
}

/* 箭头样式 */
.vue-flow__arrowhead {
  stroke: none !important;
}

.vue-flow__edge-interaction {
  stroke: none !important;
  fill: none !important;
  pointer-events: none !important;
}

/* 禁用节点拖动相关样式 */
.vue-flow__node {
  cursor: default !important;
  user-select: none !important;
}

.vue-flow__handle {
  opacity: 0 !important;
  pointer-events: none !important;
  cursor: default !important;
  visibility: visible !important;
  position: absolute !important;
}

/* 确保连接点位置正确但不可见 */
.vue-flow__handle {
  width: 1px !important;
  height: 1px !important;
  min-width: 1px !important;
  min-height: 1px !important;
  opacity: 0 !important;
  background: transparent !important;
  border: none !important;
}

/* 错误提示样式 */
.error-message {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.error-content {
  background-color: #fff;
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 80%;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 10px;
  display: block;
}

.error-content p {
  margin: 0;
  color: #ff4d4f;
  font-size: 16px;
}
</style> 