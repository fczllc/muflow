<template>
  <div 
    class="rounded-rect-node" 
    :class="{ selected, editing: isEditing }"
    ref="nodeRef"
    @mouseenter="showHandles = true" 
    @mouseleave="showHandles = false"
    :style="nodeStyle"
  >
    <Handle
      v-for="position in positions"
      :key="position"
      :type="handleType(position)"
      :position="position"
      :style="[handleStyle, { opacity: showHandles || props.selected ? 1 : 0 }]"
      :id="`${position}-handle`"
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
    <template v-if="selected">
      <div 
        v-for="(pos, index) in resizeHandlePositions" 
        :key="index"
        class="resize-handle"
        :class="pos.class"
        @mousedown="startResize($event, pos.type)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
// 获取 Vue Flow 实例和方法
const vueFlowInstance = useVueFlow()
const { updateNode, setNodes } = vueFlowInstance
const { getNodes } = vueFlowInstance

const nodeRef = ref<HTMLElement | null>(null)
const showHandles = ref(false)
const selected = computed(() => props.selected)

const positions = [Position.Top, Position.Right, Position.Bottom, Position.Left]

// 计算节点样式，包括字体样式
const nodeStyle = computed(() => ({
  fontSize: `${props.data.fontSize || 14}px`,
  color: props.data.color || '#000000',
  width: props.data.style?.width || '150px',
  height: props.data.style?.height || '40px'
}))

const handleType = (position: Position) => {
  switch (position) {
    case Position.Left:
    case Position.Top:
      return 'target'
    case Position.Right:
    case Position.Bottom:
      return 'source'
    default:
      return 'source'
  }
}

const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#555',
  transition: 'opacity 0.2s ease'
}

// 调整大小相关
const resizeHandlePositions = [
  { class: 'top', type: 'top' },
  { class: 'right', type: 'right' },
  { class: 'bottom', type: 'bottom' },
  { class: 'left', type: 'left' }
]

const startResize = (event: MouseEvent, type: string) => {
  event.stopPropagation()
  
  if (!nodeRef.value) return
  
  // 获取当前节点的初始位置和尺寸
  const nodeElement = nodeRef.value
  const startX = event.clientX
  const startY = event.clientY
  const startWidth = nodeElement.offsetWidth
  const startHeight = nodeElement.offsetHeight
  
  // 获取当前节点的初始位置
  let startPosition = { x: 0, y: 0 }
  
  // 尝试从 Vue Flow 实例获取节点信息
  try {
    // getNodes 是一个计算属性，需要使用 .value 访问
    const nodes = getNodes.value
    const currentNode = nodes.find(n => n.id === props.id)
    if (currentNode) {
      startPosition = { ...currentNode.position }
    }
  } catch (error) {
    console.error('Error getting node position:', error)
    // 如果无法获取位置，使用默认值
  }
  
  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    
    let newWidth = startWidth
    let newHeight = startHeight
    let newPosition = { ...startPosition }
    
    switch (type) {
      case 'right':
        newWidth = Math.max(120, startWidth + dx)
        break
      case 'left':
        newWidth = Math.max(120, startWidth - dx)
        // 更新节点位置
        newPosition.x = startPosition.x + dx
        break
      case 'bottom':
        newHeight = Math.max(40, startHeight + dy)
        break
      case 'top':
        newHeight = Math.max(40, startHeight - dy)
        // 更新节点位置
        newPosition.y = startPosition.y + dy
        break
    }
    
    // 设置节点的新尺寸
    nodeElement.style.width = `${newWidth}px`
    nodeElement.style.height = `${newHeight}px`
    
    // 更新节点位置（仅当拖动左侧或顶部调整点时）
    if (type === 'left' || type === 'top') {
      setNodes((nodes) => 
        nodes.map((n) => {
          if (n.id === props.id) {
            return {
              ...n,
              position: newPosition
            }
          }
          return n
        })
      )
    }
  }
  
  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'default'
    
    // 保存节点尺寸到数据中
    if (nodeElement) {
      updateNode(props.id, {
        data: {
          ...props.data,
          style: {
            ...props.data.style,
            width: `${nodeElement.offsetWidth}px`,
            height: `${nodeElement.offsetHeight}px`
          }
        }
      })
    }
  }
  
  document.body.style.cursor = type === 'left' || type === 'right' ? 'ew-resize' : 'ns-resize'
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const isEditing = ref(false)
const editLabel = ref('')
const editInputRef = ref(null)

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
  border-radius: 3px;  /* 设置圆角为 3px */
  border: 1px solid #555;  /* 设置边框为 1px */
  background: white;
  min-width: 120px;
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 12px;
  color: inherit;
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
  border: 1px solid #555;
  border-radius: 2px;
  z-index: 1;
}

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

.resize-handle:hover {
  background: #f0f0f0;
  border-color: #333;
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
</style> 