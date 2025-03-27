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
  <div class="flow-editor">
    <TopToolbar 
      @align="alignNodes"
      @distribute="distributeNodes"
      @layer="arrangeLayers"
    />
    <div class="main-content">
      <LeftSidebar :canvasTools="props.canvasTools" />
      <div class="canvas-container">
        <VueFlow
          :nodes="getNodes"
          :edges="getEdges"
          :node-types="nodeTypes"
          :default-viewport="{ x: 0, y: 0, zoom: 1 }"
          :connection-mode="ConnectionMode.Loose"
          :zoom-on-scroll="false"     
          :zoom-on-pinch="false" 
          :zoom-on-double-click="false"
          :pan-on-drag="false"
          :min-zoom="0.1"
          :max-zoom="2"
          :default-zoom="1"
          :pannable="false"
          :autoPanOnNodeDrag="false"
          :node-extent-pad="0"
          :snap-to-grid="false"
          :snap-grid="[2, 2]"
          :multi-selection-key-code="'Control'"
          :default-edge-options="{
            type: 'smoothstep',
            style: {
              strokeWidth: 1,
              stroke: '#555555'
            }
          }"
          class="vue-flow-wrapper"
          @connect="onConnectHandler"
          @drop="onDrop"
          @dragover="onDragOver"
          @nodeClick="onNodeClick"
          @edgeClick="onEdgeClick"
          @paneClick="onPaneClick"
          @paneDoubleClick="onPaneDoubleClick"
          @paneMousedown="onPaneMouseDown"
          @paneMousemove="onPaneMouseMove"
          @paneMouseup="onPaneMouseUp"
          @nodeDrag="onNodeDrag"
          @nodeDragStop="handleNodeDragStop"
          @selectionChange="onSelectionChange"
          @edge-double-click="onEdgeDoubleClick"
          :prevent-scrolling="true"
          :auto-connect="false"
          :elevate-edges-on-select="true"
          :disable-pan-on-node-drag="true"
          :disable-zoom-on-scroll="true"
        >
          <!-- 添加对齐线组件 -->
          <AlignmentLines :lines="alignmentLines" />
          
          <!-- 添加独立的选择框div -->
          <div id="selection-box" class="selection-area" style="display: none; position: absolute;"></div>
          
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
      </div>
    </div>
    
    <!-- 边标签编辑对话框 -->
    <div v-if="showEdgeLabelDialog" class="edge-label-dialog-overlay" @click.self="cancelEdgeLabel">
      <div class="edge-label-dialog">
        <div class="dialog-header">
          <h3>编辑连线标签</h3>
        </div>
        <div class="dialog-body">
          <input 
            ref="edgeLabelInputRef"
            v-model="edgeLabelInput"
            type="text" 
            class="label-input"
            @keydown.enter="confirmEdgeLabel(edgeLabelInput)"
            @keydown.esc="cancelEdgeLabel"
            @keydown.delete.stop
            @keydown.backspace.stop
            placeholder="请输入标签文本"
          />
        </div>
        <div class="dialog-footer">
          <button class="cancel-btn" @click="cancelEdgeLabel">取消</button>
          <button class="confirm-btn" @click="confirmEdgeLabel(edgeLabelInput)">确定</button>
        </div>
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
import { ref, onMounted, onUnmounted, markRaw, computed, nextTick, provide } from 'vue'
import { 
  VueFlow, 
  useVueFlow, 
  ConnectionMode, 
  MarkerType
} from '@vue-flow/core'
import type { 
  Connection, 
  NodeDragEvent, 
  NodeMouseEvent, 
  EdgeMouseEvent, 
  Node
} from '@vue-flow/core'
import TopToolbar from './Toolbar/TopToolbar.vue'
import LeftSidebar from './Sidebar/LeftSidebar.vue'
import RoundedRectNode from './Nodes/RoundedRectNode.vue'
import TextLabelNode from './Nodes/TextLabelNode.vue'
import LineNode from './Nodes/LineNode.vue'
import StartEndNode from './Nodes/StartEndNode.vue'
import ConditionNode from './Nodes/ConditionNode.vue'
import CircleNode from './Nodes/CircleNode.vue'
import SvgIconNode from './Nodes/SvgIconNode.vue'
import AlignmentLines from './AlignmentLines.vue'
import type { FlowNode, AlignDirection, DistributeDirection, NodeDimensions } from '../types/flow'
import { debounce } from 'lodash-es'
// 引入必要的样式
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
// 导入html-to-image库
import { toJpeg, toPng } from 'html-to-image'
// 导入Mermaid解析器
import { parseMermaidFlowchart } from '../utils/mermaid/mermaidParser'

// 自定义NodeComponent类型以解决类型兼容性问题
type NodeComponent = any

// 定义画布工具属性接口
export interface CanvasToolsConfig {
  clear?: boolean
  export?: boolean
  import?: boolean
  saveLocal?: boolean
  saveAPI?: boolean
  help?: boolean
  mermaid?: boolean // 添加Mermaid导入选项
}

// 定义组件属性
interface Props {
  canvasTools?: CanvasToolsConfig
}

// 设置默认属性值
const props = withDefaults(defineProps<Props>(), {
  canvasTools: () => ({
    clear: true,
    export: true,
    import: true,
    saveLocal: true,
    saveAPI: true,
    help: true,
    mermaid: true // 默认启用Mermaid导入
  })
})

// 提供canvasTools配置给子组件
provide('canvasTools', props.canvasTools)

// 获取 Vue Flow 实例和方法
const { 
  findNode, 
  getNodes, 
  getEdges, 
  getViewport, 
  getTransform,
  setNodes, 
  setEdges,
  addNodes, 
  addEdges, 
  updateEdge, 
  removeNodes, 
  removeEdges, 
  onConnect,
  onNodeDragStop: registerNodeDragStop, 
  onEdgeClick: registerEdgeClick,
  updateNodeInternals, // 确保这个方法被正确导入
  project,
  viewportRef,
  fitView,
  getNodeTypes,
  updateNode, // 添加updateNode方法
} = useVueFlow()

// 状态定义
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const recentlyClickedEdge = ref(false)
const pendingConnection = ref<Connection | null>(null)
const isResizing = ref(false)
const resizeJustEnded = ref(false)
const componentMountedRef = ref(true) // 组件挂载状态跟踪
const resizeEndTimeoutRef = ref<ReturnType<typeof setTimeout> | null>(null) // 用于存储resize-end事件处理的timeout引用
const selectedNodes = ref<string[]>([])
const alignmentLines = ref<Array<{ id: string; type: 'horizontal' | 'vertical'; position: number }>>([])
const snapThreshold = 2
const nodeDimensionsCache = new Map<string, NodeDimensions>()
const nodeCenterMap = new Map<string, {x: number, y: number}>()

// 区域选择相关状态
const isSelecting = ref(false)
const startPoint = ref<{ x: number, y: number } | null>(null)
const currentPoint = ref<{ x: number, y: number } | null>(null)
const selectionBoxRef = ref<HTMLElement | null>(null)

// 添加剪贴板状态
interface ClipboardItem {
  type: 'node'
  data: {
    id: string
    type: string
    position: { x: number; y: number }
    data?: {
      label?: string
      fontSize?: number
      color?: string
      style?: Record<string, any>
      draggable?: boolean
      selectable?: boolean
      connectable?: boolean
      [key: string]: any
    }
  }
}
const clipboard = ref<ClipboardItem[]>([])

// 添加历史记录状态
interface HistoryState {
  nodes: FlowNode[]
  edges: any[]
}

const history = ref<HistoryState[]>([])
const currentHistoryIndex = ref(-1)

// 注册自定义节点类型
const nodeTypes = markRaw({
  roundedRect: RoundedRectNode,
  textLabel: TextLabelNode,
  line: LineNode,
  startEnd: StartEndNode,
  condition: ConditionNode,
  circle: CircleNode,
  svgIcon: SvgIconNode
})

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

