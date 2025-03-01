<template>
  <div class="top-toolbar">
    <img src="@/assets/logo.png" alt="logo" class="logo">
    
    <div class="style-tools">
      <!-- 字体样式设置组 -->
      <div class="tool-title">字体</div>
      <div class="tool-group" :class="{ 'disabled': !hasSelectedNodes }">
        <select 
          v-model="fontSize" 
          class="font-size-select" 
          :disabled="!hasSelectedNodes"
          @change="applyFontStyle"
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
        </select>
        <input 
          type="color" 
          v-model="fontColor" 
          class="color-picker" 
          title="字体颜色"
          :disabled="!hasSelectedNodes"
          @change="applyFontStyle"
        >
      </div>

      <ToolbarIcon type="separator" />

      <!-- 连线样式设置组 -->
      <div class="tool-title">连线</div>
      <div class="tool-group" :class="{ 'disabled': !hasSelectedEdges }">
        <input 
          type="number" 
          v-model="lineWidth" 
          min="1" 
          max="10" 
          class="number-input" 
          title="线条粗细"
          :disabled="!hasSelectedEdges"
          @change="applyEdgeStyle"
        >
        <input 
          type="color" 
          v-model="lineColor" 
          class="color-picker" 
          title="线条颜色"
          :disabled="!hasSelectedEdges"
          @change="applyEdgeStyle"
        >
        <select 
          v-model="lineStyle" 
          class="line-style-select" 
          :disabled="!hasSelectedEdges"
          @change="applyEdgeStyle"
          title="线条样式"
        >
          <option value="solid">
            ─
          </option>
          <option value="dashed">
            ┄
          </option>
          <option value="dotted">
            ┉
          </option>
        </select>
        <select 
          v-model="arrowStyle" 
          class="arrow-style-select" 
          :disabled="!hasSelectedEdges"
          @change="applyEdgeStyle"
          title="箭头样式"
        >
          <option value="none">
            ─
          </option>
          <option value="source">
            ←
          </option>
          <option value="target">
            →
          </option>
          <option value="both">
            ↔
          </option>
        </select>
      </div>

      <ToolbarIcon type="separator" />

      <!-- 对齐分布设置组 -->
      <div class="tool-title">布局</div>
      <div class="tool-group" :class="{ 'disabled': !hasMultipleSelectedNodes }">
        <button 
          class="icon-btn" 
          @click="handleAlignClick('left')" 
          title="左对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignLeft" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleAlignClick('right')" 
          title="右对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignRight" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleAlignClick('top')" 
          title="顶对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignTop" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleAlignClick('bottom')" 
          title="底对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignBottom" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleAlignClick('center')" 
          title="水平居中"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignHCenter" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleAlignClick('middle')" 
          title="垂直居中"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignVCenter" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleDistributeClick('horizontal')" 
          title="水平分布"
          :disabled="!hasThreeOrMoreSelectedNodes"
        >
          <ToolbarIcon type="distributeH" />
        </button>
        <button 
          class="icon-btn" 
          @click="handleDistributeClick('vertical')" 
          title="垂直分布"
          :disabled="!hasThreeOrMoreSelectedNodes"
        >
          <ToolbarIcon type="distributeV" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 8px;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
}
.tool-title {
font-size: 12px;
color: #666;
  min-width: 40px;     /* 设置最小宽度 */
  flex-shrink: 0;      /* 防止被压缩 */
  white-space: nowrap; /* 防止文字换行 */
  text-align: center;  /* 文字居中 */
}

.style-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  margin-right: auto;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tool-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.font-size-select {
  width: 60px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  font-size: 12px;
  border-radius: 3px;
}

.number-input {
  width: 40px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  font-size: 12px;
}

.color-picker {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background: var(--hover-color);
}

.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.canvas-tools {
  display: flex;
  gap: 8px;
}

.tool-btn-wrapper {
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
}

.tooltip::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.75);
}

/* 添加连线样式下拉框样式 */
.line-style-select,
.arrow-style-select {
  font-family: monospace;
  font-size: 14px;
  padding: 4px 8px;
  width: 50px;
  text-align: center;
  background-color: white;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  cursor: pointer;
}

.line-style-select option,
.arrow-style-select option {
  font-family: monospace;
  text-align: center;
  padding: 8px;
}

.line-style-option,
.arrow-style-option {
  display: inline-block;
  white-space: nowrap;
  font-size: 14px;
}

