<!--
 * MuFlow - Vue Flow based flow chart editor
 * Copyright (c) 2024 tianyi
 * 
 * 【FlowViewer组件使用说明】
 * 此组件是一个独立的流程图查看器，可以直接被引用使用。
 * 
 * 使用方式：
 * 1. 直接传入流程图数据：
 *    <FlowViewer :flowData="yourFlowData" />
 * 
 * 2. 通过API加载：
 *    <FlowViewer flowId="your-flow-id" apiUrl="your-api-base-url" />
 * 
 * 事件：
 * - @load-success="handleSuccess" - 加载成功回调
 * - @load-error="handleError" - 加载失败回调
 * 
 * 公开方法：
 * - processFlowData(data) - 直接处理并显示流程图数据
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
          :default-zoom="1"
          :pannable="true"
          :snap-to-grid="false"
          :snap-grid="[2, 2]"
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
          :fit-view-padding="0.4"
          :default-edge-options="{
            type: 'smoothstep',
            style: {
              strokeWidth: 1,
              stroke: '#555555'
            },
            markerEnd: {
              type: MarkerType.Arrow,
              color: '#555555',
              width: 15,
              height: 15,
              strokeWidth: 2
            }
          }"
          class="vue-flow-wrapper"
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
          <template #node-startEnd="nodeProps">
            <StartEndNode v-bind="nodeProps" />
          </template>
          <template #node-condition="nodeProps">
            <ConditionNode v-bind="nodeProps" />
          </template>
          <template #node-circle="nodeProps">
            <CircleNode v-bind="nodeProps" />
          </template>
          <template #node-svgIcon="nodeProps">
            <SvgIconNode v-bind="nodeProps" />
          </template>
        </VueFlow>
        <!-- 错误提示 -->
        <div v-if="error" class="error-message">
          <div class="error-content">
            <span class="error-icon">⚠️</span>
            <p>{{ error }}</p>
            <button class="retry-button" @click="retryLoad">重试</button>
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
import { markRaw, ref, watch, onBeforeUnmount, onMounted } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode, MarkerType } from '@vue-flow/core'
import RoundedRectNode from './Nodes/RoundedRectNode.vue'
import TextLabelNode from './Nodes/TextLabelNode.vue'
import LineNode from './Nodes/LineNode.vue'
import StartEndNode from './Nodes/StartEndNode.vue'
import ConditionNode from './Nodes/ConditionNode.vue'
import CircleNode from './Nodes/CircleNode.vue'
import SvgIconNode from './Nodes/SvgIconNode.vue'
import type { Node, Edge, Styles } from '@vue-flow/core'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// 组件属性
const props = defineProps<{
  flowId?: string
  apiUrl?: string
  flowData?: any // 直接传入的流程图数据
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
const nodePositions = ref<Record<string, { x: number, y: number, width: number, height: number }>>({})

// 注册自定义节点类型
// 类型断言解决TypeScript兼容性问题
const nodeTypes = {
  roundedRect: markRaw(RoundedRectNode),
  startEnd: markRaw(StartEndNode),
  condition: markRaw(ConditionNode),
  circle: markRaw(CircleNode),
  line: markRaw(LineNode),
  textLabel: markRaw(TextLabelNode),
  svgIcon: markRaw(SvgIconNode) // 添加svgIcon节点类型
} as any // 使用类型断言来避免类型检查错误

// 创建一个取消控制器的引用
let abortController: AbortController | null = null

// 重试加载方法
const retryLoad = () => {
  error.value = null
  
  // 优先使用直接传入的数据
  if (props.flowData) {
    processFlowData(props.flowData).catch(handleError)
  } else if (props.flowId) {
    loadFlowDataFromApi(props.flowId).catch(handleError)
  }
}

// 居中流程图
const centerFlowchart = () => {
  if (vueFlowInstance.value) {
    vueFlowInstance.value.fitView({
      padding: 0.4,
      includeHiddenNodes: false,
      minZoom: 0.3,
      maxZoom: 2.0
    })
  }
}

// 窗口大小变化时重新居中
const handleResize = () => {
  if (vueFlowInstance.value && (nodes.value.length > 0 || edges.value.length > 0)) {
    // 延迟执行以确保DOM已完成调整
    setTimeout(() => {
      centerFlowchart()
    }, 100)
  }
}

// 组件挂载时添加窗口大小变化事件监听
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

// 组件卸载前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  
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
})

