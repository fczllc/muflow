<template>
  <div class="top-toolbar">
    <Logo />
    
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
          <option value="solid">实线</option>
          <option value="dashed">虚线</option>
          <option value="dotted">点线</option>
        </select>
        <select 
          v-model="arrowStyle" 
          class="arrow-style-select" 
          :disabled="!hasSelectedEdges"
          @change="applyEdgeStyle"
          title="箭头样式"
        >
          <option value="none">无箭头</option>
          <option value="source">左箭头</option>
          <option value="target">右箭头</option>
          <option value="both">双箭头</option>
        </select>
      </div>

      <ToolbarIcon type="separator" />

      <!-- 对齐分布设置组 -->
      <div class="tool-title">布局</div>
      <div class="tool-group" :class="{ 'disabled': !hasMultipleSelectedNodes }">
        <button 
          class="icon-btn" 
          @click="alignLeft" 
          title="左对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignLeft" />
        </button>
        <button 
          class="icon-btn" 
          @click="alignRight" 
          title="右对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignRight" />
        </button>
        <button 
          class="icon-btn" 
          @click="alignTop" 
          title="顶对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignTop" />
        </button>
        <button 
          class="icon-btn" 
          @click="alignBottom" 
          title="底对齐"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignBottom" />
        </button>
        <button 
          class="icon-btn" 
          @click="alignHCenter" 
          title="水平居中"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignHCenter" />
        </button>
        <button 
          class="icon-btn" 
          @click="alignVCenter" 
          title="垂直居中"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="alignVCenter" />
        </button>
        <button 
          class="icon-btn" 
          @click="distributeHorizontal" 
          title="水平分布"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="distributeH" />
        </button>
        <button 
          class="icon-btn" 
          @click="distributeVertical" 
          title="垂直分布"
          :disabled="!hasMultipleSelectedNodes"
        >
          <ToolbarIcon type="distributeV" />
        </button>
      </div>
    </div>

    <!-- 画布操作工具 -->
    <div class="canvas-tools">
      <div class="tool-btn-wrapper">
        <button class="icon-btn" @click="clearCanvas" @mouseleave="hideTooltip" title="清除画布">
          <ToolbarIcon type="clear" />
        </button>
        <div class="tooltip" v-show="activeTooltip === 'clear'">清除画布</div>
      </div>

      <div class="tool-btn-wrapper">
        <button class="icon-btn" @click="exportImage" @mouseleave="hideTooltip" title="导出图片">
          <ToolbarIcon type="export" />
        </button>
        <div class="tooltip" v-show="activeTooltip === 'export'">导出图片</div>
      </div>

      <div class="tool-btn-wrapper">
        <button class="icon-btn" @click="saveJSON"  @mouseleave="hideTooltip" title="保存画布">
          <ToolbarIcon type="save" />
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
  padding: 0 16px;
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
  width: 70px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  font-size: 12px;
  border-radius: 4px;
}

.number-input {
  width: 50px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
}

.color-picker {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
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
  border-radius: 4px;
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
  border-radius: 4px;
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
  height: 28px;
  padding: 0 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 12px;
  cursor: pointer;
}

.line-style-select:disabled,
.arrow-style-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 工具组禁用状态 */
.tool-group.disabled button,
.tool-group.disabled input,
.tool-group.disabled select {
  cursor: not-allowed;
}
</style>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVueFlow, MarkerType } from '@vue-flow/core'
import Logo from '../Logo/Logo.vue'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

// 获取 Vue Flow 实例
const { 
  getNodes,
  getEdges,
  getSelectedNodes, 
  getSelectedEdges, 
  updateNode, 
  updateEdge,
  setEdges
} = useVueFlow()

// 计算属性：是否有选中的节点
const hasSelectedNodes = computed(() => getSelectedNodes.value.length > 0)

// 计算属性：是否有选中的边
const hasSelectedEdges = computed(() => getSelectedEdges.value.length > 0)

// 计算属性：是否有多个选中的节点（用于布局功能）
const hasMultipleSelectedNodes = computed(() => getSelectedNodes.value.length > 1)

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

// 对齐和分布方法
const alignLeft = () => { /* 实现左对齐 */ }
const alignRight = () => { /* 实现右对齐 */ }
const alignTop = () => { /* 实现顶对齐 */ }
const alignBottom = () => { /* 实现底对齐 */ }
const alignHCenter = () => { /* 实现水平居中 */ }
const alignVCenter = () => { /* 实现垂直居中 */ }
const distributeHorizontal = () => { /* 实现水平分布 */ }
const distributeVertical = () => { /* 实现垂直分布 */ }

// 提示框状态
const activeTooltip = ref<'clear' | 'export' | 'save' | null>(null)

// 隐藏提示框
const hideTooltip = () => {
  activeTooltip.value = null
}

// 画布操作方法
const clearCanvas = () => { /* 实现清除画布 */ }
const exportImage = () => { /* 实现导出图片 */ }
const saveJSON = () => { /* 实现保存JSON */ }
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TopToolbar'
})
</script> 