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
  <div 
    class="condition-node" 
    :class="{ selected, editing: isEditing }"
    ref="nodeRef"
    @mouseenter="showHandles = true" 
    @mouseleave="showHandles = false"
    @click="handleNodeClick"
    :style="nodeStyle"
  >
    <!-- 左侧锚点 - 目标类型 -->
    <Handle
      type="target"
      :position="Position.Left"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0, left: '-4px', top: '50%', transform: 'translateY(-50%)' }]"
      id="left-handle"
      class="handle-point"
    />
    
    <!-- 顶部锚点 - 目标类型 -->
    <Handle
      type="target"
      :position="Position.Top"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0, top: '-4px', left: '50%', transform: 'translateX(-50%)' }]"
      id="top-handle"
      class="handle-point"
    />
    
    <!-- 右侧锚点 - 源类型 -->
    <Handle
      type="source"
      :position="Position.Right"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0, right: '-4px', top: '50%', transform: 'translateY(-50%)' }]"
      id="right-handle"
      class="handle-point"
    />
    
    <!-- 底部锚点 - 源类型 -->
    <Handle
      type="source"
      :position="Position.Bottom"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0, bottom: '-4px', left: '50%', transform: 'translateX(-50%)' }]"
      id="bottom-handle"
      class="handle-point"
    />
    
    <!-- 添加菱形背景 -->
    <svg 
      class="diamond-background" 
      :width="nodeWidth" 
      :height="nodeHeight"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path 
        d="M50,0 L100,50 L50,100 L0,50 Z" 
        fill="white"
        :stroke="props.selected ? '#1a192b' : '#555'"
        :stroke-width="props.selected ? '1' : '1'"
      />
    </svg>
    
    <div class="node-content" @dblclick="handleDoubleClick">
      <span v-if="!isEditing">{{ data.label }}</span>
      <input 
        v-else
        ref="editInputRef"
        v-model="editLabel" 
        @blur="finishEditing"
        @keydown="handleKeydown"
        class="edit-input nodrag nowheel"
        type="text"
      />
    </div>
    
    <!-- 修改后 -->
    <template v-if="selected && !isEditing">
      <div 
        v-for="position in resizeHandlePositions" 
        :key="position.type"
        :class="['resize-handle', position.class]"
        @mousedown="(event) => startResize(event, position.type)"
        class="nodrag"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
// 获取 Vue Flow 实例和方法
const vueFlowInstance = useVueFlow()
const { updateNode, setNodes, updateNodeInternals, getNodes } = vueFlowInstance

const nodeRef = ref<HTMLElement | null>(null)
const showHandles = ref(false)
const selected = computed(() => props.selected)

// 计算节点尺寸
const nodeWidth = computed(() => {
  const width = props.data.style?.width || '100px'
  return parseInt(width)
})

const nodeHeight = computed(() => {
  const height = props.data.style?.height || '60px'
  return parseInt(height)
})

// 计算节点样式，包括字体样式
const nodeStyle = computed(() => ({
  fontSize: `${props.data.fontSize || 12}px`,
  color: props.data.color || '#000000',
  width: `${nodeWidth.value}px`,
  height: `${nodeHeight.value}px`
}))

const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#555',
  transition: 'opacity 0.2s ease'
}

