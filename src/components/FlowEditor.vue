<template>
  <div class="flow-editor">
    <TopToolbar 
      @align="alignNodes"
      @distribute="distributeNodes"
    />
    <div class="main-content">
      <LeftSidebar />
      <div class="canvas-container">
        <VueFlow
          v-model="elements"
          :node-types="nodeTypes"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :connection-mode="ConnectionMode.Loose"
          :zoom-on-scroll="false"     
          :zoom-on-pinch="false" 
          :pan-On-Drag="false"
          :min-zoom="1"               
          :max-zoom="1"               
          :default-zoom="1"
          :pannable="false"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :multi-selection-key-code="'Control'"
          class="vue-flow-wrapper"
          @connect="onConnectHandler"
          @drop="onDrop"
          @dragover="onDragOver"
          @nodeClick="onNodeClick"
          @edgeClick="onEdgeClick"
          @paneClick="onPaneClick"
          @nodeDrag="onNodeDrag"
          @nodeDragStop="handleNodeDragStop"
          @selectionChange="onSelectionChange"
        >
          <!-- 添加对齐线组件 -->
          <AlignmentLines :lines="alignmentLines" />
          
          <!-- 注册自定义节点 -->
          <template #node-roundedRect="nodeProps">
            <RoundedRectNode v-bind="nodeProps" />
          </template>
          <template #node-textLabel="nodeProps">
            <TextLabelNode v-bind="nodeProps" />
          </template>
        </VueFlow>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FlowEditor'
})
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw, computed } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode, MarkerType, Position } from '@vue-flow/core'
import type { Connection, NodeDragEvent, NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import TopToolbar from './Toolbar/TopToolbar.vue'
import LeftSidebar from './Sidebar/LeftSidebar.vue'
import RoundedRectNode from './Nodes/RoundedRectNode.vue'
import TextLabelNode from './Nodes/TextLabelNode.vue'
import type { FlowNode, FlowEdge, AlignDirection, DistributeDirection, NodeDimensions, BaseNode } from '../types/flow'
import { debounce } from 'lodash-es'
import AlignmentLines from './AlignmentLines.vue'
import type { Node as VueFlowNode, Edge as VueFlowEdge, GraphNode } from '@vue-flow/core'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// 获取 Vue Flow 实例和方法
const { 
  addNodes, 
  addEdges, 
  removeNodes, 
  removeEdges, 
  getNodes, 
  getEdges, 
  onConnect, 
  onNodeDragStop: registerNodeDragStop, 
  updateNode
} = useVueFlow()

// 状态定义
const elements = ref<Array<any>>([])
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const recentlyClickedEdge = ref(false)
const isResizing = ref(false)
const resizeJustEnded = ref(false)
const selectedNodes = ref<string[]>([])
const alignmentLines = ref<Array<{ id: string; type: 'horizontal' | 'vertical'; position: number }>>([])
const snapThreshold = 5
const nodeDimensionsCache = new Map<string, NodeDimensions>()

// 注册自定义节点类型
const nodeTypes = {
  roundedRect: markRaw(RoundedRectNode),
  textLabel: markRaw(TextLabelNode)
}

// 计算属性
const selectedNodesList = computed(() => 
  getNodes.value.filter(node => node.selected)
)

const selectedNodesBounds = computed(() => {
  if (selectedNodesList.value.length < 2) return null
  
  const initialBounds = {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity
  }
  
  return selectedNodesList.value.reduce<typeof initialBounds>((acc, node) => {
    if (!isFlowNode(node)) return acc
    const { width, height } = getNodeDimensions(node)
    return {
      left: Math.min(acc.left, node.position.x),
      right: Math.max(acc.right, node.position.x + width),
      top: Math.min(acc.top, node.position.y),
      bottom: Math.max(acc.bottom, node.position.y + height)
    }
  }, initialBounds)
})

// 工具方法
const getDefaultLabel = (type: string): string => {
  switch (type) {
    case 'textLabel': return '文本'
    case 'roundedRect': return '节点'
    case 'input': return '输入'
    case 'topBottom': return '上下连接'
    case 'leftRight': return '左右连接'
    case 'output': return '输出'
    default: return '节点'
  }
}

const isFlowNode = (node: any): node is FlowNode => {
  return node && 
    typeof node.id === 'string' && 
    typeof node.type === 'string' &&
    typeof node.position === 'object' &&
    'data' in node
}

const getNodeDimensions = (node: any): NodeDimensions => {
  const cached = nodeDimensionsCache.get(node.id)
  if (cached) return cached
  
  const element = document.querySelector(`[data-id="${node.id}"]`)
  if (element) {
    const rect = element.getBoundingClientRect()
    const dimensions = {
      width: rect.width,
      height: rect.height
    }
    nodeDimensionsCache.set(node.id, dimensions)
    return dimensions
  }
  
  const defaultDimensions = {
    width: node.type === 'textLabel' ? 150 : 200,
    height: node.type === 'textLabel' ? 40 : 50
  }
  
  nodeDimensionsCache.set(node.id, defaultDimensions)
  return defaultDimensions
}

const clearNodeDimensionsCache = (nodeId: string) => {
  nodeDimensionsCache.delete(nodeId)
}

const updateNodePosition = (nodeId: string, position: { x: number, y: number }) => {
  try {
    const node = getNodes.value.find(n => n.id === nodeId)
    if (!node) {
      throw new Error(`Node ${nodeId} not found`)
    }
    if (!isFlowNode(node)) {
      throw new Error(`Invalid node type for ${nodeId}`)
    }
    
    updateNode(nodeId, {
      ...node,
      position
    })
  } catch (error) {
    console.error('Failed to update node position:', error)
  }
}

const debouncedUpdateView = debounce(() => {
  elements.value = [...elements.value]
}, 16)

// 对齐和分布方法
const alignNodes = (direction: AlignDirection) => {
  const bounds = selectedNodesBounds.value
  if (!bounds) return
  
  const centerX = bounds.left + (bounds.right - bounds.left) / 2
  const centerY = bounds.top + (bounds.bottom - bounds.top) / 2
  
  selectedNodesList.value.forEach(node => {
    if (!isFlowNode(node)) return
    const { width, height } = getNodeDimensions(node)
    let newPosition = { x: node.position.x, y: node.position.y }
    
    switch (direction) {
      case 'left':
        newPosition.x = bounds.left
        break
      case 'right':
        newPosition.x = bounds.right - width
        break
      case 'top':
        newPosition.y = bounds.top
        break
      case 'bottom':
        newPosition.y = bounds.bottom - height
        break
      case 'center':
        newPosition.x = centerX - width / 2
        break
      case 'middle':
        newPosition.y = centerY - height / 2
        break
    }
    
    updateNodePosition(node.id, newPosition)
  })
  
  debouncedUpdateView()
}

const distributeNodes = (direction: DistributeDirection) => {
  if (selectedNodesList.value.length < 3) return
  
  try {
    const nodesInfo = selectedNodesList.value.map((node) => {
      if (!isFlowNode(node)) {
        throw new Error(`Invalid node type for ${node.id}`)
      }
      
      const { width, height } = getNodeDimensions(node)
      return {
        id: node.id,
        width,
        height,
        position: node.position,
        center: direction === 'horizontal' 
          ? node.position.x + width / 2 
          : node.position.y + height / 2
      }
    })
    
    // 按中心点位置排序
    nodesInfo.sort((a, b) => a.center - b.center)
    
    // 获取首尾节点的中心点位置
    const firstCenter = nodesInfo[0].center
    const lastCenter = nodesInfo[nodesInfo.length - 1].center
    
    // 计算间距
    const totalSpace = lastCenter - firstCenter
    const spacing = totalSpace / (nodesInfo.length - 1)
    
    // 批量更新节点位置
    const updates = nodesInfo.map((nodeInfo, index) => {
      if (index === 0 || index === nodesInfo.length - 1) return null
      
      const newCenter = firstCenter + spacing * index
      const newPosition = { ...nodeInfo.position }
      
      if (direction === 'horizontal') {
        newPosition.x = newCenter - nodeInfo.width / 2
      } else {
        newPosition.y = newCenter - nodeInfo.height / 2
      }
      
      return {
        id: nodeInfo.id,
        position: newPosition
      }
    }).filter(Boolean)
    
    // 批量应用更新
    updates.forEach(update => {
      if (update) {
        updateNodePosition(update.id, update.position)
      }
    })
    
    debouncedUpdateView()
    
  } catch (error) {
    console.error('Failed to distribute nodes:', error)
  }
}

// 事件处理方法
const onConnectHandler = (connection: Connection) => {
  const edgeId = `e${connection.source}-${connection.target}`
  
  const edge = {
    id: edgeId,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep',
    style: {
      strokeWidth: 1,
      stroke: '#555555'
    },
    markerEnd: MarkerType.ArrowClosed,
  }
  
  addEdges([edge])
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const type = event.dataTransfer?.getData('application/vueflow')
  if (!type) return

  const wrapper = event.target as HTMLDivElement
  const { left, top } = wrapper.getBoundingClientRect()
  
  const position = {
    x: event.clientX - left - (type === 'textLabel' ? 75 : 100),
    y: event.clientY - top - (type === 'textLabel' ? 20 : 25)
  }

  let newNode: any = {
    id: `${type}-${Date.now()}`,
    position,
    data: { 
      label: getDefaultLabel(type),
      fontSize: 14,
      color: '#000000'
    }
  }
  
  switch (type) {
    case 'textLabel':
      newNode.type = 'textLabel'
      break
    case 'roundedRect':
      newNode.type = 'roundedRect'
      break
    case 'input':
      newNode.type = 'input'
      break
    case 'output':
      newNode.type = 'output'
      break
    case 'topBottom':
      newNode.type = 'default'
      newNode.sourcePosition = Position.Bottom
      newNode.targetPosition = Position.Top
      break
    case 'leftRight':
      newNode.type = 'default'
      newNode.sourcePosition = Position.Right
      newNode.targetPosition = Position.Left
      break
    default:
      newNode.type = type
  }

  addNodes([newNode])
}

const onNodeClick = (event: NodeMouseEvent) => {
  event.event?.stopPropagation()
  
  const { node } = event
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  
  elements.value.forEach((el: any) => {
    if ('type' in el && el.type === 'edge') {
      el.selected = false
      el.class = ''
    }
  })
  
  elements.value = [...elements.value]
}

const onEdgeClick = (event: EdgeMouseEvent) => {
  event.event?.preventDefault()
  event.event?.stopPropagation()
  
  const { edge } = event
  
  recentlyClickedEdge.value = true
  
  setTimeout(() => {
    recentlyClickedEdge.value = false
  }, 200)
  
  elements.value.forEach((el: any) => {
    if ('type' in el && el.type !== 'edge') {
      el.selected = false
    }
  })
  
  elements.value.forEach((el: any) => {
    if ('type' in el && el.type === 'edge') {
      el.selected = false
    }
  })
  
  const edgeIndex = elements.value.findIndex(el => el.id === edge.id)
  if (edgeIndex !== -1) {
    elements.value[edgeIndex].selected = true
    elements.value = [...elements.value]
    selectedEdgeId.value = edge.id
    selectedNodeId.value = null
  }
}

const onPaneClick = (event: MouseEvent) => {
  if (recentlyClickedEdge.value || isResizing.value || resizeJustEnded.value) {
    resizeJustEnded.value = false
    return
  }
  
  elements.value.forEach((el: any) => {
    el.selected = false
  })
  
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

const onNodeDrag = (event: NodeDragEvent) => {
  const { node } = event
  const otherNodes = getNodes.value.filter(n => n.id !== node.id)
  
  alignmentLines.value = calculateAlignment(node, otherNodes)
  
  if (alignmentLines.value.length > 0) {
    const { width, height } = getNodeDimensions(node)
    let newPosition = { ...node.position }
    
    alignmentLines.value.forEach(line => {
      if (line.type === 'vertical') {
        if (Math.abs(line.position - node.position.x) <= snapThreshold) {
          newPosition.x = line.position
        }
        else if (Math.abs(line.position - (node.position.x + width / 2)) <= snapThreshold) {
          newPosition.x = line.position - width / 2
        }
        else if (Math.abs(line.position - (node.position.x + width)) <= snapThreshold) {
          newPosition.x = line.position - width
        }
      } else {
        if (Math.abs(line.position - node.position.y) <= snapThreshold) {
          newPosition.y = line.position
        }
        else if (Math.abs(line.position - (node.position.y + height / 2)) <= snapThreshold) {
          newPosition.y = line.position - height / 2
        }
        else if (Math.abs(line.position - (node.position.y + height)) <= snapThreshold) {
          newPosition.y = line.position - height
        }
      }
    })
    
    updateNodePosition(node.id, newPosition)
  }
}

const handleNodeDragStop = debounce((e: NodeDragEvent) => {
  const { node } = e
  
  alignmentLines.value = []
  clearNodeDimensionsCache(node.id)
  debouncedUpdateView()
}, 16)

const onSelectionChange = debounce(({ nodes }: { nodes: any[] }) => {
  selectedNodes.value = nodes.map(node => node.id)
  nodes.forEach(node => {
    clearNodeDimensionsCache(node.id)
  })
}, 16)

// 键盘事件处理
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Delete') {
    if (selectedNodeId.value) {
      removeNodes([selectedNodeId.value])
      selectedNodeId.value = null
    }
    if (selectedEdgeId.value) {
      removeEdges([selectedEdgeId.value])
      selectedEdgeId.value = null
    }
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  onConnect(onConnectHandler)
  registerNodeDragStop(handleNodeDragStop)
  
  const { onEdgeClick: registerEdgeClick } = useVueFlow()
  registerEdgeClick(onEdgeClick)
  
  window.addEventListener('resize-start', () => {
    isResizing.value = true
  })
  
  window.addEventListener('resize-end', () => {
    isResizing.value = false
    resizeJustEnded.value = true
    
    setTimeout(() => {
      resizeJustEnded.value = false
    }, 100)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  
  window.removeEventListener('resize-start', () => {
    isResizing.value = true
  })
  
  window.removeEventListener('resize-end', () => {
    isResizing.value = false
    resizeJustEnded.value = true
  })
  
  debouncedUpdateView.cancel()
  handleNodeDragStop.cancel()
  onSelectionChange.cancel()
})

// 计算对齐位置
const calculateAlignment = (draggedNode: any, otherNodes: any[]) => {
  const lines: typeof alignmentLines.value = []
  const { width, height } = getNodeDimensions(draggedNode)
  
  const draggedBounds = {
    left: draggedNode.position.x,
    right: draggedNode.position.x + width,
    top: draggedNode.position.y,
    bottom: draggedNode.position.y + height,
    centerX: draggedNode.position.x + width / 2,
    centerY: draggedNode.position.y + height / 2
  }
  
  otherNodes.forEach(node => {
    if (node.id === draggedNode.id) return
    
    const { width: nodeWidth, height: nodeHeight } = getNodeDimensions(node)
    const nodeBounds = {
      left: node.position.x,
      right: node.position.x + nodeWidth,
      top: node.position.y,
      bottom: node.position.y + nodeHeight,
      centerX: node.position.x + nodeWidth / 2,
      centerY: node.position.y + nodeHeight / 2
    }
    
    const verticalAlignments = [
      { reference: nodeBounds.left, dragged: draggedBounds.left, type: 'left' },
      { reference: nodeBounds.centerX, dragged: draggedBounds.centerX, type: 'center' },
      { reference: nodeBounds.right, dragged: draggedBounds.right, type: 'right' }
    ]
    
    verticalAlignments.forEach(({ reference, dragged, type }) => {
      if (Math.abs(reference - dragged) <= snapThreshold) {
        lines.push({
          id: `v-${node.id}-${type}`,
          type: 'vertical',
          position: reference
        })
      }
    })
    
    const horizontalAlignments = [
      { reference: nodeBounds.top, dragged: draggedBounds.top, type: 'top' },
      { reference: nodeBounds.centerY, dragged: draggedBounds.centerY, type: 'center' },
      { reference: nodeBounds.bottom, dragged: draggedBounds.bottom, type: 'bottom' }
    ]
    
    horizontalAlignments.forEach(({ reference, dragged, type }) => {
      if (Math.abs(reference - dragged) <= snapThreshold) {
        lines.push({
          id: `h-${node.id}-${type}`,
          type: 'horizontal',
          position: reference
        })
      }
    })
  })
  
  return lines
}
</script>

<style>
.flow-editor {
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

.vue-flow__edge {
  stroke-width: 1px !important;
  stroke: #555555 !important;
}

.vue-flow__edge:hover,
.vue-flow__edge:hover .vue-flow__edge-path {
  stroke: #8080FF !important;
}

.vue-flow__edge.animated {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

.vue-flow__edge-interaction-path {
  cursor: pointer !important;
  pointer-events: all !important;
  stroke-opacity: 0;
  stroke-width: 25px !important;
}

.vue-flow__edge.edge-selected .vue-flow__edge-path,
.vue-flow__edge.selected .vue-flow__edge-path {
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}

.vue-flow__edge-path {
  pointer-events: stroke !important;
  cursor: pointer !important;
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: white;
  border: 1px solid #1a192b;
  border-radius: 2px;
  z-index: 10;
  pointer-events: all !important;
}

.nodrag {
  pointer-events: all !important;
}

.vue-flow__node .vue-flow__edge-interaction-path {
  pointer-events: none !important;
}

.vue-flow__node * {
  pointer-events: auto !important;
}

.vue-flow__node.resizing .vue-flow__edge-interaction-path,
.vue-flow__node.resizing .vue-flow__edge-path {
  pointer-events: none !important;
}
</style> 