/* 禁用状态样式 */
.line-style-select:disabled,
.arrow-style-select:disabled {
  background-color: #f5f7fa;
  cursor: not-allowed;
  border-color: #e4e7ed;
  color: #c0c4cc;
}

/* 悬停效果 */
.line-style-select:not(:disabled):hover,
.arrow-style-select:not(:disabled):hover {
  border-color: #409eff;
}

/* 选中状态 */
.line-style-select option:checked,
.arrow-style-select option:checked {
  background-color: #f5f7fa;
}

/* 下拉选项悬停效果 */
.line-style-select option:hover,
.arrow-style-select option:hover {
  background-color: #ecf5ff;
}

/* 自定义箭头样式 */
.arrow-style-option {
  color: #606266;
}

/* 自定义线条样式 */
.line-style-option {
  color: #606266;
}

/* 工具组禁用状态 */
.tool-group.disabled button,
.tool-group.disabled input,
.tool-group.disabled select {
  cursor: not-allowed;
}

.logo {
  width: 42px;
  height: 16px;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVueFlow, MarkerType } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'
import html2canvas from 'html2canvas'

// 获取 Vue Flow 实例
const { 
  getNodes,
  getEdges,
  getSelectedNodes, 
  getSelectedEdges, 
  updateNode, 
  updateEdge,
  setNodes,
  setEdges
} = useVueFlow()

// 计算属性：是否有选中的节点
const hasSelectedNodes = computed(() => getSelectedNodes.value.length > 0)

// 计算属性：是否有选中的边
const hasSelectedEdges = computed(() => getSelectedEdges.value.length > 0)

// 计算是否有两个或更多节点被选中（用于对齐功能）
const hasMultipleSelectedNodes = computed(() => {
  const selectedNodes = getNodes.value.filter(node => node.selected)
  return selectedNodes.length >= 2
})

// 计算是否有三个或更多节点被选中（用于分布功能）
const hasThreeOrMoreSelectedNodes = computed(() => {
  const selectedNodes = getNodes.value.filter(node => node.selected)
  return selectedNodes.length >= 3
})

// 字体样式
const fontSize = ref(12)
const fontColor = ref('#000000')

// 连线样式
const lineWidth = ref(1)
const lineColor = ref('#555555')
const lineStyle = ref('solid')
const arrowStyle = ref('target')

// 当前选中的节点和边的ID
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

// 监听选中的节点变化
watch(() => getSelectedNodes.value, (nodes) => {
  if (nodes.length === 1) {
    // 如果只选中了一个节点，获取其样式
    const node = nodes[0]
    selectedNodeId.value = node.id
    selectedEdgeId.value = null
    
    // 获取节点的字体样式
    fontSize.value = node.data?.fontSize || 14
    fontColor.value = node.data?.color || '#000000'
  } else if (nodes.length > 1) {
    // 如果选中了多个节点，使用默认值
    selectedNodeId.value = null
    selectedEdgeId.value = null
    fontSize.value = 14
    fontColor.value = '#000000'
  } else {
    // 如果没有选中节点，清空选中状态
    selectedNodeId.value = null
  }
}, { immediate: true })

// 监听选中的边变化
watch(() => getSelectedEdges.value, (edges) => {
  if (edges.length === 1) {
    // 如果只选中了一条边，获取其样式
    const edge = edges[0]
    selectedEdgeId.value = edge.id
    selectedNodeId.value = null
    
    // 优先使用保存在数据中的值，如果没有则从样式中获取
    if (edge.data?.savedLineWidth !== undefined) {
      lineWidth.value = edge.data.savedLineWidth
    } else {
      lineWidth.value = parseInt(String((edge.style as any)?.strokeWidth || '1').replace('px', '')) || 1
    }
    
    if (edge.data?.savedLineColor) {
      lineColor.value = edge.data.savedLineColor
    } else {
      lineColor.value = (edge.style as any)?.stroke || '#555555'
    }
    
    if (edge.data?.savedLineStyle) {
      lineStyle.value = edge.data.savedLineStyle
    } else {
      // 获取线型
      if ((edge.style as any)?.strokeDasharray) {
        if ((edge.style as any).strokeDasharray === '5 5') {
          lineStyle.value = 'dashed'
        } else if ((edge.style as any).strokeDasharray === '2 2') {
          lineStyle.value = 'dotted'
        } else {
          lineStyle.value = 'solid'
        }
      } else {
        lineStyle.value = 'solid'
      }
    }
    
    if (edge.data?.savedArrowStyle) {
      arrowStyle.value = edge.data.savedArrowStyle
    } else {
      // 获取箭头样式
      if (edge.markerEnd && edge.markerStart) {
        arrowStyle.value = 'both'
      } else if (edge.markerEnd) {
        arrowStyle.value = 'target'
      } else if (edge.markerStart) {
        arrowStyle.value = 'source'
      } else {
        arrowStyle.value = 'none'
      }
    }
  } else if (edges.length > 1) {
    // 如果选中了多条边，使用默认值
    selectedEdgeId.value = null
    lineWidth.value = 1
    lineColor.value = '#555555'
    lineStyle.value = 'solid'
    arrowStyle.value = 'target'
  } else {
    // 如果没有选中边，清空选中状态
    selectedEdgeId.value = null
  }
}, { immediate: true })

