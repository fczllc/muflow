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
    :class="{ selected, editing: isEditing, 'align-left': textAlign === 'left', 'align-center': textAlign === 'center', 'align-right': textAlign === 'right' }"
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
        d="M50 5 L95 50 L50 95 L5 50 Z" 
        :fill="props.data.savedBgColor || props.data.style?.backgroundColor || 'white'"
        :stroke="props.selected ? '#1a192b' : (props.data.style?.borderColor || '#000000')"
        :stroke-width="props.selected ? 1 : (props.data.style?.borderWidth ? parseFloat(props.data.style.borderWidth) : 1)"
        :stroke-dasharray="!props.selected && props.data.style?.borderStyle === 'dashed' ? '5,5' : 
                          !props.selected && props.data.style?.borderStyle === 'dotted' ? '2,2' : 'none'"
      />
    </svg>
    
    <div class="node-content" @dblclick="handleDoubleClick">
      <span v-if="!isEditing" :style="{ 
        textDecoration: props.data.style?.textDecoration || 'none',
        fontWeight: props.data.style?.fontWeight || 'normal',
        fontStyle: props.data.style?.fontStyle || 'normal'
      }">{{ data.label }}</span>
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
const nodeStyle = computed(() => {
  // 获取正确的边框宽度
  const getBorderWidth = () => {
    // 如果没有设置边框宽度，返回默认值
    if (!props.data.style?.borderWidth) {
      return '1px';
    }
    
    const width = props.data.style.borderWidth;
    
    // 如果已经包含单位，直接返回
    if (typeof width === 'string' && 
        (width.endsWith('px') || 
         width.endsWith('em') || 
         width.endsWith('%'))) {
      return width;
    }
    
    // 如果是数字，添加px单位
    if (typeof width === 'number') {
      return `${width}px`;
    }
    
    // 如果是字符串数字，添加px单位
    if (typeof width === 'string' && !isNaN(parseFloat(width))) {
      return `${parseFloat(width)}px`;
    }
    
    // 默认返回1px
    return '1px';
  };

  return {
    fontSize: `${props.data.fontSize || 12}px`,
    color: props.data.color || '#000000',
    width: `${nodeWidth.value}px`,
    height: `${nodeHeight.value}px`,
    textAlign: props.data.style?.textAlign || 'center',
    fontWeight: props.data.style?.fontWeight,
    fontStyle: props.data.style?.fontStyle,
    textDecoration: props.data.style?.textDecoration,
    // 添加背景色支持 - 正确访问节点背景色
    backgroundColor: 'transparent', // 条件节点使用SVG背景，设置透明
    // 添加边框样式支持 - 与CircleNode保持一致
    borderWidth: '0px', // 条件节点使用SVG边框，这里设为0
    borderColor: 'transparent',
    borderStyle: 'none'
  }
})

// 计算当前文本对齐方式
const textAlign = computed(() => props.data.style?.textAlign || 'center')

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
  
  // 确保样式对象存在
  const currentStyle = props.data?.style || {}
  
  // 更新节点标签并标记为非编辑状态，同时保持尺寸
  updateNode(props.id, { 
    data: { 
      ...props.data, 
      label: editLabel.value,
      isEditing: false,
      style: {
        ...currentStyle,
        width: `${currentWidth}px`,
        height: `${currentHeight}px`,
        // 确保保留字体样式属性
        fontWeight: currentStyle.fontWeight,
        fontStyle: currentStyle.fontStyle,
        textDecoration: currentStyle.textDecoration,
        textAlign: currentStyle.textAlign || 'center'
      }
    } 
  })
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
      
      // 确保保持borderWidth为纯数字
      let currentBorderWidth = node.data?.style?.borderWidth || 1;
      if (typeof currentBorderWidth === 'string') {
        // 移除所有非数字字符(如'px')
        const cleanBorderWidth = currentBorderWidth.replace(/[^\d.-]/g, '');
        currentBorderWidth = parseFloat(cleanBorderWidth) || 1;
      }
      
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
            height: `${newHeight}px`,
            // 确保borderWidth是纯数字
            borderWidth: currentBorderWidth
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
  // 确保节点数据中有样式对象
  if (!props.data.style) {
    // 创建默认样式
    updateNode(props.id, {
      data: {
        ...props.data,
        style: {
          textAlign: 'center',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          width: '100px',
          height: '60px',
          backgroundColor: props.data.savedBgColor || '#ffffff',
          borderWidth: 1, // 使用纯数字
          borderColor: '#555',
          borderStyle: 'solid'
        }
      }
    })
  } else {
    // 确保样式对象包含所有需要的属性
    const currentStyle = props.data.style
    if (!currentStyle.fontWeight || !currentStyle.fontStyle || !currentStyle.textDecoration || !currentStyle.textAlign || !currentStyle.borderWidth || !currentStyle.borderColor || typeof currentStyle.borderWidth === 'string') {
      // 确保borderWidth是数字类型
      let borderWidth = currentStyle.borderWidth || 1;
      
      if (typeof borderWidth === 'string') {
        // 移除所有非数字字符(如'px')
        const cleanBorderWidth = borderWidth.replace(/[^\d.-]/g, '');
        borderWidth = parseFloat(cleanBorderWidth) || 1;
      }
      
      updateNode(props.id, {
        data: {
          ...props.data,
          style: {
            ...currentStyle,
            fontWeight: currentStyle.fontWeight || 'normal',
            fontStyle: currentStyle.fontStyle || 'normal',
            textDecoration: currentStyle.textDecoration || 'none',
            textAlign: currentStyle.textAlign || 'center',
            backgroundColor: props.data.savedBgColor || currentStyle.backgroundColor || '#ffffff',
            borderWidth: borderWidth, // 使用纯数字
            borderColor: currentStyle.borderColor || '#555',
            borderStyle: currentStyle.borderStyle || 'solid'
          }
        }
      })
    }
  }

  // 如果节点有保存的背景色，确保应用到style中
  if (props.data.savedBgColor) {
    updateNode(props.id, {
      data: {
        ...props.data,
        style: {
          ...props.data.style,
          backgroundColor: props.data.savedBgColor
        }
      }
    })
  }

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
.condition-node .node-content {
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
}

/* 根据对齐方式设置内容对齐 */
.condition-node.align-left .node-content {
  justify-content: flex-start;
  text-align: left;
  padding-left: 15%;
}

.condition-node.align-center .node-content {
  justify-content: center;
  text-align: center;
}

.condition-node.align-right .node-content {
  justify-content: flex-end;
  text-align: right;
  padding-right: 15%;
}

/* 确保加粗、倾斜和下划线样式正确显示 */
.condition-node .node-content span {
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 100%;
  display: inline-block;
  width: 100%;
  /* 使用继承样式以确保正确显示下划线等文本装饰 */
  text-decoration: inherit;
  font-weight: inherit;
  font-style: inherit;
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
  outline: none;
  font-size: inherit;
  color: inherit;
  padding: 0;
  margin: 0;
  font-family: inherit;
  box-sizing: border-box; /* 确保padding和border不会增加元素总宽高 */
}

.condition-node.align-left .edit-input {
  text-align: left !important;
}

.condition-node.align-center .edit-input {
  text-align: center !important;
}

.condition-node.align-right .edit-input {
  text-align: right !important;
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