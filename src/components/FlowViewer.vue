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
          :nodes="getNodes"
          :edges="getEdges"
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
          class="vue-flow-wrapper"
        >
          <!-- 注册自定义节点 -->
          <template #node-roundedRect="nodeProps">
            <RoundedRectNode v-bind="nodeProps" />
          </template>
          <template #node-textLabel="nodeProps">
            <TextLabelNode v-bind="nodeProps" />
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
import { markRaw, ref, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode } from '@vue-flow/core'
import RoundedRectNode from './Nodes/RoundedRectNode.vue'
import TextLabelNode from './Nodes/TextLabelNode.vue'
import type { Node, Edge } from '@vue-flow/core'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// 获取 Vue Flow 实例和方法
const { 
  getNodes, 
  getEdges,
  setNodes,
  setEdges,
  fitView,
  setViewport
} = useVueFlow('flow-viewer')

// 注册自定义节点类型
const nodeTypes = {
  roundedRect: markRaw(RoundedRectNode),
  textLabel: markRaw(TextLabelNode)
}

// 错误状态
const error = ref<string | null>(null)

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
    if (!['roundedRect', 'textLabel'].includes(node.type)) {
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
const processFlowData = (flowData: any) => {
  try {
    // 验证数据
    validateFlowData(flowData)
    
    // 重置错误状态
    error.value = null
    
    // 处理节点数据
    const nodesWithDisabledDrag = flowData.nodes.map((node: Node) => ({
      ...node,
      draggable: false,
      selectable: false,
      connectable: false,
      focusable: false
    }))
    
    // 处理边数据
    const edgesWithStyle = flowData.edges.map((edge: Edge) => {
      return {
        ...edge,
        type: edge.type || 'smoothstep',
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        style: edge.style,
        markerEnd: edge.markerEnd,
        interactionWidth: 0
      }
    })
    
    // 更新画布
    setNodes(nodesWithDisabledDrag as Node[])
    setEdges(edgesWithStyle as Edge[])
    
    // 等待节点渲染完成后自适应视图
    nextTick(() => {
      fitView({
        padding: 0.2,
        includeHiddenNodes: false,
        minZoom: 0.1,
        maxZoom: 2
      })
    })
    
  } catch (err: any) {
    error.value = err.message || '流程图数据格式不正确'
    setNodes([])
    setEdges([])
  }
}

// 从API加载数据
const loadFlowDataFromApi = async (flowId: string) => {
  try {
    error.value = null
    const response = await fetch(`/api/flows/${flowId}`)
    if (!response.ok) {
      throw new Error('获取流程图数据失败')
    }
    const flowData = await response.json()
    processFlowData(flowData)
  } catch (err: any) {
    error.value = err.message || '加载流程图数据失败'
    setNodes([])
    setEdges([])
  }
}

// 组件属性
const props = defineProps<{
  flowId?: string
  apiUrl?: string
}>()

// 监听属性变化
watch(() => props.flowId, (newFlowId) => {
  if (newFlowId) {
    loadFlowDataFromApi(newFlowId)
  }
}, { immediate: true })
</script>

<style>
.flow-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
}

.canvas-container {
  flex: 1;
  height: 100%;
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