// 选择区域样式计算
const selectAreaStyle = computed(() => {
  if (!startPoint.value || !currentPoint.value) return {}
  
  const left = Math.min(startPoint.value.x, currentPoint.value.x)
  const top = Math.min(startPoint.value.y, currentPoint.value.y)
  const width = Math.abs(currentPoint.value.x - startPoint.value.x)
  const height = Math.abs(currentPoint.value.y - startPoint.value.y)
  
  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`
  }
})

// 工具方法
const getDefaultLabel = (type: string): string => {
  switch (type) {
    case 'textLabel': return '文本'
    case 'roundedRect': return '节点'
    case 'line': return '直线'
    case 'startEnd': return '起止节点'
    case 'condition': return '条件节点'
    case 'circle': return ''
    case 'svgIcon': return '' // SVG图标节点默认无标签
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
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    // 返回默认尺寸以避免错误
    return {
      width: node.type === 'textLabel' ? 150 : 200,
      height: node.type === 'textLabel' ? 40 : 50
    };
  }
  
  const cached = nodeDimensionsCache.get(node.id);
  if (cached) return cached;
  
  // 首先查找Vue Flow节点容器
  const element = document.querySelector(`[data-id="${node.id}"]`);
  if (element) {
    // 在Vue Flow节点容器内查找实际节点组件
    // 例如：.rounded-rect-node, .condition-node等
    const innerElement = element.querySelector('.rounded-rect-node, .start-end-node, .condition-node, .circle-node, .text-label-node, .line-node, .svg-icon-node');
    
    // 如果找到内部节点组件，使用它的尺寸
    if (innerElement) {
      const rect = innerElement.getBoundingClientRect();
      const dimensions = {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
      nodeDimensionsCache.set(node.id, dimensions);
      return dimensions;
    }
    
    // 如果没有找到内部组件，返回到使用Vue Flow容器的尺寸
    const rect = element.getBoundingClientRect();
    const dimensions = {
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    };
    nodeDimensionsCache.set(node.id, dimensions);
    return dimensions;
  }
  
  // 如果找不到DOM元素，使用默认尺寸
  const defaultDimensions = {
    width: node.type === 'textLabel' ? 150 : 200,
    height: node.type === 'textLabel' ? 40 : 50
  };
  
  nodeDimensionsCache.set(node.id, defaultDimensions);
  return defaultDimensions;
};

const clearNodeDimensionsCache = (nodeId: string) => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return;
  }
  
  nodeDimensionsCache.delete(nodeId);
  nodeCenterMap.delete(nodeId);
};

// 更新节点中心点坐标
const updateNodeCenter = (node: any) => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor') || !node || !node.id) {
    return;
  }
  
  const { width, height } = getNodeDimensions(node);
  // 直接使用精确计算值，不进行四舍五入
  const centerX = node.position.x + width / 2;
  const centerY = node.position.y + height / 2;
  
  // 存储精确的中心点坐标
  nodeCenterMap.set(node.id, {x: centerX, y: centerY});
};

// 修改防抖函数，确保组件卸载时不会继续执行
const initNodeCenters = debounce(() => {
  try {
    // 在执行更新前检查组件是否仍然存在
    if (!document.querySelector('.flow-editor')) {
      return false; // 如果组件已卸载，不执行更新
    }
    
    getNodes.value.forEach(node => {
      // 直接使用节点的原始位置，不进行四舍五入
      updateNodeCenter(node);
    });
    
    return true; // 表示执行成功
  } catch (error) {
    // 错误处理但不输出日志
    return false;
  }
}, 100);

// 添加observeNodes函数，监听节点变化，优化执行逻辑
const observeNodes = () => {
  // 在执行检查前确认组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return false; // 如果组件已卸载，返回false表示不再继续执行
  }
  
  // 只有当节点发生变化时才更新中心点
  const currentNodesCount = getNodes.value.length;
  if (currentNodesCount > 0) {
    initNodeCenters();
  }
  return true; // 返回true表示函数执行成功
}

// 对齐和分布方法
const alignNodes = (direction: AlignDirection) => {
  const bounds = selectedNodesBounds.value
  if (!bounds) return
  
  const centerX = bounds.left + (bounds.right - bounds.left) / 2
  const centerY = bounds.top + (bounds.bottom - bounds.top) / 2
  
  const nodes = getNodes.value.map(node => {
    if (!isFlowNode(node) || !node.selected) return node
    
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
    
    return { ...node, position: newPosition }
  })
  
  setNodes(nodes)
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
    
    // 更新节点位置
    const nodes = getNodes.value.map(node => {
      const nodeInfo = nodesInfo.find(info => info.id === node.id)
      if (!nodeInfo || !node.selected) return node
      
      const index = nodesInfo.findIndex(info => info.id === node.id)
      if (index === 0 || index === nodesInfo.length - 1) return node
      
      const newCenter = firstCenter + spacing * index
      const newPosition = { ...node.position }
      
      if (direction === 'horizontal') {
        newPosition.x = newCenter - nodeInfo.width / 2
      } else {
        newPosition.y = newCenter - nodeInfo.height / 2
      }
      
      return { ...node, position: newPosition }
    })
    
    setNodes(nodes)
  } catch (error) {
    console.error('Failed to distribute nodes:', error)
  }
}

// 添加保存历史记录的方法
const saveToHistory = () => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return;
  }
  
  // 如果当前不在历史记录的最后，删除当前位置之后的记录
  if (currentHistoryIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, currentHistoryIndex.value + 1);
  }
  
  // 获取当前节点和边的状态，确保选中状态是正确的
  const currentNodes = getNodes.value.map(node => {
    // 保留节点的选中状态，这样撤销后可以恢复到正确的选中状态
    return { ...node };
  });
  
  const currentEdges = getEdges.value.map(edge => {
    // 保留边的选中状态
    return { ...edge };
  });
  
  // 保存当前状态
  history.value.push({
    nodes: JSON.parse(JSON.stringify(currentNodes)),
    edges: JSON.parse(JSON.stringify(currentEdges))
  });
  currentHistoryIndex.value = history.value.length - 1;
  
  // 限制历史记录数量，最多保存10步
  if (history.value.length > 10) {
    history.value.shift();
    currentHistoryIndex.value--;
  }
};

// 提供addNodes和saveToHistory函数给子组件使用
provide('addNodes', addNodes)
provide('saveToHistory', saveToHistory)

// 添加清空画布的方法
const clearCanvas = () => {
  setNodes([])
  setEdges([])
  saveToHistory()
}

// 提供clearCanvas方法给子组件使用
provide('clearCanvas', clearCanvas)

// 在script setup部分添加模态对话框相关的变量
const showEdgeLabelDialog = ref(false)
const currentEditingEdge = ref<any>(null)
const edgeLabelInput = ref('')
const edgeLabelInputRef = ref<HTMLInputElement | null>(null)

// 添加对框选节点状态的跟踪
const selectedNodesViaAreaSelection = ref<string[]>([]);

// 修改onConnectHandler函数，在创建新边时默认添加空标签
const onConnectHandler = (connection: Connection) => {
  // 先保存当前状态
  saveToHistory()
  
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
    markerEnd: {
      type: MarkerType.Arrow,
      color: '#555555',
      width: 15,
      height: 15,
      strokeWidth: 2
    },
    data: {
      savedLineWidth: 1,
      savedLineColor: '#555555',
      savedLineStyle: 'solid',
      savedArrowStyle: 'target',
      label: ''  // 确保每条边都有一个空标签
    },
    label: ''  // 默认空标签
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
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return;
  }
  
  const nodeTypeData = event.dataTransfer?.getData('application/vueflow')
  
  if (typeof nodeTypeData === 'string' && nodeTypeData) {
    let nodeType = nodeTypeData
    let iconType: string | undefined
    
    // 尝试解析JSON数据，支持从图标选择器拖拽
    try {
      const parsedData = JSON.parse(nodeTypeData)
      if (parsedData && typeof parsedData === 'object') {
        nodeType = parsedData.nodeType || nodeType
        iconType = parsedData.iconType
      }
    } catch {
      // 如果解析失败，继续使用原始nodeType
    }
    
    const { left, top } = (event.target as HTMLDivElement).getBoundingClientRect()
    const position = project({
      x: event.clientX - left,
      y: event.clientY - top,
    })

    // 保留一位小数并确保整数部分是偶数
    let x = Number(position.x.toFixed(1));
    let y = Number(position.y.toFixed(1));
    
    // 如果整数部分是奇数，则调整为偶数
    if (Math.floor(x) % 2 !== 0) {
      x = Number((Math.floor(x) + 1 + (x - Math.floor(x))).toFixed(1));
    }
    if (Math.floor(y) % 2 !== 0) {
      y = Number((Math.floor(y) + 1 + (y - Math.floor(y))).toFixed(1));
    }

    let newNode: Node = {
      id: `${nodeType}-${getNodes.value.length + 1}`,
      type: nodeType,
      position: { x, y },
      data: { 
        label: getDefaultLabel(nodeType),
        // 为所有节点初始化样式对象
        style: {
          width: nodeType === 'circle' ? '38px' : '100px',
          height: nodeType === 'circle' ? '38px' : nodeType === 'condition' ? '60px' : '38px',
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none'
        }
      }
    }

    // 为直线节点设置特殊属性
    if (nodeType === 'line') {
      newNode = {
        ...newNode,
        data: {
          ...newNode.data,
          style: {
            strokeWidth: 1,
            stroke: '#000000',
            strokeDasharray: ''
          }
        },
        draggable: true,
        selectable: true
      }
    }
    
    // 为SVG图标节点设置属性
    if (nodeType === 'svgIcon' && iconType) {
      newNode = {
        ...newNode,
        data: {
          iconType,
          width: 24,
          height: 24,
          strokeWidth: 2,
          color: '#333333'
        },
        draggable: true,
        selectable: true,
        connectable: false
      }
    }

    // 添加新节点
    addNodes([newNode])
    
    // 使用setTimeout来确保DOM已更新
    setTimeout(() => {
      // 再次检查组件是否存在
      if (!document.querySelector('.flow-editor')) {
        return;
      }
      // 立即更新中心点Map
      updateNodeCenter(newNode);
      
      // 取消选中其他节点，只选中新添加的节点
      const nodes = getNodes.value.map(node => ({
        ...node,
        selected: node.id === newNode.id
      }));
      setNodes(nodes);
      
      // 在添加节点后保存历史记录
      saveToHistory();
    }, 10);
  }
}

const onNodeClick = (event: NodeMouseEvent) => {
  event.event?.stopPropagation()
  
  const { node } = event
  selectedNodeId.value = node.id
  selectedEdgeId.value = null
  
  const nodes = getNodes.value.map(n => ({
    ...n,
    selected: n.id === node.id
  }))
  
  const edges = getEdges.value.map(e => ({
    ...e,
    selected: false
  }))
  
  setNodes(nodes)
  setEdges(edges)
}

const onEdgeClick = (event: EdgeMouseEvent) => {
  event.event?.preventDefault()
  event.event?.stopPropagation()
  
  const { edge } = event
  
  recentlyClickedEdge.value = true
  
  setTimeout(() => {
    recentlyClickedEdge.value = false
  }, 200)
  
  const nodes = getNodes.value.map(n => ({
    ...n,
    selected: false
  }))
  
  const edges = getEdges.value.map(e => ({
    ...e,
    selected: e.id === edge.id
  }))
  
  setNodes(nodes)
  setEdges(edges)
  selectedEdgeId.value = edge.id
  selectedNodeId.value = null
}

// 定义一个公共函数来处理取消选择和编辑状态
const clearSelectionAndEditingState = () => {
  // 清除所有文本选择
  window.getSelection()?.removeAllRanges()
  
  // 检查是否有节点处于编辑状态
  const nodesInEditingState = getNodes.value.filter(node => 
    node.data && node.data.isEditing === true
  )
  
  // 如果有节点处于编辑状态，退出编辑状态
  if (nodesInEditingState.length > 0) {
    const updatedNodes = getNodes.value.map(node => {
      if (node.data && node.data.isEditing === true) {
        // 保留节点编辑前的其他数据，仅更新isEditing状态
        return {
          ...node,
          data: {
            ...node.data,
            isEditing: false
          }
        }
      }
      return node
    })
    
    setNodes(updatedNodes)
    
    // 强制更新这些节点的内部结构
    nodesInEditingState.forEach(node => {
      updateNodeInternals([node.id])
    })
  }
  
  // 取消所有节点和边的选中状态
  const nodes = getNodes.value.map(n => ({
    ...n,
    selected: false
  }))
  
  const edges = getEdges.value.map(e => ({
    ...e,
    selected: false
  }))
  
  setNodes(nodes)
  setEdges(edges)
  
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

// 修改onPaneClick函数
const onPaneClick = (event: MouseEvent) => {
  // 如果正在进行区域选择，不处理点击事件
  if (isSelecting.value) return
  
  if (recentlyClickedEdge.value || isResizing.value || resizeJustEnded.value) {
    resizeJustEnded.value = false
    return
  }
  
  // 使用公共函数取消选择和编辑状态
  clearSelectionAndEditingState()
}

// 修改onPaneDoubleClick函数
const onPaneDoubleClick = (event: MouseEvent) => {
  // 使用公共函数取消选择和编辑状态
  clearSelectionAndEditingState()
}

// 对齐算法，使用中心点Map进行对齐计算
const calculateAlignment = (draggedNode: any) => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return [];
  }
  
  if (!draggedNode || !draggedNode.id || nodeCenterMap.size <= 1) return [];
  
  // 获取当前拖动节点的中心点
  const draggedCenter = nodeCenterMap.get(draggedNode.id);
  if (!draggedCenter) {
    // 如果Map中没有当前节点的中心点，先更新一下
    updateNodeCenter(draggedNode);
    const updatedDraggedCenter = nodeCenterMap.get(draggedNode.id);
    if (!updatedDraggedCenter) return [];
    return [];
  }

  const alignmentLines: Array<{id: string; type: 'horizontal' | 'vertical'; position: number}> = [];
  let closestVertical = {nodeId: '', diff: Infinity, centerX: 0};
  let closestHorizontal = {nodeId: '', diff: Infinity, centerY: 0};
  
  // 查找最近的垂直和水平对齐点
  nodeCenterMap.forEach((center, nodeId) => {
    if (nodeId === draggedNode.id) return;
    
    // 检查X轴对齐(垂直线)
    const xDiff = Math.abs(center.x - draggedCenter.x);
    if (xDiff <= snapThreshold && xDiff < closestVertical.diff) {
      closestVertical = {nodeId, diff: xDiff, centerX: center.x};
    }
    
    // 检查Y轴对齐(水平线)
    const yDiff = Math.abs(center.y - draggedCenter.y);
    if (yDiff <= snapThreshold && yDiff < closestHorizontal.diff) {
      closestHorizontal = {nodeId, diff: yDiff, centerY: center.y};
    }
  });
  
  // 添加垂直对齐线 - 使用目标节点的X坐标
  if (closestVertical.nodeId) {
    alignmentLines.push({
      id: `v-${closestVertical.nodeId}`,
      type: 'vertical',
      position: closestVertical.centerX // 对齐线X坐标使用目标节点的中心点X
    });
  }
  
  // 添加水平对齐线 - 使用目标节点的Y坐标
  if (closestHorizontal.nodeId) {
    alignmentLines.push({
      id: `h-${closestHorizontal.nodeId}`,
      type: 'horizontal',
      position: closestHorizontal.centerY // 对齐线Y坐标使用目标节点的中心点Y
    });
  }
  
  return alignmentLines;
};

// 修改applySnap函数，确保所有计算结果都是保留一位小数
const applySnap = (node: any, alignmentLines: any[]) => {
  // 获取当前节点中心点
  const nodeCenter = nodeCenterMap.get(node.id);
  if (!nodeCenter) {
    return node;
  }
  
  // 获取节点尺寸
  const { width, height } = node.dimensions || getNodeDimensions(node);
  
  // 记录原始位置
  let { x, y } = node.position;
  let adjusted = false;
  
  // 从alignmentLines中找到水平和垂直线
  const horizontalLine = alignmentLines.find(line => line.type === 'horizontal');
  const verticalLine = alignmentLines.find(line => line.type === 'vertical');
  
  if (horizontalLine || verticalLine) {
    // 查找所有要对齐的节点ID
    let targetNodeIdY = '';
    let targetNodeIdX = '';
    
    // 遍历所有节点，找到与对齐线匹配的节点
    nodeCenterMap.forEach((center, id) => {
      if (id === node.id) return;
      
      // 如果水平对齐线的位置与节点中心点Y坐标接近，标记为目标节点
      if (horizontalLine && Math.abs(horizontalLine.position - center.y) < 0.1) {
        targetNodeIdY = id;
      }
      
      // 如果垂直对齐线的位置与节点中心点X坐标接近，标记为目标节点
      if (verticalLine && Math.abs(verticalLine.position - center.x) < 0.1) {
        targetNodeIdX = id;
      }
    });
    
    // 应用水平对齐（中心点Y对齐）
    if (horizontalLine && targetNodeIdY) {
      // 获取目标节点
      const targetNode = getNodes.value.find(n => n.id === targetNodeIdY);
      if (targetNode) {
        // 类似于alignNodes方法，直接计算精确位置
        const targetNodeDim = getNodeDimensions(targetNode);
        const targetCenterY = targetNode.position.y + targetNodeDim.height / 2;
        
        // 直接计算需要设置的Y位置，使得节点中心点与目标中心点对齐
        y = targetCenterY - height / 2;
        adjusted = true;
      }
    }
    
    // 应用垂直对齐（中心点X对齐）
    if (verticalLine && targetNodeIdX) {
      // 获取目标节点
      const targetNode = getNodes.value.find(n => n.id === targetNodeIdX);
      if (targetNode) {
        // 类似于alignNodes方法，直接计算精确位置
        const targetNodeDim = getNodeDimensions(targetNode);
        const targetCenterX = targetNode.position.x + targetNodeDim.width / 2;
        
        // 直接计算需要设置的X位置，使得节点中心点与目标中心点对齐
        x = targetCenterX - width / 2;
        adjusted = true;
      }
    }
  }
  
  // 返回更新后的节点对象（不修改原始对象）
  return {
    ...node,
    position: { x, y }
  };
};

// 修改onNodeDrag函数，添加日志
const onNodeDrag = (event: NodeDragEvent) => {
  try {
    const { node } = event;
    
    // 直接使用节点位置，不再进行四舍五入和偶数化处理
    let newPosition = { ...node.position };
    
    // 更新节点位置 - 创建新的节点对象
    const updatedNodes = getNodes.value.map(n => 
      n.id === node.id ? { ...n, position: newPosition } : n
    );
    
    // 更新状态
    setNodes(updatedNodes);
    
    // 获取更新后的节点
    const updatedNode = updatedNodes.find(n => n.id === node.id);
    if (!updatedNode) return;
    
    // 1. 更新拖动节点的中心点坐标
    updateNodeCenter(updatedNode);
    
    // 2. 计算当前节点与其他节点的对齐位置
    const lines = calculateAlignment(updatedNode);
    
    // 3. 更新对齐线显示
    alignmentLines.value = lines;
    
    // 4. 获取当前节点的中心点
    const centerPoint = nodeCenterMap.get(updatedNode.id);
    if (centerPoint) {
      // 查找所有X坐标差小于3px的节点
      const closeNodesX = Array.from(nodeCenterMap.entries())
        .filter(([id, center]) => {
          if (id === updatedNode.id) return false;
          return Math.abs(center.x - centerPoint.x) <= 3;
        });
      
      // 查找所有Y坐标差小于3px的节点
      const closeNodesY = Array.from(nodeCenterMap.entries())
        .filter(([id, center]) => {
          if (id === updatedNode.id) return false;
          return Math.abs(center.y - centerPoint.y) <= 3;
        });
    }
  } catch (error) {
    // 错误处理但不输出日志
    alignmentLines.value = [];
  }
};

// 修改handleNodeDragStop，确保拖动结束时完全对齐到最近的对象
const handleNodeDragStop = debounce((e: NodeDragEvent) => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    // 如果组件已卸载，直接返回
    return;
  }
  
  const { node } = e;
  
  try {
    // 获取节点当前尺寸
    const { width, height } = getNodeDimensions(node);
    
    // 在停止拖动时，我们应该确保节点与最近的对齐节点完全对齐
    const lines = alignmentLines.value;
    
    // 记录原始位置
    let newPosition = { ...node.position };
    
    // 如果有对齐线，应用吸附
    if (lines.length > 0) {
      // 获取当前节点中心点
      const nodeCenter = nodeCenterMap.get(node.id);
      if (!nodeCenter) {
        return;
      }
      
      // 从alignmentLines中找到水平和垂直线
      const horizontalLine = lines.find(line => line.type === 'horizontal');
      const verticalLine = lines.find(line => line.type === 'vertical');
      
      if (horizontalLine || verticalLine) {
        // 查找所有要对齐的节点ID
        let targetNodeIdY = '';
        let targetNodeIdX = '';
        
        // 遍历所有节点，找到与对齐线匹配的节点
        nodeCenterMap.forEach((center, id) => {
          if (id === node.id) return;
          
          // 如果水平对齐线的位置与节点中心点Y坐标接近，标记为目标节点
          if (horizontalLine && Math.abs(horizontalLine.position - center.y) < 0.1) {
            targetNodeIdY = id;
          }
          
          // 如果垂直对齐线的位置与节点中心点X坐标接近，标记为目标节点
          if (verticalLine && Math.abs(verticalLine.position - center.x) < 0.1) {
            targetNodeIdX = id;
          }
        });
        
        // 应用水平对齐（中心点Y对齐）
        if (horizontalLine && targetNodeIdY) {
          // 获取目标节点
          const targetNode = getNodes.value.find(n => n.id === targetNodeIdY);
          if (targetNode) {
            // 类似于alignNodes方法，直接计算精确位置
            const targetNodeDim = getNodeDimensions(targetNode);
            const targetCenterY = targetNode.position.y + targetNodeDim.height / 2;
            
            // 直接计算需要设置的Y位置，使得节点中心点与目标中心点对齐
            newPosition.y = targetCenterY - height / 2;
          }
        }
        
        // 应用垂直对齐（中心点X对齐）
        if (verticalLine && targetNodeIdX) {
          // 获取目标节点
          const targetNode = getNodes.value.find(n => n.id === targetNodeIdX);
          if (targetNode) {
            // 类似于alignNodes方法，直接计算精确位置
            const targetNodeDim = getNodeDimensions(targetNode);
            const targetCenterX = targetNode.position.x + targetNodeDim.width / 2;
            
            // 直接计算需要设置的X位置，使得节点中心点与目标中心点对齐
            newPosition.x = targetCenterX - width / 2;
          }
        }
      }
    }
    
    // 创建新的节点对象，而不是修改原始对象
    // 这是关键步骤，确保Vue Flow正确更新节点位置
    const updatedNodes = getNodes.value.map(n => 
      n.id === node.id ? { ...n, position: newPosition } : n
    );
    
    // 更新状态
    setNodes(updatedNodes);
    
    // 更新最终位置的中心点坐标
    clearNodeDimensionsCache(node.id); // 清除缓存确保尺寸重新计算
    
    // 使用新创建的节点对象更新中心点
    const updatedNode = updatedNodes.find(n => n.id === node.id);
    if (updatedNode) {
      updateNodeCenter(updatedNode);
    }
  } catch (error) {
    // 错误处理但不输出日志
  } finally {
    // 清除对齐线
    alignmentLines.value = [];
    
    // 检查组件是否仍然存在
    if (document.querySelector('.flow-editor')) {
      saveToHistory(); // 保存历史记录
    }
  }
}, 50);

const onSelectionChange = debounce(({ nodes }: { nodes: any[] }) => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return;
  }
  
  selectedNodes.value = nodes.map(node => node.id)
  nodes.forEach(node => {
    clearNodeDimensionsCache(node.id)
  })
}, 50)

// 修改键盘事件处理
const handleKeyboard = (event: KeyboardEvent) => {
  // 如果正在编辑文本，不处理快捷键
  if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
    return
  }

  // 处理Escape键，退出节点编辑状态和取消选择
  if (event.key === 'Escape') {
    // 使用公共函数取消选择和编辑状态
    clearSelectionAndEditingState()
    
    // 阻止默认行为
    event.preventDefault()
    return
  }

  // 撤销操作 (Ctrl+Z)
  if (event.ctrlKey && event.key === 'z') {
    if (currentHistoryIndex.value > 0) {
      currentHistoryIndex.value--
      const previousState = history.value[currentHistoryIndex.value]
      
      const nodesWithCorrectSelection = previousState.nodes.map(node => ({
        ...node,
        selected: previousState.nodes[previousState.nodes.length - 1] && node.id === previousState.nodes[previousState.nodes.length - 1].id
      }));
      
      setNodes(nodesWithCorrectSelection)
      setEdges(previousState.edges)
      
      // 更新选中节点的ID
      selectedNodeId.value = previousState.nodes[previousState.nodes.length - 1] ? previousState.nodes[previousState.nodes.length - 1].id : null;
    }
  }

  // 方向键处理，移动选中的节点
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
    // 获取所有选中的节点
    const selectedNodes = getNodes.value.filter(node => node.selected);
    if (selectedNodes.length === 0) return;

    // 保存移动前的状态到历史记录
    saveToHistory();

    // 根据方向键计算移动距离（以2像素为增量）
    let dx = 0;
    let dy = 0;
    
    switch(event.key) {
      case 'ArrowUp':
        dy = -2;
        break;
      case 'ArrowDown':
        dy = 2;
        break;
      case 'ArrowLeft':
        dx = -2;
        break;
      case 'ArrowRight':
        dx = 2;
        break;
    }
    
    // 更新节点位置
    const updatedNodes = getNodes.value.map(node => {
      if (!node.selected) return node;
      
      // 计算新位置并保留一位小数
      let newX = Number((node.position.x + dx).toFixed(1));
      let newY = Number((node.position.y + dy).toFixed(1));
      
      // 确保新位置的整数部分是2的倍数
      if (Math.floor(newX) % 2 !== 0) {
        newX = Number((Math.floor(newX) + 1 + (newX - Math.floor(newX))).toFixed(1));
      }
      if (Math.floor(newY) % 2 !== 0) {
        newY = Number((Math.floor(newY) + 1 + (newY - Math.floor(newY))).toFixed(1));
      }
      
      return {
        ...node,
        position: {
          x: newX,
          y: newY
        }
      };
    });
    
    // 应用更新后的节点位置
    setNodes(updatedNodes);
    
    // 更新节点中心点坐标
    updatedNodes.forEach(node => {
      if (node.selected) {
        clearNodeDimensionsCache(node.id);
        updateNodeCenter(node);
      }
    });
    
    // 阻止事件默认行为，防止页面滚动
    event.preventDefault();
    return;
  }

  // 复制快捷键 (Ctrl+C)
  if (event.ctrlKey && event.key === 'c') {
    const selectedNodes = getNodes.value.filter(node => node.selected)
    if (selectedNodes.length > 0) {
      clipboard.value = selectedNodes.map(node => ({
        type: 'node',
        data: {
          id: node.id,
          type: node.type,
          position: { ...node.position },
          data: { 
            ...node.data,
            draggable: true,
            selectable: true,
            connectable: true
          }
        }
      }))
    }
  }

  // 粘贴快捷键 (Ctrl+V)
  if (event.ctrlKey && event.key === 'v') {
    if (clipboard.value.length > 0) {
      const offset = { x: 20, y: 20 }
      const newNodes = clipboard.value.map(item => {
        if (item.type === 'node') {
          const newId = `${item.data.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          return {
            id: newId,
            type: item.data.type,
            position: {
              x: item.data.position.x + offset.x,
              y: item.data.position.y + offset.y
            },
            data: { 
              ...item.data.data,
              draggable: true,
              selectable: true,
              connectable: true
            },
            draggable: true,
            selectable: true,
            connectable: true
          }
        }
        return null
      }).filter(Boolean) as FlowNode[]

      addNodes(newNodes)
      
      // 取消选中其他节点，只选中新添加的节点
      const nodes = getNodes.value.map(node => ({
        ...node,
        selected: newNodes.some(n => n.id === node.id)
      }))
      setNodes(nodes)
      
      // 更新选中节点的ID，如果只粘贴了一个节点
      if (newNodes.length === 1) {
        selectedNodeId.value = newNodes[0].id;
      } else {
        selectedNodeId.value = null; // 多选状态
      }
      
      // 在添加节点后保存历史记录
      saveToHistory()
    }
  }
}

