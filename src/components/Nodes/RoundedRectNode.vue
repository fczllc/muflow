<template>
  <div 
    class="rounded-rect-node" 
    :class="{ selected, editing: isEditing }"
    ref="nodeRef"
    @mouseenter="showHandles = true" 
    @mouseleave="showHandles = false"
    :style="nodeStyle"
  >
    <!-- 左侧锚点 - 目标类型 -->
    <Handle
      type="target"
      :position="Position.Left"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0 }]"
      id="left-handle"
      class="handle-point"
    />
    
    <!-- 顶部锚点 - 目标类型 -->
    <Handle
      type="target"
      :position="Position.Top"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0 }]"
      id="top-handle"
      class="handle-point"
    />
    
    <!-- 右侧锚点 - 源类型 -->
    <Handle
      type="source"
      :position="Position.Right"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0 }]"
      id="right-handle"
      class="handle-point"
    />
    
    <!-- 底部锚点 - 源类型 -->
    <Handle
      type="source"
      :position="Position.Bottom"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0 }]"
      id="bottom-handle"
      class="handle-point"
    />
    
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
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
// 获取 Vue Flow 实例和方法
const vueFlowInstance = useVueFlow()
const { updateNode, setNodes, updateNodeInternals, getNodes } = vueFlowInstance

const nodeRef = ref<HTMLElement | null>(null)
const showHandles = ref(false)
const selected = computed(() => props.selected)