// 调整大小相关
const resizeHandlePositions = [
  { class: 'top', type: 'top', style: { top: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
  { class: 'right', type: 'right', style: { right: '-5px', top: '50%', transform: 'translateY(-50%)', cursor: 'e-resize' } },
  { class: 'bottom', type: 'bottom', style: { bottom: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
  { class: 'left', type: 'left', style: { left: '-5px', top: '50%', transform: 'translateY(-50%)', cursor: 'w-resize' } },
  { class: 'topLeft', type: 'topLeft', style: { top: '-5px', left: '-5px', cursor: 'nw-resize' } },
  { class: 'topRight', type: 'topRight', style: { top: '-5px', right: '-5px', cursor: 'ne-resize' } },
  { class: 'bottomLeft', type: 'bottomLeft', style: { bottom: '-5px', left: '-5px', cursor: 'sw-resize' } },
  { class: 'bottomRight', type: 'bottomRight', style: { bottom: '-5px', right: '-5px', cursor: 'se-resize' } }
]


// 监听选中状态变化
watch(() => props.selected, (newSelected) => {
  if (newSelected) {
    // 节点被选中时，确保节点内部结构更新
    nextTick(() => {
      // 确保节点的 DOM 尺寸与数据一致
      if (nodeRef.value) {
        const width = props.data.style?.width || '100px'
        const height = props.data.style?.height || '60px'
        
        // 检查节点的实际尺寸
        const actualWidth = nodeRef.value.offsetWidth
        const actualHeight = nodeRef.value.offsetHeight
        
        // 强制设置节点的样式尺寸为实际尺寸
        nodeRef.value.style.width = `${actualWidth}px`
        nodeRef.value.style.height = `${actualHeight}px`
        
        // 强制重新计算布局
        nodeRef.value.offsetHeight // 触发重排
        
        // 更新节点数据，确保数据与 DOM 一致
        updateNode(props.id, {
          data: {
            ...props.data,
            style: {
              ...props.data.style,
              width: `${actualWidth}px`,
              height: `${actualHeight}px`
            }
          },
          style: {
            width: `${actualWidth}px`,
            height: `${actualHeight}px`
          }
        })
        
        // 更新节点内部结构
        updateNodeInternals([props.id])
      }
    })
  }
})

// 监听节点编辑状态变化
watch(() => props.data.isEditing, (newIsEditing) => {
  // 如果外部将编辑状态设为false，同步更新本地状态
  if (newIsEditing === false && isEditing.value === true) {
    isEditing.value = false
  }
})

const isEditing = ref(false)
const editLabel = ref('')
const editInputRef = ref<HTMLInputElement | null>(null)

const handleDoubleClick = (event: MouseEvent) => {
  // 阻止事件冒泡，防止触发画布缩放
  event.stopPropagation()
  
  // 保存当前节点尺寸
  const currentWidth = nodeRef.value?.offsetWidth || 0
  const currentHeight = nodeRef.value?.offsetHeight || 0
  
  isEditing.value = true
  editLabel.value = props.data.label || ''
  
  // 更新节点数据，标记为编辑状态并保存当前尺寸
  updateNode(props.id, { 
    data: { 
      ...props.data, 
      isEditing: true,
      style: {
        ...props.data.style,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`
      }
    } 
  })
  
  // 等待DOM更新后聚焦并选择全部文本
  nextTick(() => {
    if (editInputRef.value) {
      // 设置输入框尺寸与节点一致
      editInputRef.value.style.width = '100%'
      editInputRef.value.style.height = '100%'
      editInputRef.value.style.boxSizing = 'border-box'
      
      // 聚焦并选择文本
      editInputRef.value.focus()
      editInputRef.value.select()
    }
    
    // 确保节点尺寸不变
    if (nodeRef.value) {
      nodeRef.value.style.width = `${currentWidth}px`
      nodeRef.value.style.height = `${currentHeight}px`
    }
  })
}

const finishEditing = () => {
  isEditing.value = false
  
  // 清除所有文本选择
  window.getSelection()?.removeAllRanges()
  
  // 获取当前节点尺寸
  const currentWidth = nodeRef.value?.offsetWidth || 0
  const currentHeight = nodeRef.value?.offsetHeight || 0
  
  // 更新节点标签并标记为非编辑状态，同时保持尺寸
  updateNode(props.id, { 
    data: { 
      ...props.data, 
      label: editLabel.value,
      isEditing: false,
      style: {
        ...props.data.style,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`
      }
    } 
  })
  
  // 确保节点尺寸不变
  if (nodeRef.value) {
    nodeRef.value.style.width = `${currentWidth}px`
    nodeRef.value.style.height = `${currentHeight}px`
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // 阻止事件冒泡，防止触发节点删除
  e.stopPropagation()
  
  if (e.key === 'Enter' && !e.shiftKey) {
    finishEditing()
  } else if (e.key === 'Escape') {
    isEditing.value = false
    // 清除所有文本选择
    window.getSelection()?.removeAllRanges()
    // 更新节点数据，标记为非编辑状态
    updateNode(props.id, { 
      data: { 
        ...props.data, 
        isEditing: false
      } 
    })
  }
  // 不处理Delete键，让浏览器默认行为删除选中文本
}

// 确保调整大小功能正常工作
const startResize = (event: MouseEvent, type: string) => {
  // 确保节点已经完全初始化
  if (!nodeRef.value) return
  
  event.preventDefault()
  event.stopPropagation()
  
  // 触发调整大小开始事件
  window.dispatchEvent(new CustomEvent('resize-start'))
  
  // 记录初始位置和大小
  const startX = event.clientX
  const startY = event.clientY
  const currentWidth = nodeRef.value ? nodeRef.value.offsetWidth : 100
  const currentHeight = nodeRef.value ? nodeRef.value.offsetHeight : 60
  const startWidth = currentWidth
  const startHeight = currentHeight
  
  // 获取当前节点的初始位置
  const node = getNodes.value.find(n => n.id === props.id)
  if (!node) return
  
  const startPosition = { ...node.position }
  
  // 处理鼠标移动事件
  const handleMouseMove = (moveEvent: MouseEvent) => {
    moveEvent.preventDefault()
    moveEvent.stopPropagation()
    
    // 计算鼠标移动距离
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY
    
    // 根据调整类型计算新的宽度、高度和位置
    let newWidth = startWidth
    let newHeight = startHeight
    let newPosition = { ...startPosition }
    
    switch (type) {
      case 'top':
        newHeight = Math.max(80, startHeight - deltaY)
        newPosition.y = startPosition.y + (startHeight - newHeight)
        break
      case 'right':
        newWidth = Math.max(100, startWidth + deltaX)
        break
      case 'bottom':
        newHeight = Math.max(80, startHeight + deltaY)
        break
      case 'left':
        newWidth = Math.max(100, startWidth - deltaX)
        newPosition.x = startPosition.x + (startWidth - newWidth)
        break
      case 'topLeft':
        newWidth = Math.max(100, startWidth - deltaX)
        newHeight = Math.max(80, startHeight - deltaY)
        newPosition.x = startPosition.x + (startWidth - newWidth)
        newPosition.y = startPosition.y + (startHeight - newHeight)
        break
      case 'topRight':
        newWidth = Math.max(100, startWidth + deltaX)
        newHeight = Math.max(80, startHeight - deltaY)
        newPosition.y = startPosition.y + (startHeight - newHeight)
        break
      case 'bottomLeft':
        newWidth = Math.max(100, startWidth - deltaX)
        newHeight = Math.max(80, startHeight + deltaY)
        newPosition.x = startPosition.x + (startWidth - newWidth)
        break
      case 'bottomRight':
        newWidth = Math.max(100, startWidth + deltaX)
        newHeight = Math.max(80, startHeight + deltaY)
        break
    }
    
    // 确保尺寸是2的倍数，有助于网格对齐
    newWidth = Math.round(newWidth / 2) * 2
    newHeight = Math.round(newHeight / 2) * 2
    
    // 重新计算位置偏移以适应调整后的尺寸
    if (type.includes('Left')) {
      newPosition.x = startPosition.x + (startWidth - newWidth)
    }
    if (type.includes('top') || type === 'Top') {
      newPosition.y = startPosition.y + (startHeight - newHeight)
    }
    
    // 更新节点位置和大小
    if (nodeRef.value) {
      nodeRef.value.style.width = `${newWidth}px`
      nodeRef.value.style.height = `${newHeight}px`
      
      // 更新节点位置
      updateNode(props.id, {
        position: newPosition,
        style: {
          width: `${newWidth}px`,
          height: `${newHeight}px`
        },
        data: {
          ...node.data,
          style: {
            ...node.data.style,
            width: `${newWidth}px`,
            height: `${newHeight}px`
          }
        }
      })
    }
  }
  
  // 处理鼠标松开事件
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    // 触发调整大小结束事件
    window.dispatchEvent(new CustomEvent('resize-end'))
    
    // 确保节点保持选中状态
    setTimeout(() => {
      const node = getNodes.value.find(n => n.id === props.id)
      if (node && !node.selected) {
        const updatedNodes = getNodes.value.map(n => 
          n.id === props.id ? { ...n, selected: true } : n
        )
        setNodes(updatedNodes)
      }
    }, 50)
  }
  
  // 添加事件监听器
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 组件挂载时确保节点初始化正确
onMounted(() => {
  // 确保节点的 DOM 尺寸与数据一致
  if (nodeRef.value) {
    const width = props.data.style?.width || '100px'
    const height = props.data.style?.height || '60px'
    
    nodeRef.value.style.width = width
    nodeRef.value.style.height = height
    
    // 强制重新计算布局
    nodeRef.value.offsetHeight // 触发重排
  }
  
  // 更新节点内部结构
  updateNodeInternals([props.id])
  
  // 添加一个小延时，确保节点完全初始化
  const initTimer = setTimeout(() => {
    if (nodeRef.value) {
      // 再次确保节点的 DOM 尺寸与数据一致
      const width = props.data.style?.width || '100px'
      const height = props.data.style?.height || '60px'
      
      nodeRef.value.style.width = width
      nodeRef.value.style.height = height
      
      // 强制重新计算布局
      nodeRef.value.offsetHeight // 触发重排
    }
    updateNodeInternals([props.id])
  }, 100)

  // 在组件卸载时清除定时器
  onUnmounted(() => {
    clearTimeout(initTimer)
  })
})

// 处理节点点击事件
const handleNodeClick = (event: MouseEvent) => {
  // 阻止事件冒泡
  event.stopPropagation()
  
  // 如果正在编辑，不处理选中逻辑
  if (isEditing.value) return
  
  // 获取当前所有节点
  const nodes = getNodes.value
  
  if (event.ctrlKey) {
    // Ctrl键按下时的多选逻辑
    if (props.selected) {
      // 如果当前节点已选中，则仅取消当前节点的选中状态
      setNodes(nodes.map(node => ({
        ...node,
        selected: node.id === props.id ? false : node.selected
      })))
    } else {
      // 如果当前节点未选中，则添加到选中状态
      setNodes(nodes.map(node => ({
        ...node,
        selected: node.id === props.id ? true : node.selected
      })))
    }
  } else {
    // 没有按Ctrl键时的单选逻辑（保持原有逻辑）
    if (props.selected) {
      // 如果当前节点已选中，则取消所有节点的选中状态
      setNodes(nodes.map(node => ({
        ...node,
        selected: false
      })))
    } else {
      // 如果当前节点未选中，则只选中当前节点
      setNodes(nodes.map(node => ({
        ...node,
        selected: node.id === props.id
      })))
    }
  }
}
</script>

<script lang="ts">
// 添加默认导出
export default {
  name: 'ConditionNode'
}
</script>

<style>
/* 移除 Vue Flow 生成的外层节点的边框和背景 */
.vue-flow__node.vue-flow__node-condition {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  outline: none !important;
}

/* 条件节点基本样式 */
.condition-node {
  padding: 8px;
  background: transparent;
  width: 100px;      /* 设置默认宽度 */
  height: 60px;      /* 设置默认高度 */
  min-width: 100px;  /* 设置最小宽度 */
  min-height: 60px;  /* 设置最小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;   /* 设置默认字体大小 */
  box-sizing: border-box;
}

/* 选中状态样式 - 不改变边框宽度 */
.condition-node.selected {
  border: 1px dotted #555;
}

/* 连接点样式 */
.vue-flow__handle {
  width: 8px;
  height: 8px;
  background: #555;
  border-radius: 50%;
  border: 2px solid white;
  z-index: 10;  /* 确保连接点在最上层 */
  transform: translate(0, 0); /* 重置默认的transform避免冲突 */
}

/* 连接点位置调整 - 这些样式将被我们的内联样式覆盖 */
.vue-flow__handle-top {
  top: -4px;
  transform: translate(-50%, 0); /* 只在X轴保持居中 */
}

.vue-flow__handle-right {
  right: -4px;
  transform: translate(0, -50%); /* 只在Y轴保持居中 */
}

.vue-flow__handle-bottom {
  bottom: -4px;
  transform: translate(-50%, 0); /* 只在X轴保持居中 */
}

.vue-flow__handle-left {
  left: -4px;
  transform: translate(0, -50%); /* 只在Y轴保持居中 */
}

/* 节点内容样式 */
.node-content {
  text-align: center;
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;  /* 确保内容在菱形背景之上 */
}

/* 菱形背景样式 */
.diamond-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;  /* 确保菱形背景在最底层 */
}

.diamond-background path {
  transition: stroke-width 0.2s ease;
}

.condition-node:hover .diamond-background path {
  stroke-width: 1.5;
}

/* 调整大小的控制点样式 */
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

/* 调整中的锚点样式 */
.resize-handle.resizing {
  background: #f0f0f0;
  border-color: #333;
}

/* 确保锚点不会被其他元素的事件处理覆盖 */
.nodrag {
  pointer-events: all !important;
}

/* 连接点悬停和连接状态 */
.vue-flow__handle.connecting {
  background: #1a192b;
  z-index: 10;
}

.vue-flow__handle.valid {
  background: #55dd99;
  z-index: 10;
}

/* 编辑状态下的节点样式 */
.condition-node.editing {
  user-select: text;
  box-sizing: border-box;
}

/* 确保编辑状态下内容不会溢出 */
.condition-node.editing .node-content {
  overflow: hidden;
  box-sizing: border-box;
}

/* 编辑输入框样式优化 */
.edit-input {
  width: 100%;
  height: 100%;
  min-height: 20px;
  border: none;
  background: transparent;
  text-align: center;
  outline: none;
  font-size: inherit;
  color: inherit;
  padding: 0;
  margin: 0;
  font-family: inherit;
  box-sizing: border-box; /* 确保padding和border不会增加元素总宽高 */
}

/* 调整大小锚点的位置和光标样式 */
.resize-handle.top {
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: n-resize;
}

.resize-handle.right {
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: e-resize;
}

.resize-handle.bottom {
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  cursor: s-resize;
}

.resize-handle.left {
  left: -5px;
  top: 50%;
  transform: translateY(-50%);
  cursor: w-resize;
}

.resize-handle.topLeft {
  top: -5px;
  left: -5px;
  cursor: nw-resize;
}

.resize-handle.topRight {
  top: -5px;
  right: -5px;
  cursor: ne-resize;
}

.resize-handle.bottomLeft {
  bottom: -5px;
  left: -5px;
  cursor: sw-resize;
}

.resize-handle.bottomRight {
  bottom: -5px;
  right: -5px;
  cursor: se-resize;
}
</style> 