// 修改双击边的事件处理器，使用模态对话框
const onEdgeDoubleClick = (event: EdgeMouseEvent) => {
  event.event?.preventDefault()
  event.event?.stopPropagation()

  const { edge } = event
   
  // 设置当前编辑的边
  currentEditingEdge.value = edge
  
  // 预填充已有标签
  edgeLabelInput.value = typeof edge.label === 'string' ? edge.label : ''
  
  // 显示模态对话框
  showEdgeLabelDialog.value = true
  
  // 在下一个 tick 中聚焦输入框
  nextTick(() => {
    if (edgeLabelInputRef.value) {
      edgeLabelInputRef.value.focus()
      edgeLabelInputRef.value.select()
    }
  })
}

// 添加确认编辑标签的方法
const confirmEdgeLabel = (labelValue: string) => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor') || !currentEditingEdge.value) {
    return;
  }
  
  // 更新边的标签
  const updatedEdges = getEdges.value.map(e => {
    if (e.id === currentEditingEdge.value.id) {
      return { 
        ...e, 
        label: labelValue, 
        data: {
          ...e.data,
          label: labelValue
        }
      };
    }
    return e;
  });
  
  // 保存当前状态到历史记录
  saveToHistory();
  
  // 更新边集合
  setEdges(updatedEdges);
  
  // 关闭对话框并清除当前编辑的边
  showEdgeLabelDialog.value = false;
  currentEditingEdge.value = null;
}