// 应用字体样式到选中的节点
const applyFontStyle = () => {
  const selectedNodes = getSelectedNodes.value
  
  selectedNodes.forEach(node => {
    updateNode(node.id, {
      data: {
        ...node.data,
        fontSize: fontSize.value,
        color: fontColor.value
      }
    })
  })
}

// 应用连线样式到选中的边
const applyEdgeStyle = () => {
  const selectedEdges = getSelectedEdges.value
  
  if (selectedEdges.length === 0) {
    return
  }
  
  selectedEdges.forEach(edge => {
    // 设置线型
    let strokeDasharray = undefined
    if (lineStyle.value === 'dashed') {
      strokeDasharray = '5 5'
    } else if (lineStyle.value === 'dotted') {
      strokeDasharray = '2 2'
    }
    
    // 设置箭头
    let markerStart: MarkerType | undefined = undefined
    let markerEnd: MarkerType | undefined = undefined
    
    if (arrowStyle.value === 'both') {
      markerStart = MarkerType.ArrowClosed
      markerEnd = MarkerType.ArrowClosed
    } else if (arrowStyle.value === 'source') {
      markerStart = MarkerType.ArrowClosed
    } else if (arrowStyle.value === 'target') {
      markerEnd = MarkerType.ArrowClosed
    }
    
    // 确保边对象有效
    if (!edge || !edge.id || !edge.source || !edge.target) {
      return
    }
    
    try {
      // 确保 lineWidth 是数值类型
      const width = typeof lineWidth.value === 'string' 
        ? parseInt(lineWidth.value) 
        : lineWidth.value
      
      // 创建一个新的样式对象，确保不会被引用修改
      const newStyle = {
        ...edge.style,
        strokeWidth: width,
        stroke: lineColor.value,
        strokeDasharray
      }
      
      // 方法1: 直接在 getEdges.value 中查找并更新边
      const currentEdge = getEdges.value.find(e => e.id === edge.id)
      if (currentEdge) {
        // 创建一个新的边对象，避免引用问题
        const updatedEdge = {
          ...currentEdge,
          style: { ...newStyle }, // 使用深拷贝确保样式对象是新的
          markerStart,
          markerEnd,
          data: {
            ...currentEdge.data,
            savedLineWidth: width, // 在数据中保存线宽，确保再次选中时能够恢复
            savedLineColor: lineColor.value,
            savedLineStyle: lineStyle.value,
            savedArrowStyle: arrowStyle.value
          }
        }
        
        // 更新边数组
        const edges = getEdges.value.map(e => 
          e.id === edge.id ? updatedEdge : e
        )
        
        // 设置新的边数组
        setEdges(edges)
      }
      
      // 方法2: 直接修改 DOM 元素样式（作为备用方案）
      setTimeout(() => {
        const edgePath = document.querySelector(`.vue-flow__edge[data-id="${edge.id}"] .vue-flow__edge-path`)
        if (edgePath) {
          edgePath.setAttribute('stroke-width', String(width))
          edgePath.setAttribute('stroke', lineColor.value)
          if (strokeDasharray) {
            edgePath.setAttribute('stroke-dasharray', strokeDasharray)
          } else {
            edgePath.removeAttribute('stroke-dasharray')
          }
        }
      }, 0)
    } catch (error) {
      // 忽略错误
    }
  })
}

