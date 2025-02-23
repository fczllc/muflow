<template>
  <div class="app">
    <TopToolbar />
    <div class="main-content">
      <LeftSidebar />
      <div class="canvas-container">
        <VueFlow
          v-model="elements"
          :default-zoom="1.5"
          :min-zoom="0.2"
          :max-zoom="4"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :connection-mode="ConnectionMode.Loose"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :edges-updatable="true"
          @connect="onConnect"
          @drop="onDrop"
          @dragover="onDragOver"
          @nodeClick="onNodeClick"
          @edgeClick="onEdgeClick"
          @paneClick="onPaneClick"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import type { Connection, Node, NodeMouseEvent, EdgeMouseEvent } from '@vue-flow/core'
import TopToolbar from './components/Toolbar/TopToolbar.vue'
import LeftSidebar from './components/Sidebar/LeftSidebar.vue'
import RoundedRectNode from './components/Nodes/RoundedRectNode.vue'
import TextLabelNode from './components/Nodes/TextLabelNode.vue'

// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const { addNodes, addEdges, removeNodes, removeEdges } = useVueFlow()

const elements = ref([])

// 当前选中的节点和边
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

// 处理连线事件
const onConnect = (connection: Connection) => {
  const edge = {
    id: `edge-${connection.source}-${connection.target}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep',
    style: {
      strokeWidth: '1px',
      stroke: '#555'
    },
    class: ''
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

  const newNode = {
    id: `${type}-${Date.now()}`,
    type: type === 'textLabel' ? 'textLabel' : 'roundedRect',
    position,
    data: { 
      label: type === 'textLabel' ? '文本标签' : '圆角矩形',
      fontSize: 14,
      color: '#000000'
    }
  }

  addNodes([newNode])
}

// 处理节点选中
const onNodeClick = ({ node }: NodeMouseEvent) => {
  selectedNodeId.value = node.id
}

// 处理边的点击事件
const onEdgeClick = ({ edge }: EdgeMouseEvent) => {
  elements.value = elements.value.map(el => {
    if (el.type === 'edge') {
      el.class = ''
    }
    return el
  })

  selectedNodeId.value = null
  selectedEdgeId.value = edge.id
  edge.class = 'selected'
}

// 处理画布点击，取消选中
const onPaneClick = () => {
  elements.value = elements.value.map(el => {
    if (el.type === 'edge') {
      el.class = ''
    }
    return el
  })

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

// 监听键盘事件
onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
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
  stroke: #555 !important;
}

/* 选中状态的连接线样式 */
.vue-flow__edge.selected {
  stroke: #8080FF !important;
}

/* 连接线交互状态 */
.vue-flow__edge:hover {
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
</style> 