const cancelEdgeLabel = () => {
  // 检查组件是否仍然存在
  if (!document.querySelector('.flow-editor')) {
    return;
  }
  
  showEdgeLabelDialog.value = false;
  currentEditingEdge.value = null;
}

// 生命周期钩子
onMounted(() => {
  // 注册事件监听器
  registerEventListeners();
  
  // 手动获取选择框元素
  const selectionBox = document.getElementById('selection-box');
  if (selectionBox) {
    selectionBoxRef.value = selectionBox;
  } else {
    // 如果找不到，创建一个
    const newSelectionBox = document.createElement('div');
    newSelectionBox.id = 'selection-box';
    newSelectionBox.className = 'selection-area';
    newSelectionBox.style.display = 'none';
    newSelectionBox.style.position = 'absolute';
    newSelectionBox.style.zIndex = '1000';
    
    // 添加到画布容器中
    const canvasContainer = document.querySelector('.canvas-container');
    if (canvasContainer) {
      canvasContainer.appendChild(newSelectionBox);
      selectionBoxRef.value = newSelectionBox;
    }
  }
  
  // 直接在Vue Flow的pane元素上添加原生事件监听器
  const paneElement = document.querySelector('.vue-flow__pane');
  if (paneElement) {
    // 原生鼠标按下事件
    const paneMouseDownHandler = (e: MouseEvent) => {
      // 检查组件是否仍挂载
      if (!componentMountedRef.value) return;
      
      // 手动调用我们的处理函数
      onPaneMouseDown(e);
    };
    
    // 原生鼠标移动事件
    const paneMouseMoveHandler = (e: MouseEvent) => {
      // 检查组件是否仍挂载
      if (!componentMountedRef.value) {
        // 如果组件已卸载，重置状态
        isSelecting.value = false;
        startPoint.value = null;
        currentPoint.value = null;
        return;
      }
      
      if (isSelecting.value) {
        // 手动调用我们的处理函数
        onPaneMouseMove(e);
      }
    };
    
    // 原生鼠标松开事件
    const paneMouseUpHandler = (e: MouseEvent) => {
      // 检查组件是否仍挂载
      if (!componentMountedRef.value) {
        // 如果组件已卸载，重置状态
        isSelecting.value = false;
        startPoint.value = null;
        currentPoint.value = null;
        return;
      }
      
      // 手动调用我们的处理函数
      onPaneMouseUp(e);
    };
    
    // 添加事件监听器
    paneElement.addEventListener('mousedown', paneMouseDownHandler as EventListener);
    document.addEventListener('mousemove', paneMouseMoveHandler as EventListener);
    document.addEventListener('mouseup', paneMouseUpHandler as EventListener);
    
    // 卸载时清除事件监听器
    onUnmounted(() => {
      paneElement.removeEventListener('mousedown', paneMouseDownHandler as EventListener);
      document.removeEventListener('mousemove', paneMouseMoveHandler as EventListener);
      document.removeEventListener('mouseup', paneMouseUpHandler as EventListener);
    });
  }
});

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  // 检查组件是否仍挂载
  if (!componentMountedRef.value) return;
  
  // 如果模态对话框打开，不处理键盘事件
  if (showEdgeLabelDialog.value) {
    return;
  }
  
  // 删除键处理
  if (event.key === 'Delete' || event.key === 'Backspace') {
    // 获取所有选中的节点
    const selectedNodes = getNodes.value.filter(node => node.selected);
    if (selectedNodes.length > 0) {
      // 先保存当前状态
      saveToHistory();
      // 删除所有选中的节点
      removeNodes(selectedNodes.map(node => node.id));
      selectedNodeId.value = null;
    }
    
    // 获取所有选中的边
    const selectedEdges = getEdges.value.filter(edge => edge.selected);
    if (selectedEdges.length > 0) {
      // 先保存当前状态
      saveToHistory();
      // 删除所有选中的边
      removeEdges(selectedEdges.map(edge => edge.id));
      selectedEdgeId.value = null;
    }
  }

  handleKeyboard(event);
};