// 视图初始化处理
const onInit = (instance: any) => {
  vueFlowInstance.value = instance
  
  // 启用自动适配，允许流程图内容与视口自动适配
  if (vueFlowInstance.value && (nodes.value.length > 0 || edges.value.length > 0)) {
    // 设置一个较大的内边距，让内容更居中
    setTimeout(() => {
      centerFlowchart()
      
      // 再次尝试居中，解决某些渲染延迟问题
      setTimeout(() => {
        centerFlowchart()
      }, 200)
    }, 300)
  }
}

// 验证流程图数据
const validateFlowData = (flowData: any) => {
  if (!flowData || typeof flowData !== 'object') {
    throw new Error('无效的流程图数据格式')
  }

  if (!Array.isArray(flowData.nodes)) {
    throw new Error('流程图数据缺少节点数组或格式不正确')
  }

  if (!Array.isArray(flowData.edges)) {
    throw new Error('流程图数据缺少边数组或格式不正确')
  }

  // 检查节点是否有效
  const supportedTypes = ['roundedRect', 'textLabel', 'line', 'startEnd', 'condition', 'circle', 'svgIcon']
  
  flowData.nodes.forEach((node: any, index: number) => {
    if (!node.id) {
      node.id = `node-${Math.random().toString(36).substring(2, 10)}`;
    }

    if (!node.type) {
      node.type = 'roundedRect';
    }

    if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      node.position = { x: 0, y: 0 };
    }
  })
  
  // 检查边是否有效
  flowData.edges.forEach((edge: any, index: number) => {
    if (!edge.id) {
      edge.id = `edge-${Math.random().toString(36).substring(2, 10)}`;
    }
  })
}

