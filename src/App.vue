<template>
  <div class="app">
    <TopToolbar 
      @align="alignNodes"
      @distribute="distributeNodes"
    />
    <div class="main-content">
      <LeftSidebar />
      <!-- 使用 FlowEditor 作为容器 -->
      <FlowEditor class="canvas-container">
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
      </FlowEditor>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw, computed } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode, Connection, MarkerType, Position, NodeDragEvent } from '@vue-flow/core'
import type { NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import TopToolbar from './components/Toolbar/TopToolbar.vue'
import LeftSidebar from './components/Sidebar/LeftSidebar.vue'
import RoundedRectNode from './components/Nodes/RoundedRectNode.vue'
import TextLabelNode from './components/Nodes/TextLabelNode.vue'
import FlowEditor from './components/FlowEditor.vue'
import type { FlowNode, FlowEdge, AlignDirection, DistributeDirection, NodeDimensions } from './types/flow'
import { debounce } from 'lodash-es'
import AlignmentLines from './components/AlignmentLines.vue'
import type { GraphNode} from '@vue-flow/core'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const { 
  addNodes, 
  addEdges, 
  removeNodes, 
  removeEdges, 
  getNodes, 
  getEdges, 
  onConnect, 
  onNodeDragStop, 
  updateNode
} = useVueFlow()

const elements = ref<Array<FlowNode | FlowEdge>>([])

// 当前选中的节点和边
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

// 添加一个标志，表示最近是否点击了边
const recentlyClickedEdge = ref(false)

// 添加一个标志，表示是否正在调整大小
const isResizing = ref(false)

// 添加一个标志，表示调整大小是否刚刚结束
const resizeJustEnded = ref(false)

// 添加选中节点集合
const selectedNodes = ref<string[]>([])

// 注册自定义节点和边类型 - 使用 markRaw 避免组件被设为响应式
const nodeTypes: NodeTypes = {
  roundedRect: markRaw(RoundedRectNode),
  textLabel: markRaw(TextLabelNode)
}

// 缓存节点尺寸
const nodeDimensionsCache = new Map<string, NodeDimensions>()

const getNodeDimensions = (node: FlowNode): NodeDimensions => {
  // 检查缓存
  const cached = nodeDimensionsCache.get(node.id)
  if (cached) return cached
  
  const element = document.querySelector(`[data-id="${node.id}"]`)
  if (element) {
    const rect = element.getBoundingClientRect()
    const dimensions = {
      width: rect.width,
      height: rect.height
    }
    // 存入缓存
    nodeDimensionsCache.set(node.id, dimensions)
    return dimensions
  }
  
  const defaultDimensions = node.type === 'textLabel' ? 
    { width: 150, height: 40 } : 
    { width: 200, height: 50 }
  
  // 存入缓存
  nodeDimensionsCache.set(node.id, defaultDimensions)
  return defaultDimensions
}

// 在节点更新时清除缓存
const clearNodeDimensionsCache = (nodeId: string) => {
  nodeDimensionsCache.delete(nodeId)
}

// 使用 computed 优化性能
const selectedNodesList = computed(() => 
  getNodes.value.filter(node => node.selected)
)


// 修改 selectedNodesBounds computed 属性
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

// 添加类型守卫
const isFlowNode = (node: any): node is FlowNode => {
  return node && 
    typeof node.id === 'string' && 
    (node.type === 'roundedRect' || node.type === 'textLabel') &&
    typeof node.position === 'object'
}

// 添加错误处理
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

// 防抖处理节点位置更新
const debouncedUpdateView = debounce(() => {
  elements.value = [...elements.value]
}, 16) // 约60fps


// 处理连线事件
const onConnectHandler = (connection: Connection) => {
  // 生成唯一ID
  const edgeId = `e${connection.source}-${connection.target}`
  
  // 创建新的边
  const edge = {
    id: edgeId,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep', // 改为使用内置的 smoothstep 类型
    style: {
      strokeWidth: 1,
      stroke: '#555555'
    },
    markerEnd: MarkerType.ArrowClosed,
  }
  
  // 添加边到画布
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

  // 创建新节点
  let newNode: any = {
    id: `${type}-${Date.now()}`,
    position,
    data: { 
      label: getDefaultLabel(type),
      fontSize: 14,
      color: '#000000'
    }
  }
  
  // 根据节点类型设置特定属性
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

// 根据节点类型获取默认标签文本
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

// 修改处理节点点击事件
const onNodeClick = (event: NodeMouseEvent) => {
  // 阻止事件冒泡，防止触发 onPaneClick
  event.event?.stopPropagation()
  
  const { node } = event
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  
  // 清除所有边的选中状态
  elements.value.forEach((el: FlowNode | FlowEdge) => {
    if ('type' in el && el.type === 'edge') {
      el.selected = false
      el.class = ''
    }
  })
  
  // 强制更新视图
  elements.value = [...elements.value]
}

// 处理边选中
const onEdgeClick = (event: EdgeMouseEvent) => {
  // 阻止事件冒泡，防止触发 onPaneClick
  event.event?.preventDefault()
  event.event?.stopPropagation()
  
  const { edge } = event
  
  // 设置最近点击边的标志，并延长标志有效时间
  recentlyClickedEdge.value = true
  
  // 延长标志有效时间，确保不会被 onPaneClick 清除
  setTimeout(() => {
    recentlyClickedEdge.value = false
  }, 200)
  
  // 取消所有节点的选中状态
  elements.value.forEach((el: FlowNode | FlowEdge) => {
    if ('type' in el && el.type !== 'edge') {
      el.selected = false
    }
  })
  
  // 取消所有边的选中状态
  elements.value.forEach((el: FlowNode | FlowEdge) => {
    if ('type' in el && el.type === 'edge') {
      el.selected = false
    }
  })
  
  // 设置当前边为选中状态
  const edgeIndex = elements.value.findIndex(el => el.id === edge.id)
  if (edgeIndex !== -1) {
    elements.value[edgeIndex].selected = true
    
    // 强制更新视图
    elements.value = [...elements.value]
    
    // 更新选中的边ID
    selectedEdgeId.value = edge.id
    selectedNodeId.value = null
  }
}

// 处理画布点击
const onPaneClick = (event: MouseEvent) => {
  // 如果最近点击了边、正在调整大小或调整大小刚刚结束，不清除选中状态
  if (recentlyClickedEdge.value || isResizing.value || resizeJustEnded.value) {
    // 重置调整大小刚刚结束标志
    resizeJustEnded.value = false
    return
  }
  
  // 清除所有节点和边的选中状态
  elements.value.forEach((el: FlowNode | FlowEdge) => {
    el.selected = false
  })
  
  // 更新选中的节点和边ID
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

// 处理键盘删除
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

// 修改对齐方法
const alignNodes = (direction: AlignDirection) => {
  const bounds = selectedNodesBounds.value
  if (!bounds) return
  
  const centerX = bounds.left + (bounds.right - bounds.left) / 2
  const centerY = bounds.top + (bounds.bottom - bounds.top) / 2
  
  selectedNodesList.value.forEach(node => {
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
  
  // 使用防抖更新视图
  debouncedUpdateView()
}

// 修改分布方法
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
    
    // 使用防抖更新视图
    debouncedUpdateView()
    
  } catch (error) {
    console.error('Failed to distribute nodes:', error)
  }
}


// 添加新的状态
const alignmentLines = ref<Array<{ id: string; type: 'horizontal' | 'vertical'; position: number }>>([])
const snapThreshold = 5 // 吸附阈值（像素）

// 计算对齐位置
const calculateAlignment = (draggedNode: FlowNode, otherNodes: FlowNode[]) => {
  const lines: typeof alignmentLines.value = []
  const { width, height } = getNodeDimensions(draggedNode)
  
  // 获取拖动节点的边界
  const draggedBounds = {
    left: draggedNode.position.x,
    right: draggedNode.position.x + width,
    top: draggedNode.position.y,
    bottom: draggedNode.position.y + height,
    centerX: draggedNode.position.x + width / 2,
    centerY: draggedNode.position.y + height / 2
  }
  
  // 检查与其他节点的对齐
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
    
    // 检查垂直对齐
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
    
    // 检查水平对齐
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

// 修改节点拖动事件
const onNodeDrag = (event: NodeDragEvent) => {
  const { node } = event
  const otherNodes = getNodes.value.filter(n => n.id !== node.id)
  
  // 计算对齐线
  alignmentLines.value = calculateAlignment(node, otherNodes)
  
  // 如果有对齐线，进行吸附
  if (alignmentLines.value.length > 0) {
    const { width, height } = getNodeDimensions(node)
    let newPosition = { ...node.position }
    
    alignmentLines.value.forEach(line => {
      if (line.type === 'vertical') {
        // 检查左边对齐
        if (Math.abs(line.position - node.position.x) <= snapThreshold) {
          newPosition.x = line.position
        }
        // 检查中心对齐
        else if (Math.abs(line.position - (node.position.x + width / 2)) <= snapThreshold) {
          newPosition.x = line.position - width / 2
        }
        // 检查右边对齐
        else if (Math.abs(line.position - (node.position.x + width)) <= snapThreshold) {
          newPosition.x = line.position - width
        }
      } else {
        // 检查顶部对齐
        if (Math.abs(line.position - node.position.y) <= snapThreshold) {
          newPosition.y = line.position
        }
        // 检查中心对齐
        else if (Math.abs(line.position - (node.position.y + height / 2)) <= snapThreshold) {
          newPosition.y = line.position - height / 2
        }
        // 检查底部对齐
        else if (Math.abs(line.position - (node.position.y + height)) <= snapThreshold) {
          newPosition.y = line.position - height
        }
      }
    })
    
    // 更新节点位置
    updateNodePosition(node.id, newPosition)
  }
}

// 修改节点拖动结束事件
const handleNodeDragStop = debounce((e: NodeDragEvent) => {
  const { node } = e
  
  // 清除对齐线
  alignmentLines.value = []
  
  // 清除节点尺寸缓存
  clearNodeDimensionsCache(node.id)
  
  // 更新视图
  debouncedUpdateView()
}, 16)

// 优化选中变化事件
const onSelectionChange = debounce(({ nodes }: { 
  nodes: GraphNode[]
}) => {
  selectedNodes.value = nodes.map(node => node.id)
  nodes.forEach(node => clearNodeDimensionsCache(node.id))
}, 16)

// 监听键盘事件
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  onConnect(onConnectHandler)
  onNodeDragStop(handleNodeDragStop)
  
  // 添加边点击事件处理
  const { onEdgeClick: registerEdgeClick } = useVueFlow()
  registerEdgeClick(onEdgeClick)
  
  // 添加全局事件监听器，监听调整大小开始和结束
  window.addEventListener('resize-start', () => {
    isResizing.value = true
  })
  
  window.addEventListener('resize-end', () => {
    isResizing.value = false
    resizeJustEnded.value = true
    
    // 设置一个短暂的延时，确保在下一个事件循环中重置标志
    setTimeout(() => {
      resizeJustEnded.value = false
    }, 100)
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  
  // 移除全局事件监听器
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
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
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

/* 添加一些全局变量 */
:root {
  --vf-node-bg: #fff;
  --vf-node-text: #222;
  --vf-connection-path: #b1b1b7;
  --vf-handle: #555;
}

/* 添加网格背景样式 */
.vue-flow__background {
  background-color: #f8f8f8;
}

.vue-flow__background-pattern {
  color: #aaa;
}

/* 连接线样式 */
.vue-flow__edge {
  stroke-width: 1px !important;
  stroke: #555555 !important; /* 使用完整的 6 位十六进制格式 */
}

/* 连接线交互状态 */
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

/* 添加交互路径样式 */
.vue-flow__edge-interaction-path {
  cursor: pointer !important;
  pointer-events: all !important;
  stroke-opacity: 0;
  stroke-width: 25px !important; /* 增加宽度，确保更容易选中 */
}

/* 确保选中的边有明显的视觉效果 */
.vue-flow__edge.edge-selected .vue-flow__edge-path,
.vue-flow__edge.selected .vue-flow__edge-path {
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}

/* 确保主路径也可以点击 */
.vue-flow__edge-path {
  pointer-events: stroke !important;
  cursor: pointer !important;
}

/* 确保调整大小锚点在最上层且可点击 */
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

/* 确保锚点不会被其他元素的事件处理覆盖 */
.nodrag {
  pointer-events: all !important;
}

/* 确保连线交互路径不会干扰节点调整大小 */
.vue-flow__node .vue-flow__edge-interaction-path {
  pointer-events: none !important;
}

/* 确保节点内部元素的事件不会被连线事件处理覆盖 */
.vue-flow__node * {
  pointer-events: auto !important;
}

/* 确保调整大小时不会触发连线选中 */
.vue-flow__node.resizing .vue-flow__edge-interaction-path,
.vue-flow__node.resizing .vue-flow__edge-path {
  pointer-events: none !important;
}
</style> 