// 处理调整大小开始事件
const handleResizeStart = (event: Event) => {
  isResizing.value = true;
  // 在调整大小期间不需要特殊处理键盘事件
};

// 处理调整大小结束事件
const handleResizeEnd = (event: Event) => {
  isResizing.value = false;
  resizeJustEnded.value = true;
  
  // 清除任何可能存在的先前的定时器
  if (resizeEndTimeoutRef.value) {
    clearTimeout(resizeEndTimeoutRef.value);
    resizeEndTimeoutRef.value = null;
  }
  
  // 在结束后略微延迟重新生成节点中心点，确保调整尺寸操作已经完全应用
  resizeEndTimeoutRef.value = setTimeout(() => {
    // 再次检查组件是否仍挂载
    if (!componentMountedRef.value) {
      return;
    }
    
    // 可以在这里获取节点的最新尺寸
    try {
      const nodeId = (event as CustomEvent).detail?.nodeId;
      if (nodeId) {
        const node = findNode(nodeId);
      }
    } catch (error) {
      console.error('[FlowEditor] 处理resize-end事件时出错:', error);
    }
    
    resizeJustEnded.value = false;
    
    // 重置引用
    resizeEndTimeoutRef.value = null;
  }, 100);
  
  // 确保不返回值，避免异步响应问题
  return undefined;
};

// 清除事件监听器
const unregisterEventListeners = () => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize-start', handleResizeStart);
  window.removeEventListener('resize-end', handleResizeEnd);
};

// 注册事件监听器
const registerEventListeners = () => {
  // 避免重复注册
  unregisterEventListeners();
  
  // 注册全局事件监听器
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize-start', handleResizeStart);
  window.addEventListener('resize-end', handleResizeEnd);
  
  // 注册Vue Flow事件
  onConnect(onConnectHandler);
  registerNodeDragStop(handleNodeDragStop);
  registerEdgeClick(onEdgeClick);
};

// 在组件卸载时清理
onUnmounted(() => {
  componentMountedRef.value = false;
  
  // 清除resize-end的timeout
  if (resizeEndTimeoutRef.value) {
    clearTimeout(resizeEndTimeoutRef.value);
    resizeEndTimeoutRef.value = null;
  }
  
  // 清除事件监听器
  unregisterEventListeners();
  
  // 其他清理代码...
});

// 初始化历史记录 - 只有当画布上有内容时才保存初始状态
// 只有当画布上有节点或边时才初始化历史记录
if (getNodes.value.length > 0 || getEdges.value.length > 0) {
  saveToHistory();
} else {
  // 如果画布为空，只初始化索引，不保存状态
  currentHistoryIndex.value = -1;
  history.value = [];
}

// 初始化所有节点的中心点坐标
initNodeCenters();

// 监听节点变化，使用较长的间隔
let nodeObserverInterval: number | undefined;
let isComponentMounted = true;
  
const nodeObserverCallback = () => {
  if (!isComponentMounted || !componentMountedRef.value) {
    // 如果组件已卸载，清除定时器
    if (nodeObserverInterval) {
      clearInterval(nodeObserverInterval);
      nodeObserverInterval = undefined;
    }
    return;
  }
    
  // 调用observeNodes并检查返回值
  const shouldContinue = observeNodes();
    
  // 如果返回false，表示应该停止观察
  if (!shouldContinue && nodeObserverInterval) {
    clearInterval(nodeObserverInterval);
    nodeObserverInterval = undefined;
  }
};
  
nodeObserverInterval = window.setInterval(nodeObserverCallback, 1500);
  
  // 在卸载组件前清理所有的计时器和监听器
  onUnmounted(() => {
    // 设置标志，表示组件已卸载
    isComponentMounted = false;
    
    // 取消所有的间隔调用
    if (nodeObserverInterval) {
      clearInterval(nodeObserverInterval);
      nodeObserverInterval = undefined;
    }
    
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('resize-start', handleResizeStart);
    window.removeEventListener('resize-end', handleResizeEnd);
    
    // 取消所有的防抖函数
    if (typeof handleNodeDragStop.cancel === 'function') {
      handleNodeDragStop.cancel();
    }
    
    if (typeof onSelectionChange.cancel === 'function') {
      onSelectionChange.cancel();
    }
    
    if (typeof initNodeCenters.cancel === 'function') {
      initNodeCenters.cancel();
    }
    
    // 清除所有选择状态和编辑状态，避免状态残留
    clearSelectionAndEditingState();
    
    // 清除对齐线
    alignmentLines.value = [];
    
    // 清除当前点和起始点
    currentPoint.value = null;
    startPoint.value = null;
    isSelecting.value = false;
    
    // 如果选择框还存在，清除它
    if (selectionBoxRef.value) {
      selectionBoxRef.value.style.display = 'none';
    }
    
    // 清除所有缓存
    nodeDimensionsCache.clear();
    nodeCenterMap.clear();
  });

// 层级排列方法
const arrangeLayers = (action: 'top' | 'bottom' | 'up' | 'down') => {
  // 获取选中的节点
  const selectedNodeList = getNodes.value.filter(node => node.selected)
  if (selectedNodeList.length === 0) return
  
  // 获取所有节点，按zIndex排序，默认没有zIndex的节点视为0
  const allNodes = getNodes.value.map(node => ({
    ...node,
    zIndex: node.zIndex !== undefined ? node.zIndex : 0
  }))
  
  // 找出当前最大和最小zIndex
  const maxZIndex = Math.max(...allNodes.map(node => node.zIndex || 0))
  const minZIndex = Math.min(...allNodes.map(node => node.zIndex || 0))
  
  // 根据不同的操作更新节点的zIndex
  let updatedNodes: FlowNode[] = []
  
  switch (action) {
    case 'top': // 置于顶层
      updatedNodes = getNodes.value.map(node => ({
        ...node,
        zIndex: node.selected ? maxZIndex + 1 : node.zIndex
      }))
      break
    
    case 'bottom': // 置于底层
      updatedNodes = getNodes.value.map(node => ({
        ...node,
        zIndex: node.selected ? minZIndex - 1 : node.zIndex
      }))
      break
    
    case 'up': // 上移一层
      updatedNodes = getNodes.value.map(node => {
        if (!node.selected) return node
        
        const currentZIndex = node.zIndex !== undefined ? node.zIndex : 0
        return {
          ...node,
          zIndex: currentZIndex + 1
        }
      })
      break
    
    case 'down': // 下移一层
      updatedNodes = getNodes.value.map(node => {
        if (!node.selected) return node
        
        const currentZIndex = node.zIndex !== undefined ? node.zIndex : 0
        return {
          ...node,
          zIndex: currentZIndex - 1
        }
      })
      break
  }
  
  // 更新节点
  setNodes(updatedNodes as any)
  
  // 保存历史记录
  saveToHistory()
}