// 处理流程图数据
const processFlowData = async (flowData: any) => {
  try {
    // 验证数据
    validateFlowData(flowData)
    
    // 重置错误状态
    error.value = null
    
    // 处理节点数据
    const nodesWithDisabledDrag = flowData.nodes.map((node: any) => {
      // 如果缺少必要属性，提供默认值
      const nodeId = node.id || `node-${Math.random().toString(36).substring(2, 10)}`
      const nodeType = node.type || 'roundedRect' // 使用通用节点类型作为默认值
      const nodePosition = node.position || { x: 0, y: 0 }
      
      // 提取基本属性
      const baseNode = {
        id: nodeId,
        type: nodeType,
        position: {
          x: typeof nodePosition.x === 'number' ? nodePosition.x : 0,
          y: typeof nodePosition.y === 'number' ? nodePosition.y : 0
        },
        data: {
          ...node.data, // 保留所有原始数据属性
          label: node.data?.label || '',
          style: node.data?.style || {},
          fontSize: node.data?.fontSize || 14,
          color: node.data?.color || '#000000'
        },
        draggable: false,
        selectable: false,
        connectable: false
      }

      // 检查节点类型是否是已注册的类型
      const supportedTypes = ['roundedRect', 'textLabel', 'line', 'startEnd', 'condition', 'circle', 'svgIcon']
      const isKnownType = supportedTypes.includes(nodeType)
      
      // 如果类型未注册，使用默认类型
      if (!isKnownType) {
        return {
          ...baseNode,
          type: 'roundedRect', // 使用圆角矩形作为默认显示
          data: {
            ...baseNode.data,
            label: `${baseNode.data.label} (${nodeType})`, // 显示原始类型信息
            style: {
              width: '120px',
              height: '42px',
              backgroundColor: '#f8f8f8',
              border: '1px dashed #999'
            }
          }
        }
      }

      // 直接返回原始节点，保留所有数据属性，仅添加必要的缺省值
      return baseNode;
    })
    
    // 记录有效的节点ID，用于过滤边
    const validNodeIds = new Set(nodesWithDisabledDrag.map((node: any) => node.id))
    
    // 创建节点位置映射，用于后续边的对齐处理
    nodePositions.value = {}
    nodesWithDisabledDrag.forEach((node: any) => {
      // 获取节点宽高
      let width = 120; // 默认宽度
      let height = 42; // 默认高度
      
      // 从节点样式中获取宽高
      if (node.data?.style) {
        if (node.data.style.width) {
          const widthStr = String(node.data.style.width);
          width = parseInt(widthStr, 10) || width;
        }
        if (node.data.style.height) {
          const heightStr = String(node.data.style.height);
          height = parseInt(heightStr, 10) || height;
        }
      }
      
      nodePositions.value[node.id] = {
        x: node.position.x,
        y: node.position.y,
        width,
        height
      };
    });
    
    // 处理边数据，过滤掉无效的边（源节点或目标节点不存在）
    const edgesWithStyle = flowData.edges
      .filter((edge: any) => {
        const sourceExists = validNodeIds.has(edge.source)
        const targetExists = validNodeIds.has(edge.target)
        
        if (!sourceExists || !targetExists) {
          return false
        }
        
        return true
      })
      .map((edge: Edge) => {
        const edgeStyle = (edge.style || {}) as Record<string, any>
        const edgeData = edge.data || {}
        
        // 构造一个更简单、更与 FlowEditor 一致的边定义
        const processedEdge = {
          id: edge.id,
          type: 'smoothstep', // 强制使用smoothstep类型，与FlowEditor一致
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          style: {
            strokeWidth: edgeData.savedLineWidth || edgeStyle.strokeWidth || 1,
            stroke: edgeData.savedLineColor || edgeStyle.stroke || '#555555',
            strokeDasharray: edgeData.savedLineStyle === 'dashed' ? '5 5' : 
                             edgeData.savedLineStyle === 'dotted' ? '2 2' : 
                             edgeStyle.strokeDasharray
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
          label: edgeData.label || edge.label || '',
          data: {
            savedLineWidth: edgeData.savedLineWidth || edgeStyle.strokeWidth || 1,
            savedLineColor: edgeData.savedLineColor || edgeStyle.stroke || '#555555',
            savedLineStyle: edgeData.savedLineStyle || (edgeStyle.strokeDasharray === '5 5' ? 'dashed' : edgeStyle.strokeDasharray === '2 2' ? 'dotted' : 'solid'),
            savedArrowStyle: edgeData.savedArrowStyle || 'target',
            label: edgeData.label || edge.label || ''
          }
        };
        
        return processedEdge;
      });
    
    // 直接使用原始节点和边，不进行任何位置调整
    nodes.value = nodesWithDisabledDrag;
    edges.value = edgesWithStyle;
    
    // 如果实例已经初始化，允许自动适配视口
    if (vueFlowInstance.value) {
      // 立即调用一次fitView
      vueFlowInstance.value.fitView({ padding: 0.4 });
      
      // 延迟一段时间后再次调用，确保所有节点都已正确渲染
      setTimeout(() => {
        vueFlowInstance.value.fitView({ 
          padding: 0.4, 
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 2.0
        });
        
        // 再延迟一段时间后再执行居中，解决某些浏览器渲染延迟问题
        setTimeout(() => {
          centerFlowchart();
        }, 200);
      }, 300);
    }
    
  } catch (err: any) {
    error.value = err.message || '流程图数据格式不正确'
    nodes.value = []
    edges.value = []
    return Promise.reject(err)
  }
}

// 添加错误边界处理
const handleError = (error: any) => {
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
      const errorText = await response.text()
      throw new Error(`获取流程图数据失败: ${response.status} ${response.statusText}`)
    }
    
    const flowData = await response.json()
    
    if (!flowData || !flowData.nodes || !flowData.edges) {
      throw new Error('API返回的数据格式不正确')
    }
    
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
watch([() => props.flowId, () => props.flowData], ([newFlowId, newFlowData]) => {
  // 如果存在之前的请求，取消它
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  
  // 优先使用直接传入的数据
  if (newFlowData) {
    processFlowData(newFlowData).catch(handleError)
  } else if (newFlowId) {
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

/* 边缘和连线样式 - 修改为与 FlowEditor 一致 */
.vue-flow__edge {
  stroke-width: 1px !important;
  stroke: #555555 !important;
}

.vue-flow__edge-path {
  fill: none !important;
  /* 为了与查看模式一致，仍然禁用交互 */
  pointer-events: none !important;
}

.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #409eff !important;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}

.vue-flow__edge.animated .vue-flow__edge-path {
  stroke-dasharray: 5 !important;
  animation: dashdraw 0.5s linear infinite !important;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* 边缘标签样式 */
.vue-flow__edge text,
.vue-flow__edge .vue-flow__edge-text,
.vue-flow__edge-textwrapper text,
.vue-flow .vue-flow__edge .vue-flow__edge-text {
  font-weight: 400 !important;
  font-size: 12px !important;
  fill: #333 !important;
  font-family: Arial, sans-serif !important;
  pointer-events: none;
  stroke: none !important;
  stroke-width: 0 !important;
  text-rendering: geometricPrecision !important;
  letter-spacing: normal !important;
  paint-order: normal !important;
}

/* 边缘标签背景 */
.vue-flow__edge .vue-flow__edge-textbg,
.vue-flow__edge-textwrapper rect,
.vue-flow .vue-flow__edge .vue-flow__edge-textbg {
  fill: white !important;
  stroke: none !important;
  stroke-width: 0 !important;
  filter: none !important;
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
  fill: currentColor !important;
  transform: scale(1.5) !important;
  transform-origin: center !important;
}

/* 调整箭头大小随线条粗细的变化比例 */
.vue-flow__edge[style*="stroke-width: 1px"] .vue-flow__arrowhead {
  transform: scale(1.5) !important;
}

.vue-flow__edge[style*="stroke-width: 2px"] .vue-flow__arrowhead {
  transform: scale(1.7) !important;
}

.vue-flow__edge[style*="stroke-width: 3px"] .vue-flow__arrowhead {
  transform: scale(1.9) !important;
}

.vue-flow__edge[style*="stroke-width: 4px"] .vue-flow__arrowhead {
  transform: scale(2.1) !important;
}

.vue-flow__edge[style*="stroke-width: 5px"] .vue-flow__arrowhead {
  transform: scale(2.3) !important;
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
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.error-icon {
  font-size: 24px;
  margin-bottom: 6px;
  display: block;
}

.error-content p {
  margin: 0;
  color: #ff4d4f;
  font-size: 16px;
}

.retry-button {
  margin-top: 8px;
  padding: 6px 16px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background-color: #40a9ff;
}

/* 确保所有节点的选中状态样式不影响其形状 */
.vue-flow__node.selected {
  box-shadow: none !important;
}

/* 圆形节点（正确的圆形形状）*/
.vue-flow .vue-flow__node.vue-flow__node-circle {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  outline: none !important;
}

/* 圆形节点内部样式 */
.circle-node {
  padding: 8px;
  background: transparent;
  width: 38px;       /* 设置默认宽度 */
  height: 38px;      /* 设置默认高度 */
  min-width: 38px;   /* 设置最小宽度 */
  min-height: 38px;  /* 设置最小高度 */
  display: flex;
  border: none;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;   /* 设置默认字体大小 */
  box-sizing: border-box;
}

.circle-background {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  margin: 1px;
  pointer-events: none;
  z-index: 0;  /* 确保背景在最底层 */
}

/* 确保圆形节点的选中状态样式也被正确应用 */
.vue-flow .vue-flow__node.vue-flow__node-circle.selected,
.vue-flow .vue-flow__node.vue-flow__node-circle:focus,
.vue-flow .vue-flow__node.vue-flow__node-circle:focus-visible {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  background-color: transparent !important;
}

.vue-flow .vue-flow__node.vue-flow__node-circle::before,
.vue-flow .vue-flow__node.vue-flow__node-circle::after {
  display: none !important;
}

/* SVG图标节点特殊样式 - 使用更高优先级选择器覆盖Vue Flow默认样式 */
.vue-flow .vue-flow__node.vue-flow__node-svgIcon {
  border: none !important;
  background-color: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  min-width: 16px !important;
  min-height: 16px !important;
  width: auto !important;
  height: auto !important;
}

/* SVG图标节点内部样式 */
.svg-icon-node {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent !important;
  min-width: 16px;
  min-height: 16px;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  outline: none !important;
}

.svg-icon {
  transition: all 0.2s;
}

/* 确保选中状态下也没有边框 */
.vue-flow .vue-flow__node.vue-flow__node-svgIcon.selected,
.vue-flow .vue-flow__node.vue-flow__node-svgIcon:focus,
.vue-flow .vue-flow__node.vue-flow__node-svgIcon:focus-visible {
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  background-color: transparent !important;
}

.vue-flow .vue-flow__node.vue-flow__node-svgIcon::before,
.vue-flow .vue-flow__node.vue-flow__node-svgIcon::after {
  display: none !important;
}
</style> 