// 添加分布事件
const emit = defineEmits<{
  (e: 'align', direction: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle'): void
  (e: 'distribute', direction: 'horizontal' | 'vertical'): void
}>()

// 对齐按钮点击处理
const handleAlignClick = (direction: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle') => {
  // 调用父组件的对齐方法
  emit('align', direction)
}

// 分布按钮点击处理
const handleDistributeClick = (direction: 'horizontal' | 'vertical') => {
  emit('distribute', direction)
}

// 提示框状态
const activeTooltip = ref<'clear' | 'export' | 'save' | 'import' | null>(null)

// 隐藏提示框
const hideTooltip = () => {
  activeTooltip.value = null
}

// 画布操作方法
const showClearConfirm = ref(false)

const clearCanvas = () => {
  showClearConfirm.value = true
}

const handleClearConfirm = () => {
  setNodes([])
  setEdges([])
  showClearConfirm.value = false
}

const handleClearCancel = () => {
  showClearConfirm.value = false
}

// 导出图片方法
const exportImage = async () => {
  try {
    // 获取 Vue Flow 容器
    const flowContainer = document.querySelector('.vue-flow') as HTMLElement
    if (!flowContainer) {
      throw new Error('找不到画布元素')
    }

    // 使用 html2canvas 配置
    const options = {
      backgroundColor: '#ffffff', // 设置白色背景
      scale: 2,  // 2倍清晰度，避免图片模糊
      useCORS: true, // 处理跨域图片
      logging: false, // 关闭日志
      allowTaint: true, // 允许跨域图片
      // 只导出可见区域
      ignoreElements: (element: Element) => {
        return element.classList.contains('vue-flow__minimap') || // 排除小地图
               element.classList.contains('vue-flow__controls') || // 排除控制按钮
               (element as HTMLElement).style.display === 'none' // 排除隐藏元素
      }
    }

    // 转换为 canvas
    const canvas = await html2canvas(flowContainer, options)

    // 转换为 JPG 图片
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9) // 0.9 为图片质量参数

    // 创建下载链接
    const link = document.createElement('a')
    link.download = `flowchart_${getTimestamp()}.jpg`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

  } catch (error) {
    console.error('导出图片失败:', error)
    alert('导出图片失败，请稍后重试')
  }
}

// 获取当前时间戳作为文件名的一部分
const getTimestamp = () => {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
}

// 生成画布数据的方法 - 将来可以被其他保存方法复用
const generateCanvasData = () => {
  const flowData = {
    nodes: getNodes.value,
    edges: getEdges.value,
    // 添加元数据
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      title: `流程图_${getTimestamp()}`
    }
  }
  return flowData
}

// 下载JSON文件的方法
const downloadJSON = (data: any, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 保存画布方法
const saveJSON = async () => {
  try {
    // 生成画布数据
    const canvasData = generateCanvasData()
    
    // 生成文件名
    const filename = `flowchart_${getTimestamp()}.json`
    
    // TODO: 如果需要调用API保存，可以在这里添加条件判断
    // if (process.env.SAVE_TO_API) {
    //   await saveToAPI(canvasData)
    //   return
    // }
    
    // 默认下载到本地
    downloadJSON(canvasData, filename)
    
  } catch (error) {
    console.error('保存失败:', error)
    // 这里可以添加错误提示
    alert('保存失败，请稍后重试')
  }
}

// 文件输入引用
const fileInput = ref<HTMLInputElement | null>(null)

// 触发文件选择
const importJSON = () => {
  fileInput.value?.click()
}

// 处理文件导入
const handleFileImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  
  if (!file) return
  
  try {
    // TODO: 如果需要从API加载数据，可以在这里添加条件判断
    // if (process.env.LOAD_FROM_API) {
    //   const data = await loadFromAPI()
    //   await loadFlowData(data)
    //   return
    // }
    
    // 读取本地文件
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        await loadFlowData(jsonData)
      } catch (error) {
        console.error('JSON解析失败:', error)
        alert('无效的JSON文件格式')
      }
    }
    reader.readAsText(file)
  } catch (error) {
    console.error('导入失败:', error)
    alert('导入失败，请检查文件格式')
  } finally {
    // 清空文件输入框,允许重复选择同一文件
    input.value = ''
  }
}

// 加载流程图数据
const loadFlowData = async (data: any) => {
  try {
    // 基本验证
    if (!data.nodes || !data.edges || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
      throw new Error('无效的流程图数据格式')
    }

    // 设置节点和边
    setNodes(data.nodes)
    setEdges(data.edges)
    
  } catch (error) {
    console.error('加载数据失败:', error)
    alert('加载数据失败，请检查数据格式')
    throw error
  }
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TopToolbar'
})
</script> 