// 计算节点样式，包括字体样式
const nodeStyle = computed(() => ({
  fontSize: `${props.data.fontSize || 14}px`,
  color: props.data.color || '#000000',
  width: props.data.style?.width || '120px',
  height: props.data.style?.height || '42px'
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

// 将 nodePositionDelta 移到函数外部，确保在函数调用之间保持状态
const nodePositionDelta = ref({ x: 0, y: 0 })

// 监听选中状态变化
watch(() => props.selected, (newSelected) => {
  if (newSelected) {
    // 节点被选中时，确保节点内部结构更新
    nextTick(() => {
      // 确保节点的 DOM 尺寸与数据一致
      if (nodeRef.value) {
        const width = props.data.style?.width || '120px'
        const height = props.data.style?.height || '42px'
        
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
  }
  // 不处理Delete键，让浏览器默认行为删除选中文本
}

// 确保调整大小功能正常工作
const startResize = (event: MouseEvent, type: string) => {
  // 确保节点已经完全初始化
  if (nodeRef.value) {
    // 强制重新计算布局
    nodeRef.value.offsetHeight // 触发重排
  }
  
  event.preventDefault()
  event.stopPropagation()
  
  // 触发调整大小开始事件
  window.dispatchEvent(new CustomEvent('resize-start'))
  
  // 记录初始位置和大小
  const startX = event.clientX
  const startY = event.clientY
  
  // 获取当前节点的宽度和高度 - 确保使用最新的尺寸
  const currentWidth = nodeRef.value ? nodeRef.value.offsetWidth : 120
  const currentHeight = nodeRef.value ? nodeRef.value.offsetHeight : 46
  const startWidth = currentWidth
  const startHeight = currentHeight
  
  // 处理鼠标移动事件
  const handleMouseMove = (moveEvent: MouseEvent) => {
    moveEvent.preventDefault()
    moveEvent.stopPropagation()
    
    // 计算鼠标移动距离
    const deltaX = moveEvent.clientX - startX
    const deltaY = moveEvent.clientY - startY
    
    // 根据调整类型计算新的宽度和高度
    let newWidth = startWidth
    let newHeight = startHeight
    let positionDeltaX = 0
    let positionDeltaY = 0
    
    switch (type) {
      case 'top':
        newHeight = Math.max(46, startHeight - deltaY)
        positionDeltaY = startHeight - newHeight
        break
      case 'right':
        newWidth = Math.max(120, startWidth + deltaX)
        break
      case 'bottom':
        newHeight = Math.max(46, startHeight + deltaY)
        break
      case 'left':
        newWidth = Math.max(120, startWidth - deltaX)
        positionDeltaX = startWidth - newWidth
        break
      case 'topLeft':
        newWidth = Math.max(100, startWidth - deltaX)
        newHeight = Math.max(30, startHeight - deltaY)
        positionDeltaX = startWidth - newWidth
        positionDeltaY = startHeight - newHeight
        break
      case 'topRight':
        newWidth = Math.max(100, startWidth + deltaX)
        newHeight = Math.max(30, startHeight - deltaY)
        positionDeltaY = startHeight - newHeight
        break
      case 'bottomLeft':
        newWidth = Math.max(100, startWidth - deltaX)
        newHeight = Math.max(30, startHeight + deltaY)
        positionDeltaX = startWidth - newWidth
        break
      case 'bottomRight':
        newWidth = Math.max(100, startWidth + deltaX)
        newHeight = Math.max(30, startHeight + deltaY)
        break
    }
    
    // 直接更新节点的样式
    if (nodeRef.value) {
      nodeRef.value.style.width = `${newWidth}px`
      nodeRef.value.style.height = `${newHeight}px`
    }
    
    // 存储位置变化，用于在鼠标松开时更新节点位置
    nodePositionDelta.value = { x: positionDeltaX, y: positionDeltaY }
  }
  
  // 处理鼠标松开事件
  const handleMouseUp = (upEvent: MouseEvent) => {
    // 阻止事件冒泡，防止触发画布点击事件
    upEvent.preventDefault()
    upEvent.stopPropagation()
    
    // 移除事件监听器
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    // 获取调整后的尺寸 - 使用 offsetWidth/offsetHeight 获取实际 DOM 尺寸
    if (nodeRef.value) {
      // 获取实际 DOM 尺寸
      const actualWidth = nodeRef.value.offsetWidth
      const actualHeight = nodeRef.value.offsetHeight
      
      // 计算内容区域尺寸（减去 padding）
      // 注意：如果使用 border-box 盒模型，这一步可以省略
      const newWidth = `${actualWidth}px`
      const newHeight = `${actualHeight}px`
      
      // 获取当前节点
      const node = getNodes.value.find(n => n.id === props.id)
      if (node) {
        // 计算新的位置
        const newPosition = {
          x: node.position.x + nodePositionDelta.value.x,
          y: node.position.y + nodePositionDelta.value.y
        }
        
        // 直接修改节点的 DOM 样式，确保视觉效果立即更新
        nodeRef.value.style.width = newWidth
        nodeRef.value.style.height = newHeight
        
        // 创建一个完整的节点更新对象
        const updatedNode = {
          ...node,
          position: newPosition,
          style: {
            ...node.style,
            width: newWidth,
            height: newHeight
          },
          data: {
            ...node.data,
            style: {
              ...node.data.style,
              width: newWidth,
              height: newHeight
            }
          },
          // 确保保持选中状态
          selected: true
        }
        
        // 使用 setNodes 更新所有节点
        const updatedNodes = getNodes.value.map(n => 
          n.id === props.id ? updatedNode : n
        )
        setNodes(updatedNodes)
        
        // 更新节点内部结构
        nextTick(() => {
          updateNodeInternals([props.id])
        })
      }
    }
    
    // 触发调整大小结束事件
    window.dispatchEvent(new CustomEvent('resize-end'))
    
    // 阻止后续事件
    setTimeout(() => {
      // 防止任何后续点击事件
      const preventClick = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        document.removeEventListener('click', preventClick, true)
      }
      document.addEventListener('click', preventClick, true)
      
      // 确保节点仍然保持选中状态
      setTimeout(() => {
        const node = getNodes.value.find(n => n.id === props.id)
        if (node && !node.selected) {
          // 如果节点不再被选中，强制重新选中
          const updatedNodes = getNodes.value.map(n => 
            n.id === props.id ? { ...n, selected: true } : n
          )
          setNodes(updatedNodes)
        }
      }, 50)
    }, 0)
  }
  
  // 添加事件监听器
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 组件挂载时确保节点初始化正确
onMounted(() => {
  // 确保节点的 DOM 尺寸与数据一致
  if (nodeRef.value) {
    const width = props.data.style?.width || '120px'
    const height = props.data.style?.height || '42px'
    
    nodeRef.value.style.width = width
    nodeRef.value.style.height = height
    
    // 强制重新计算布局
    nodeRef.value.offsetHeight // 触发重排
  }
  
  // 更新节点内部结构
  updateNodeInternals([props.id])
  
  // 添加一个小延时，确保节点完全初始化
  setTimeout(() => {
    if (nodeRef.value) {
      // 再次确保节点的 DOM 尺寸与数据一致
      const width = props.data.style?.width || '120px'
      const height = props.data.style?.height || '42px'
      
      nodeRef.value.style.width = width
      nodeRef.value.style.height = height
      
      // 强制重新计算布局
      nodeRef.value.offsetHeight // 触发重排
    }
    updateNodeInternals([props.id])
  }, 100)
})
</script>

<script lang="ts">
// 添加默认导出
export default {
  name: 'RoundedRectNode'
}
</script>

<style>
/* 移除 Vue Flow 生成的外层节点的边框和背景 */
.vue-flow__node.vue-flow__node-roundedRect {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  outline: none !important;
}

/* 圆角矩形节点基本样式 */
.rounded-rect-node {
  padding: 10px;
  border-radius: 3px;
  border: 1px solid #555;
  background: white;
  width: 120px;      /* 设置默认宽度 */
  height: 42px;      /* 设置默认高度 */
  min-width: 120px;  /* 设置最小宽度 */
  min-height: 42px;  /* 设置最小高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;   /* 设置默认字体大小 */
  box-sizing: border-box;
}

/* 选中状态样式 - 不改变边框宽度 */
.rounded-rect-node.selected {
  border: 1px solid #1a192b;  /* 保持 1px 边框 */
  box-shadow: 0 0 0 1px #1a192b;  /* 使用阴影创建选中效果 */
}

/* 连接点样式 */
.vue-flow__handle {
  width: 8px;
  height: 8px;
  background: #555;
  border-radius: 50%;
  border: 2px solid white;
}

/* 连接点位置调整 */
.vue-flow__handle-top {
  top: -4px;
}

.vue-flow__handle-right {
  right: -4px;
}

.vue-flow__handle-bottom {
  bottom: -4px;
}

.vue-flow__handle-left {
  left: -4px;
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
}

.vue-flow__handle.valid {
  background: #55dd99;
}

/* 编辑状态下的节点样式 */
.rounded-rect-node.editing {
  user-select: text;
  box-sizing: border-box;
}

/* 确保编辑状态下内容不会溢出 */
.rounded-rect-node.editing .node-content {
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