<template>
  <div class="app">
    <TopToolbar />
    <div class="main-content">
      <LeftSidebar />
      <div class="canvas-container">
        <VueFlow
          v-model="elements"
          :node-types="nodeTypes"
          :default-zoom="1.5"
          :min-zoom="0.2"
          :max-zoom="4"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :connection-mode="ConnectionMode.Loose"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :edges-updatable="true"
          :connect-on-click="false"
          class="vue-flow-wrapper"
          @connect="onConnectHandler"
          @drop="onDrop"
          @dragover="onDragOver"
          @nodeClick="onNodeClick"
          @edgeClick="onEdgeClick"
          @paneClick="onPaneClick"
          @nodeDragStop="onNodeDragStop"
        >
          <!-- 注册自定义节点 -->
          <template #node-roundedRect="nodeProps">
            <RoundedRectNode v-bind="nodeProps" />
          </template>
          <template #node-textLabel="nodeProps">
            <TextLabelNode v-bind="nodeProps" />
          </template>

          <!-- 添加背景 -->
          <Background :pattern-color="'#aaa'" :gap="20" />
        </VueFlow>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, markRaw, computed } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode, Panel, Controls, MiniMap, NodeTypes, EdgeTypes, Connection, MarkerType, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import TopToolbar from './components/Toolbar/TopToolbar.vue'
import LeftSidebar from './components/Sidebar/LeftSidebar.vue'
import RoundedRectNode from './components/Nodes/RoundedRectNode.vue'
import TextLabelNode from './components/Nodes/TextLabelNode.vue'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const { addNodes, addEdges, removeNodes, removeEdges, findNode, findEdge, getNodes, getEdges, onConnect, onNodeDragStop, updateEdge, setEdges } = useVueFlow()

const elements = ref([])

// 当前选中的节点和边
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

// 添加一个标志，表示最近是否点击了边
const recentlyClickedEdge = ref(false)

// 添加一个标志，表示是否正在调整大小
const isResizing = ref(false)

// 添加一个标志，表示调整大小是否刚刚结束
const resizeJustEnded = ref(false)

// 注册自定义节点和边类型 - 使用 markRaw 避免组件被设为响应式
const nodeTypes: NodeTypes = {
  roundedRect: markRaw(RoundedRectNode),
  textLabel: markRaw(TextLabelNode)
}

// 初始化节点和边
const initialNodes = ref([])
const initialEdges = ref([])

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
  console.log('Edge created:', edge.id)
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

// 处理节点选中
const onNodeClick = (event: NodeMouseEvent) => {
  // 阻止事件冒泡，防止触发 onPaneClick
  event.event?.stopPropagation()
  
  const { node } = event
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  
  // 清除所有边的选中状态
  elements.value.forEach(el => {
    if (el.type === 'edge') {
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
  console.log('Edge clicked:', edge.id)
  
  // 设置最近点击边的标志，并延长标志有效时间
  recentlyClickedEdge.value = true
  
  // 延长标志有效时间，确保不会被 onPaneClick 清除
  setTimeout(() => {
    recentlyClickedEdge.value = false
  }, 200)
  
  // 取消所有节点的选中状态
  elements.value.forEach(el => {
    if (el.type !== 'edge') {
      el.selected = false
    }
  })
  
  // 取消所有边的选中状态
  elements.value.forEach(el => {
    if (el.type === 'edge') {
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
    
    console.log('Edge selected:', edge.id)
  }
}

// 处理画布点击
const onPaneClick = (event: MouseEvent) => {
  console.log('Pane clicked')
  
  // 如果最近点击了边、正在调整大小或调整大小刚刚结束，不清除选中状态
  if (recentlyClickedEdge.value || isResizing.value || resizeJustEnded.value) {
    console.log('Ignoring pane click because edge was recently clicked or node is being resized')
    
    // 重置调整大小刚刚结束标志
    resizeJustEnded.value = false
    return
  }
  
  // 清除所有节点和边的选中状态
  elements.value.forEach(el => {
    el.selected = false
  })
  
  // 更新选中的节点和边ID
  selectedNodeId.value = null
  selectedEdgeId.value = null
  
  console.log('Pane clicked, clearing selection')
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

// 处理节点拖拽结束事件
const onNodeDragStopHandler = ({ node }) => {
  console.log('Node dragged:', node.id, 'to position:', node.position)
  
  // 确保连接到该节点的边也更新
  const connectedEdges = getEdges.value.filter(
    edge => edge.source === node.id || edge.target === node.id
  )
  
  if (connectedEdges.length > 0) {
    console.log('Connected edges:', connectedEdges.map(e => e.id))
    
    // 保存当前选中的边ID
    const currentSelectedEdgeId = selectedEdgeId.value
    
    // 强制更新连接的边
    const updatedEdges = getEdges.value.map(edge => {
      if (edge.source === node.id || edge.target === node.id) {
        // 保持选中状态
        return { 
          ...edge,
          selected: edge.id === currentSelectedEdgeId
        }
      }
      return edge
    })
    
    // 更新边
    setEdges(updatedEdges)
  }
}

// 监听键盘事件
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  onConnect(onConnectHandler)
  onNodeDragStop(onNodeDragStopHandler)
  
  // 添加边点击事件处理
  const { onEdgeClick: registerEdgeClick } = useVueFlow()
  registerEdgeClick(onEdgeClick)
  
  // 添加全局事件监听器，监听调整大小开始和结束
  window.addEventListener('resize-start', () => {
    isResizing.value = true
    console.log('Resize started')
  })
  
  window.addEventListener('resize-end', () => {
    isResizing.value = false
    resizeJustEnded.value = true
    
    // 设置一个短暂的延时，确保在下一个事件循环中重置标志
    setTimeout(() => {
      resizeJustEnded.value = false
    }, 100)
    
    console.log('Resize ended')
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

/* 移除选中状态的连接线样式，避免与顶部工具栏设置冲突 */
/* .vue-flow__edge.selected,
.vue-flow__edge.selected .vue-flow__edge-path,
.vue-flow .vue-flow__edge.selected .vue-flow__edge-path,
.vue-flow__edge[class*="selected"] .vue-flow__edge-path,
.vue-flow__edge .selected-path,
.vue-flow__edge .selected-edge path {
  stroke: #0000FF !important;
  stroke-width: 3px !important;
} */

/* 移除属性选择器样式 */
/* .vue-flow__edge[data-selected="true"],
.vue-flow__edge[data-selected="true"] .vue-flow__edge-path,
.vue-flow__edge .vue-flow__edge-path[data-selected="true"] {
  stroke: #0000FF !important;
  stroke-width: 3px !important;
} */

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