// 处理画布鼠标按下事件
const onPaneMouseDown = (event: MouseEvent) => {
  // 只处理鼠标左键事件，忽略右键
  if (event.button !== 0) return;
  
  // 检查点击的目标是否是画布
  const target = event.target as HTMLElement;
  
  // 只有在点击画布空白区域或者特定情况下才触发框选
  const isCanvas = target.classList.contains('vue-flow__pane') || 
                 target.classList.contains('vue-flow__container');
  
  if (!isCanvas) {
    return;
  }
  
  // 阻止默认行为，防止触发其他事件
  event.preventDefault();
  event.stopPropagation();
  
  // 获取画布元素的边界矩形
  const vueFlowElement = document.querySelector('.vue-flow');
  
  if (vueFlowElement) {
    const rect = vueFlowElement.getBoundingClientRect();
    
    // 计算相对于画布的点击位置
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 设置起始点
    startPoint.value = { x, y };
    
    // 设置为选择状态
    isSelecting.value = true;
    
    // 显示选择框
    const selectionBox = document.getElementById('selection-box');
    if (selectionBox) {
      selectionBoxRef.value = selectionBox;
      selectionBox.style.display = 'block';
      selectionBox.style.position = 'absolute';
      selectionBox.style.left = `${x}px`;
      selectionBox.style.top = `${y}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.border = '2px dashed cornflowerblue';
      selectionBox.style.backgroundColor = 'rgba(100, 149, 237, 0.1)';
      selectionBox.style.zIndex = '1000';
      selectionBox.style.pointerEvents = 'none';
    }
    
    // 设置当前点为起始点
    currentPoint.value = { x, y };
  }
}

// 处理画布鼠标移动事件
const onPaneMouseMove = (event: MouseEvent) => {
  // 如果没有进入选择状态，不处理
  if (!isSelecting.value || !startPoint.value) {
    return;
  }
  
  // 检查组件是否仍然挂载
  if (!document.querySelector('.flow-editor')) {
    // 如果组件已卸载，重置状态并返回
    isSelecting.value = false;
    startPoint.value = null;
    currentPoint.value = null;
    return;
  }
  
  // 阻止默认的画布拖拽行为
  event.preventDefault();
  event.stopPropagation();
  
  // 获取画布元素的边界矩形
  const canvasContainer = document.querySelector('.canvas-container');
  const vueFlowElement = document.querySelector('.vue-flow');
  
  const canvas = canvasContainer || vueFlowElement;
  
  if (canvas) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    currentPoint.value = { x, y };
    
    // 计算选择框的位置和尺寸
    const left = Math.min(startPoint.value.x, x);
    const top = Math.min(startPoint.value.y, y);
    const width = Math.abs(x - startPoint.value.x);
    const height = Math.abs(y - startPoint.value.y);
    
    // 更新选择框的位置和尺寸
    if (selectionBoxRef.value) {
      selectionBoxRef.value.style.left = `${left}px`;
      selectionBoxRef.value.style.top = `${top}px`;
      selectionBoxRef.value.style.width = `${width}px`;
      selectionBoxRef.value.style.height = `${height}px`;
    }
  }
};

// 处理画布鼠标释放事件
const onPaneMouseUp = (event: MouseEvent) => {
  // 如果没有进入选择状态，不处理
  if (!isSelecting.value || !startPoint.value || !currentPoint.value) {
    return;
  }
  
  // 阻止默认行为
  event.preventDefault();
  event.stopPropagation();
  
  // 计算选择框的位置和尺寸（相对于画布视口）
  const left = Math.min(startPoint.value.x, currentPoint.value.x);
  const top = Math.min(startPoint.value.y, currentPoint.value.y);
  const width = Math.abs(currentPoint.value.x - startPoint.value.x);
  const height = Math.abs(currentPoint.value.y - startPoint.value.y);
  
  // 获取画布变换信息
  const { zoom, x: panX, y: panY } = getTransform();
  
  // 重置DOM选择框状态
  if (selectionBoxRef.value) {
    selectionBoxRef.value.style.display = 'none';
  }
  
  // 如果选择框太小，视为点击事件，不执行选择操作
  if (width < 5 && height < 5) {
    // 重置状态
    isSelecting.value = false;
    startPoint.value = null;
    currentPoint.value = null;
    return;
  }
  
  // 将视口坐标转换为流程图实际坐标
  const flowSelectionRect = {
    left: (left - panX) / zoom,
    top: (top - panY) / zoom,
    right: (left + width - panX) / zoom,
    bottom: (top + height - panY) / zoom
  };
  
  // 获取在选择框内的节点
  const selectedNodeIds = getNodes.value
    .filter(node => {
      // 获取节点的位置
      const nodePos = node.position;
      
      // 获取节点尺寸
      let nodeWidth = 0;
      let nodeHeight = 0;
      
      // 从DOM获取真实节点尺寸
      const nodeEl = document.querySelector(`[data-id="${node.id}"]`);
      if (nodeEl) {
        const innerNode = nodeEl.querySelector('.rounded-rect-node, .condition-node, .circle-node, .start-end-node, .text-label-node, .line-node, .svg-icon-node');
        if (innerNode) {
          const rect = innerNode.getBoundingClientRect();
          nodeWidth = rect.width / zoom;
          nodeHeight = rect.height / zoom;
        } else {
          const rect = nodeEl.getBoundingClientRect();
          nodeWidth = rect.width / zoom;
          nodeHeight = rect.height / zoom;
        }
      }
      
      // 如果DOM方法失败，从节点数据获取尺寸
      if (nodeWidth <= 0 || nodeHeight <= 0) {
        // 从dimensions属性获取
        if (node.dimensions) {
          nodeWidth = node.dimensions.width;
          nodeHeight = node.dimensions.height;
        } 
        // 从style属性获取
        else if (node.data?.style) {
          const style = node.data.style;
          if (typeof style.width === 'string') {
            const match = style.width.match(/(\d+)/);
            if (match) nodeWidth = parseInt(match[1], 10);
          } else if (typeof style.width === 'number') {
            nodeWidth = style.width;
          }
          
          if (typeof style.height === 'string') {
            const match = style.height.match(/(\d+)/);
            if (match) nodeHeight = parseInt(match[1], 10);
          } else if (typeof style.height === 'number') {
            nodeHeight = style.height;
          }
        }
        
        // 使用节点类型特定的默认尺寸
        if (nodeWidth <= 0) {
          nodeWidth = node.type === 'circle' ? 38 : 
                     node.type === 'svgIcon' ? 24 : 
                     node.type === 'line' ? 120 : 100;
        }
        if (nodeHeight <= 0) {
          nodeHeight = node.type === 'circle' ? 38 : 
                      node.type === 'condition' ? 60 : 
                      node.type === 'svgIcon' ? 24 :
                      node.type === 'line' ? 1 : 38;
        }
      }
      
      // 计算节点边界框
      const nodeRight = nodePos.x + nodeWidth;
      const nodeBottom = nodePos.y + nodeHeight;
      
      // 使用相交逻辑，节点只要和选择框有交集就选中
      const isIntersecting = !(
        nodeRight < flowSelectionRect.left || 
        nodePos.x > flowSelectionRect.right || 
        nodeBottom < flowSelectionRect.top || 
        nodePos.y > flowSelectionRect.bottom
      );
      
      return isIntersecting;
    })
    .map(node => node.id);
  
  // 保存选中节点的ID到selectedNodesViaAreaSelection
  selectedNodesViaAreaSelection.value = selectedNodeIds;
  
  // 更新 selectedNodes 引用
  selectedNodes.value = selectedNodeIds;
  
  // 将所有节点设置为非选中，再将框选中的节点设置为选中
  const nodes = getNodes.value;
  const updatedNodes = nodes.map(node => ({
    ...node,
    selected: selectedNodeIds.includes(node.id)
  }));
  
  // 使用setNodes更新节点状态
  setNodes(updatedNodes as any);
  
  // 手动触发一次onSelectionChange，确保它接收到正确的选中节点
  const selectedNodesObjects = updatedNodes.filter(n => selectedNodeIds.includes(n.id));
  onSelectionChange({ nodes: selectedNodesObjects });
  
  // 添加延迟检查最终选中状态
  setTimeout(() => {
    // 验证所有需要选中的节点是否确实被选中
    const finalSelection = getNodes.value
      .filter(node => node.selected)
      .map(node => node.id);
    
    // 检查是否所有应选中的节点都被选中
    const allSelected = selectedNodeIds.every(id => 
      getNodes.value.find(n => n.id === id)?.selected
    );
    
    // 如果仍有问题，尝试最后的解决方法
    if (!allSelected) {
      const finalNodes = getNodes.value.map(node => ({
        ...node,
        selected: selectedNodeIds.includes(node.id)
      }));
      
      // 再次应用更新
      setNodes(finalNodes as any);
    }
  }, 100);
  
  // 重置框选状态
  isSelecting.value = false;
  startPoint.value = null;
  currentPoint.value = null;
  
  // 保存历史记录
  saveToHistory();
}

// 获取时间戳
const getTimestamp = () => {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
}

/**
 * 处理节点数据，标准化属性和值
 * @param nodes 原始节点数据数组
 * @returns 处理后的节点数据数组
 */
const processNodeData = (nodes: any[]): any[] => {
  return nodes.map((node: any) => {
    // 直接使用原始位置，不进行任何修改
    const position = {
      x: node.position.x,
      y: node.position.y
    }

    // 提取节点宽度和高度并确保是数字
    let width: number = 100; // 默认宽度
    let height: number = 38; // 默认高度
    
    // 从node.width获取宽度
    if (typeof node.width === 'number') {
      width = node.width;
    }
    // 从样式获取宽度
    else if (node.data?.style?.width && typeof node.data.style.width === 'string') {
      const parsedWidth = parseInt(node.data.style.width);
      if (!isNaN(parsedWidth)) {
        width = parsedWidth;
      }
    }
    
    // 从node.height获取高度
    if (typeof node.height === 'number') {
      height = node.height;
    }
    // 从样式获取高度
    else if (node.data?.style?.height && typeof node.data.style.height === 'string') {
      const parsedHeight = parseInt(node.data.style.height);
      if (!isNaN(parsedHeight)) {
        height = parsedHeight;
      }
    }

    return {
      ...node,
      // 使用原始位置
      position,
      // 保存宽度和高度属性
      width,
      height,
      data: {
        ...node.data,
        label: node.data?.label || '',
        fontSize: Number(node.data?.fontSize) || 14,
        color: node.data?.color || '#000000',
        style: {
          ...(node.data?.style || {}),
          width: `${width}px`,
          height: `${height}px`
        }
      },
      selected: false
    }
  });
}

/**
 * 处理边数据，标准化属性和值
 * @param edges 原始边数据数组
 * @returns 处理后的边数据数组
 */
const processEdgeData = (edges: any[]): any[] => {
  return edges.map((edge: any) => ({
    ...edge,  // 保留所有原始属性
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,  // 确保使用原始源锚点
    targetHandle: edge.targetHandle,  // 确保使用原始目标锚点
    type: edge.type || 'smoothstep',  // 使用原始边类型，默认为smoothstep
    style: {
      ...(typeof edge.style === 'object' ? edge.style : {}),
      strokeWidth: typeof edge.style === 'object' ? edge.style.strokeWidth || 1 : 1,
      stroke: typeof edge.style === 'object' ? edge.style.stroke || '#555555' : '#555555'
    },
    markerEnd: edge.markerEnd,
    markerStart: edge.markerStart,
    data: edge.data,
    selected: false
  }));
}

/**
 * 导出流程图数据为JSON对象
 * @returns 当前流程图的数据对象
 */
const getFlowData = () => {
  // 获取节点和边的数据
  const nodes = getNodes.value.map((node) => {
    // 直接使用原始位置，不修改坐标
    const position = {
      x: node.position.x,
      y: node.position.y
    }

    // 提取节点的宽度和高度
    let width: number = 100; // 默认宽度
    let height: number = 38; // 默认高度
    
    // 尝试从DOM获取节点尺寸
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
    if (nodeElement) {
      const rect = nodeElement.getBoundingClientRect();
      width = Math.round(rect.width);
      height = Math.round(rect.height);
    } else {
      // 从样式获取宽度和高度
      if (node.data?.style?.width && typeof node.data.style.width === 'string') {
        const parsedWidth = parseInt(node.data.style.width);
        if (!isNaN(parsedWidth)) {
          width = parsedWidth;
        }
      }
      
      if (node.data?.style?.height && typeof node.data.style.height === 'string') {
        const parsedHeight = parseInt(node.data.style.height);
        if (!isNaN(parsedHeight)) {
          height = parsedHeight;
        }
      }
    }

    return {
      ...node,
      position,
      // 保存节点尺寸信息
      width,
      height,
      data: {
        ...node.data,
        label: node.data?.label || '',
        fontSize: node.data?.fontSize || 14,
        color: node.data?.color || '#000000',
        style: {
          ...(node.data?.style || {}),
          width: `${width}px`,
          height: `${height}px`
        }
      },
      selected: false // 重置选中状态
    }
  })

  // 完整保存边的所有属性，特别是锚点信息
  const edges = getEdges.value.map((edge) => ({
    ...edge,  // 保留所有原始属性
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,  // 明确保存源锚点
    targetHandle: edge.targetHandle,  // 明确保存目标锚点
    type: edge.type,  // 保留原始边类型，不设置默认值
    style: {
      ...(typeof edge.style === 'object' ? edge.style : {}),
      strokeWidth: typeof edge.style === 'object' ? edge.style.strokeWidth || 1 : 1,
      stroke: typeof edge.style === 'object' ? edge.style.stroke || '#555555' : '#555555'
    },
    markerEnd: edge.markerEnd,
    markerStart: edge.markerStart,
    data: edge.data,
    selected: false
  }))

  return {
    nodes,
    edges,
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      title: `流程图_${getTimestamp()}`
    }
  }
}

/**
 * 将流程图数据导出为JSON文件并下载
 */
const exportFlowData = () => {
  try {
    const flowData = getFlowData()
    
    const jsonStr = JSON.stringify(flowData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `flowchart_${getTimestamp()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出数据失败:', error)
    alert('导出数据失败：' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 获取流程图的数据URL（用于生成图片）
 * @param format 输出格式：'jpg'或'png'
 * @param download 是否自动下载图片
 * @returns Promise<string | null> 返回生成的dataUrl
 */
const getDataUrl = async (format: 'jpg' | 'png' = 'jpg', download: boolean = false): Promise<string | null> => {
  try {
    const vueFlowElement = document.querySelector('.vue-flow') as HTMLElement
    if (!vueFlowElement) {
      console.error('找不到流程图元素')
      return null
    }

    // 添加一个类来防止UI抖动
    document.body.classList.add('exporting-image')
    
    // 保存原始状态
    const originalTransform = { ...getTransform() }
    const originalNodes = getNodes.value.map(node => ({ ...node }))
    const originalEdges = getEdges.value.map(edge => ({ ...edge }))

    // 将节点和边都设为非选中状态
    setNodes(getNodes.value.map(node => ({ ...node, selected: false })) as any)
    setEdges(getEdges.value.map(edge => ({ ...edge, selected: false })))

    // 计算流程图实际内容的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    
    // 查找所有节点以确定内容边界
    getNodes.value.forEach(node => {
      // 获取节点元素以确定实际尺寸
      const nodeElement = document.querySelector(`[data-id="${node.id}"]`)
      if (nodeElement) {
        const rect = nodeElement.getBoundingClientRect()
        
        // 流程图的实际坐标空间是不同于屏幕坐标的，需要转换
        // 获取节点的实际位置
        const nodeX = node.position.x
        const nodeY = node.position.y
        
        // 获取节点的实际尺寸
        const nodeWidth = rect.width / (getTransform().zoom || 1)
        const nodeHeight = rect.height / (getTransform().zoom || 1)
        
        // 更新边界值
        minX = Math.min(minX, nodeX)
        minY = Math.min(minY, nodeY)
        maxX = Math.max(maxX, nodeX + nodeWidth)
        maxY = Math.max(maxY, nodeY + nodeHeight)
      }
    })
    
    // 为边界添加20px的padding
    const padding = 20
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding
    
    // 计算流程图内容区域的宽度和高度
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    
    // 如果没有节点，或计算出的边界无效，则使用整个画布
    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY) || 
        contentWidth <= 0 || contentHeight <= 0) {
      console.warn('无法计算有效内容区域，将使用整个画布')
      minX = 0
      minY = 0
      maxX = vueFlowElement.clientWidth
      maxY = vueFlowElement.clientHeight
    }
    
    // 创建临时的viewBox配置，用于捕获指定区域
    const originalViewportTransform = vueFlowElement.style.transform
    const originalViewportPosition = vueFlowElement.style.position
    const originalViewportOverflow = vueFlowElement.style.overflow
    const originalWidth = vueFlowElement.style.width
    const originalHeight = vueFlowElement.style.height
    
    // 缓存当前的视图参数
    const currentPan = getTransform().x || 0
    const currentZoom = getTransform().zoom || 1
    
    // 不再手动隐藏元素，而是依靠body.exporting-image类的CSS样式

    try {
      // 使用vueFlow提供的视图API来平移和缩放到内容区域
      // 保存当前状态
      const flowWrapper = document.querySelector('.vue-flow__transformationpane') as HTMLElement
      if (flowWrapper) {
        // 设置transform以适应内容区域
        const transformX = -minX
        const transformY = -minY
        
        // 重置transform
        flowWrapper.style.transform = `translate(${transformX}px, ${transformY}px) scale(1)`
      }
      
      // 设置元素宽高为内容区域宽高
      vueFlowElement.style.width = `${contentWidth}px`
      vueFlowElement.style.height = `${contentHeight}px`
      vueFlowElement.style.overflow = 'hidden'
      
      // 等待DOM更新
      await new Promise<void>((resolve) => setTimeout(resolve, 100))

      // 直接获取所有边元素
      const edgeElements = vueFlowElement.querySelectorAll('.vue-flow__edge')
      
      // 预先处理所有边的样式 - 记录原始样式信息
      const edgeOriginalStyles: Map<string, {stroke: string, strokeWidth: string}> = new Map()
      
      edgeElements.forEach(edgeEl => {
        const edgeId = edgeEl.getAttribute('data-id')
        if (edgeId) {
          // 获取当前边的计算样式
          const computedStyle = window.getComputedStyle(edgeEl)
          
          // 获取边的原始边缘元素
          const edgePath = edgeEl.querySelector('.vue-flow__edge-path')
          if (edgePath) {
            // 尝试多种方式获取颜色：直接从边元素、从路径元素、从数据模型
            let strokeColor = ''
            let strokeWidth = ''
            
            // 1. 从数据模型中查找
            const edgeData = getEdges.value.find(e => e.id === edgeId)
            if (edgeData && edgeData.style) {
              if (typeof edgeData.style === 'object') {
                strokeColor = edgeData.style.stroke as string || ''
                strokeWidth = typeof edgeData.style.strokeWidth === 'number' 
                  ? `${edgeData.style.strokeWidth}px` 
                  : String(edgeData.style.strokeWidth || '')
              }
            }
            
            // 2. 从计算样式中获取
            if (!strokeColor) {
              strokeColor = computedStyle.stroke || 
                            computedStyle.getPropertyValue('stroke') || 
                            computedStyle.color
            }
            
            if (!strokeWidth) {
              strokeWidth = computedStyle.strokeWidth || 
                            computedStyle.getPropertyValue('stroke-width') || 
                            '2px'
            }
            
            // 存储原始样式
            edgeOriginalStyles.set(edgeId, {
              stroke: strokeColor !== 'none' && strokeColor !== '' ? strokeColor : '#555',
              strokeWidth: strokeWidth !== 'none' && strokeWidth !== '' ? strokeWidth : '2px'
            })
          }
        }
      })

      // 应用SVG处理直接在原始DOM上
      const svgElements = vueFlowElement.querySelectorAll('svg')
      svgElements.forEach(svg => {
        // 确保SVG元素可见
        svg.style.visibility = 'visible'
        svg.style.display = 'block'
        svg.style.overflow = 'visible'
        
        // 处理所有path元素
        const paths = svg.querySelectorAll('path')
        paths.forEach(path => {
          // 设置基本属性
          path.style.fill = 'none'
          
          // 如果是边线路径，应用存储的原始颜色和粗细
          if (path.classList.contains('vue-flow__edge-path')) {
            // 查找边ID
            const edgeEl = path.closest('.vue-flow__edge')
            if (edgeEl) {
              const edgeId = edgeEl.getAttribute('data-id')
              if (edgeId && edgeOriginalStyles.has(edgeId)) {
                const originalStyle = edgeOriginalStyles.get(edgeId)
                if (originalStyle) {
                  // 应用原始颜色和粗细
                  path.style.stroke = originalStyle.stroke
                  path.style.strokeWidth = originalStyle.strokeWidth
                }
              } else {
                // 如果没有找到原始样式，使用计算样式
                const computedStyle = window.getComputedStyle(path)
                path.style.stroke = computedStyle.stroke || '#555'
                path.style.strokeWidth = computedStyle.strokeWidth || '2px'
              }
            }
          } else {
            // 非边线路径保持原样
            const originalStroke = path.getAttribute('stroke') || 
                                  path.style.stroke || 
                                  window.getComputedStyle(path).stroke || 
                                  'currentColor'
            path.style.stroke = originalStroke
          }
          
          // 确保虚线显示正确
          if (path.getAttribute('stroke-dasharray')) {
            const dashArray = path.getAttribute('stroke-dasharray')
            path.setAttribute('stroke-dasharray', dashArray || '5,5')
          }
        })
        
        // 处理边缘标签背景 - 修复黑色背景问题
        const edgeTextBgs = svg.querySelectorAll('.vue-flow__edge-textbg, .vue-flow__edge-textwrapper rect')
        edgeTextBgs.forEach(rect => {
          if (rect instanceof SVGRectElement) {
            // 设置边缘标签背景为白色并增加透明度
            rect.style.fill = '#ffffff'
            rect.style.fillOpacity = '0.8'
            // 完全移除边框
            rect.style.stroke = 'none'
            rect.style.strokeWidth = '0'
          }
        })
        
        // 处理边缘标签文本
        const edgeTexts = svg.querySelectorAll('.vue-flow__edge-text, .vue-flow__edge-textwrapper text')
        edgeTexts.forEach(text => {
          if (text instanceof SVGTextElement) {
            // 设置边缘标签文本字体大小
            text.style.fontSize = '12px'
            text.style.fontFamily = 'Arial, sans-serif'
          }
        })
        
        // 确保marker (箭头) 正确显示
        const markers = svg.querySelectorAll('marker')
        markers.forEach(marker => {
          marker.setAttribute('markerWidth', '15')
          marker.setAttribute('markerHeight', '15')
          
          // 查找marker内的path并设置颜色
          const markerPaths = marker.querySelectorAll('path')
          markerPaths.forEach(markerPath => {
            // 获取引用此marker的边的颜色
            const markerId = marker.id
            if (markerId) {
              // 查找使用此marker的边
              const edgesWithMarker = document.querySelectorAll(`.vue-flow__edge[marker-end*="${markerId}"], .vue-flow__edge[marker-start*="${markerId}"]`)
              if (edgesWithMarker && edgesWithMarker.length > 0) {
                const edgeWithMarker = edgesWithMarker[0] as HTMLElement
                const edgeId = edgeWithMarker.getAttribute('data-id')
                
                if (edgeId && edgeOriginalStyles.has(edgeId)) {
                  const originalStyle = edgeOriginalStyles.get(edgeId)
                  if (originalStyle) {
                    // 为marker path应用相同的颜色
                    markerPath.style.fill = originalStyle.stroke
                    markerPath.style.stroke = originalStyle.stroke
                  }
                }
              }
            }
          })
        })
      })

      // 确保圆形节点完整显示
      const circleNodes = vueFlowElement.querySelectorAll('.vue-flow__node-circle')
      circleNodes.forEach(node => {
        ;(node as HTMLElement).style.padding = '5px'
      })

      // 导出图片的配置选项
      const exportImageOptions = {
        quality: 0.95,
        backgroundColor: 'white', 
        pixelRatio: 1, // 设置为1确保1:1比例，防止文本被放大
        skipAutoScale: true,
        // 包含所有相关样式
        fontEmbedCSS: document.querySelector('link[rel="stylesheet"]')?.getAttribute('href') || undefined,
        // 过滤掉不需要的元素
        filter: (node: HTMLElement) => {
          if (!node || !node.classList) return true;
          
          // 检查元素是否应该被过滤（基于类名）
          const shouldBeFiltered = [
            'vue-flow__controls', 
            'vue-flow__minimap', 
            'top-toolbar', 
            'node-toolbar', 
            'left-sidebar'
          ].some(className => 
            node.classList.contains(className) || 
            node.closest(`.${className}`)
          );
          
          // 仅保留不应被过滤的元素
          return !shouldBeFiltered;
        }
      };

      // 根据格式选择导出方法
      const exportFn = format === 'png' ? toPng : toJpeg
      const extension = format === 'png' ? 'png' : 'jpg'
      
      const dataUrl = await exportFn(vueFlowElement, exportImageOptions)
      
      // 如果需要下载，创建下载链接
      if (download) {
        const fileName = `flowchart_${getTimestamp()}`
        const link = document.createElement('a')
        link.download = `${fileName}.${extension}`
        link.href = dataUrl
        link.click()
      }
      
      return dataUrl
    } finally {
      // 恢复原始画布大小和位置
      if (vueFlowElement) {
        vueFlowElement.style.width = originalWidth
        vueFlowElement.style.height = originalHeight
        vueFlowElement.style.overflow = originalViewportOverflow || ''
      }
      
      // 恢复原始transform
      const flowWrapper = document.querySelector('.vue-flow__transformationpane') as HTMLElement
      if (flowWrapper) {
        flowWrapper.style.transform = `translate(${originalTransform.x || 0}px, ${originalTransform.y || 0}px) scale(${originalTransform.zoom || 1})`
      }
      
      // 恢复原始状态
      setNodes(originalNodes as any)
      setEdges(originalEdges)
      
      // 移除防抖动类，不再手动恢复visibility
      document.body.classList.remove('exporting-image')
    }
  } catch (error) {
    // 确保无论如何都移除防抖动类
    document.body.classList.remove('exporting-image')
    console.error('生成图片数据URL失败:', error)
    return null
  }
}

/**
 * 导出流程图为图片
 * @param format 输出格式：'jpg'或'png'
 * @returns Promise<string | null> 返回生成的dataUrl
 */
const exportImage = async (format: 'jpg' | 'png' = 'jpg'): Promise<string | null> => {
  // 利用getDataUrl方法并自动下载图片
  return getDataUrl(format, true);
}

/**
 * 从JSON文件导入流程图数据
 * @param file JSON文件对象
 */
const importFlowData = async (file: File): Promise<boolean> => {
  try {
    const fileContent = await file.text();
    const data = JSON.parse(fileContent);
    
    // 验证数据格式
    if (!data || typeof data !== 'object' || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      alert('无效的流程图数据格式');
      return false;
    }
    
    // 处理节点和边的数据
    const nodes = data.nodes.map((node: any) => {
      // 确保位置信息正确
      const position = {
        x: node.position?.x || 0,
        y: node.position?.y || 0
      };
      
      return {
        ...node,
        position,
        selected: false
      };
    });
    
    const edges = data.edges.map((edge: any) => ({
      ...edge,
      selected: false
    }));
    
    // 应用数据到画布
    setNodes([]);
    setEdges([]);
    
    // 使用setTimeout确保清空操作完成
    await new Promise<void>(resolve => setTimeout(resolve, 50));
    
    setNodes(nodes);
    setEdges(edges);
    
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    alert('导入数据失败：' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
};

/**
 * 保存流程图数据到API
 * @param apiEndpoint API端点URL
 * @param options 可选的请求配置
 */
const saveToAPI = async (apiEndpoint: string, options?: RequestInit): Promise<boolean> => {
  try {
    const flowData = getFlowData();
    
    // 调用API保存数据
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(flowData),
      ...options
    });
    
    if (!response.ok) {
      throw new Error('保存失败: ' + response.statusText);
    }
    
    return true;
  } catch (error) {
    console.error('保存到API失败:', error);
    alert('保存到API失败：' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
};

/**
 * 从API加载流程图数据
 * @param apiEndpoint API端点URL
 * @param options 可选的请求配置
 */
const loadFromAPI = async (apiEndpoint: string, options?: RequestInit): Promise<boolean> => {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error('从API加载失败: ' + response.statusText);
    }
    
    const data = await response.json();
    return await importFlowData(new Blob([JSON.stringify(data)], { type: 'application/json' }) as any);
  } catch (error) {
    console.error('从API加载失败:', error);
    alert('从API加载失败：' + (error instanceof Error ? error.message : String(error)));
    return false;
  }
};

/**
 * 从Mermaid脚本导入流程图
 * @param script Mermaid脚本文本
 * @returns 导入结果，包含成功状态和可能的错误消息
 */
const importMermaidFlowchart = (script: string): { success: boolean; message?: string } => {
  try {
    // 解析Mermaid脚本
    const parsedData = parseMermaidFlowchart(script);
    
    if (!parsedData.success) {
      return {
        success: false,
        message: parsedData.message || '解析失败，请检查脚本格式'
      };
    }
    
    if (parsedData.nodes.length === 0) {
      return {
        success: false,
        message: '解析结果为空，请检查脚本内容'
      };
    }
    
    // 清空当前画布
    setNodes([]);
    setEdges([]);
    
    // 导入解析后的节点和边
    const processedNodes = processNodeData(parsedData.nodes);
    const processedEdges = processEdgeData(parsedData.edges);
    
    setNodes(processedNodes);
    setEdges(processedEdges);
    
    // 不再自动调整视图，保持100%的缩放比例
    // setTimeout(() => {
    //  fitView({ padding: 0.2 });
    // }, 100);
    
    console.log('成功导入Mermaid流程图');
    
    return { success: true };
  } catch (error) {
    console.error('导入Mermaid时出错:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : '导入失败，发生未知错误'
    };
  }
};

// 暴露方法给外部使用
const flowEditorMethods = {
  getFlowData,
  exportFlowData,
  exportImage,
  importFlowData,
  saveToAPI,
  loadFromAPI,
  processNodeData,
  processEdgeData,
  getDataUrl,
  importMermaidFlowchart  // 添加Mermaid导入API
}

// 提供FlowEditor的方法给子组件
provide('flowEditor', flowEditorMethods)

defineExpose(flowEditorMethods)

// 自定义NodeComponent类型以解决类型兼容性问题
// ... existing code ...
</script>

<style>
.flow-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  position: relative;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: grid;
  grid-template-columns: 40px 1fr;
  position: relative;
  overflow: hidden;
}

.canvas-container {
  grid-column: 2;
  height: 100%;
  position: relative;
  overflow: hidden;
  will-change: transform;
  transform: translateZ(0);
}

/* 防止导出时的布局变化 */
body.exporting-image .main-content {
  grid-template-columns: 40px 1fr !important;
  transition: none !important;
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

/* 修改箭头样式 */
.vue-flow__edge-path {
  pointer-events: stroke !important;
  cursor: pointer !important;
}

.vue-flow__arrowhead {
  stroke: none !important;
  fill: currentColor !important;
  transform: scale(1.5) !important;
  transform-origin: center !important;
}

.vue-flow__edge.selected .vue-flow__arrowhead {
  fill: #409eff !important;
}

.vue-flow__edge:hover .vue-flow__arrowhead {
  fill: #8080FF !important;
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

.vue-flow__edge-interaction-path {
  cursor: pointer !important;
  pointer-events: all !important;
  stroke-opacity: 0;
  stroke-width: 25px !important;
}

.vue-flow__edge.edge-selected .vue-flow__edge-path,
.vue-flow__edge.selected .vue-flow__edge-path {
  stroke: #409eff !important;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
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

.vue-flow__node.resizing .vue-flow__edge-path {
  pointer-events: none !important;
}

/* 边标签样式 - 强化字体控制，确保不加粗 */
.vue-flow__edge text,
.vue-flow__edge .vue-flow__edge-text,
.vue-flow__edge-textwrapper text,
.vue-flow .vue-flow__edge .vue-flow__edge-text {
  font-weight: 400 !important; /* 明确使用常规字重 */
  font-size: 12px !important;
  fill: #333 !important;
  font-family: Arial, sans-serif !important;
  pointer-events: none;
  stroke: none !important; /* 确保没有文字描边 */
  stroke-width: 0 !important;
  text-rendering: geometricPrecision !important; /* 提高文本渲染精度 */
  letter-spacing: normal !important; /* 正常字间距 */
  paint-order: normal !important; /* 正常绘制顺序 */
}

/* 保留白色背景提高可读性，但去除边框和阴影 */
.vue-flow__edge .vue-flow__edge-textbg,
.vue-flow__edge-textwrapper rect,
.vue-flow .vue-flow__edge .vue-flow__edge-textbg {
  fill: white !important;
  stroke: none !important;
  stroke-width: 0 !important;
  filter: none !important;
}

/* 文本输入框自定义样式 */
.edge-label-input {
  font-size: 12px;
  color: #555;
  background-color: white;
  border: 1px dotted #555;
  border-radius: 3px;
  text-align: center;
  min-width: 60px;
  height: 24px;
  padding: 0 4px;
  outline: none;
  box-sizing: border-box;
}

/* 边标签编辑对话框样式 */
.edge-label-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edge-label-dialog {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 350px;
  max-width: 90%;
  overflow: hidden;
}

.dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.label-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.label-input:focus {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.dialog-footer button {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.confirm-btn {
  background-color: #1677ff;
  color: white;
}

.confirm-btn:hover {
  background-color: #4096ff;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e6e6e6;
}

/* SVG图标节点特殊样式 - 使用更高优先级选择器覆盖Vue Flow默认样式 */
.vue-flow .vue-flow__node.vue-flow__node-svgIcon {
  border: none !important;
  background-color: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
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

/* 区域选择框样式 */
.selection-area {
  position: absolute;
  border: 2px dashed #6495ed;
  background-color: rgba(100, 149, 237, 0.1);
  pointer-events: none;
  z-index: 1000;
}

/* 确保画布容器定位正确 */
.canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.editor-main {
  position: relative;
  flex: 1;
  height: 100%;
}

.flow-canvas {
  width: 100%;
  height: 100%;
}
</style>