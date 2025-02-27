<template>
  <div 
    class="text-label-node" 
    :class="{ selected, editing: isEditing }"
    ref="nodeRef"
    @dblclick="handleDoubleClick"
    :style="nodeStyle"
  >
    <div class="node-content">
      <span v-if="!isEditing">{{ data.label }}</span>
      <div v-else class="edit-container">
        <textarea 
          ref="editInputRef"
          v-model="editLabel" 
          @blur="finishEditing"
          @keydown="handleKeydown"
          class="edit-input nodrag nowheel"
        ></textarea>
      </div>
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TextLabelNode'
})
</script>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
// 获取 Vue Flow 实例和方法
const vueFlowInstance = useVueFlow()
const { updateNode, setNodes } = vueFlowInstance
const { getNodes } = vueFlowInstance

const nodeRef = ref<HTMLElement | null>(null)
const selected = computed(() => props.selected)
const isEditing = ref(false)
const editLabel = ref('')
const editInputRef = ref<HTMLTextAreaElement | null>(null)

// 计算节点样式，包括字体样式
const nodeStyle = computed(() => ({
  fontSize: `${props.data.fontSize || 14}px`,
  color: props.data.color || '#000000'
}))

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
        newWidth = Math.max(100, startWidth + dx)
        break
      case 'left':
        newWidth = Math.max(100, startWidth - dx)
        // 更新节点位置
        newPosition.x = startPosition.x + dx
        break
      case 'bottom':
        newHeight = Math.max(30, startHeight + dy)
        break
      case 'top':
        newHeight = Math.max(30, startHeight - dy)
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
    if (nodeRef.value) {
      updateNode(props.id, {
        data: {
          ...props.data,
          style: {
            ...props.data.style,
            width: `${nodeRef.value.offsetWidth}px`,
            height: `${nodeRef.value.offsetHeight}px`
          }
        }
      })
    }
  }
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  
  // 设置鼠标样式
  switch (type) {
    case 'right':
      document.body.style.cursor = 'e-resize'
      break
    case 'left':
      document.body.style.cursor = 'w-resize'
      break
    case 'bottom':
      document.body.style.cursor = 's-resize'
      break
    case 'top':
      document.body.style.cursor = 'n-resize'
      break
  }
}

// 处理双击事件，进入编辑模式
const handleDoubleClick = () => {
  if (isEditing.value) return
  
  isEditing.value = true
  editLabel.value = props.data.label || ''
  
  // 等待DOM更新后设置输入框焦点
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
  })
}

// 完成编辑
const finishEditing = () => {
  if (!isEditing.value) return
  
  // 获取当前节点尺寸
  const currentWidth = nodeRef.value?.offsetWidth || 100
  const currentHeight = nodeRef.value?.offsetHeight || 30
  
  // 更新节点数据
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
  
  isEditing.value = false
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
/* 移除外层节点的所有边框和背景 */
.vue-flow__node.vue-flow__node-textLabel {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  outline: none !important;
}

/* 文本标签节点基本样式 */
.text-label-node {
  padding: 5px;
  background: transparent;
  min-width: 100px;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* 节点内容样式 */
.node-content {
  text-align: center;
  white-space: pre-wrap;  /* 保留空格和换行 */
  word-break: break-word; /* 允许在单词内换行 */
  word-wrap: break-word; /* 长单词换行 */
  overflow-wrap: break-word; /* 现代浏览器的长单词换行 */
  user-select: none;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 选中状态样式 - 只显示虚线轮廓 */
.text-label-node.selected {
  outline: 1px dashed #1a192b !important;
}

/* 编辑容器样式 */
.edit-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 编辑输入框样式 */
.edit-input {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  background: transparent !important;
  text-align: center !important;
  outline: none !important;
  font-size: inherit !important;
  color: inherit !important;
  resize: none !important;
  padding: 5px !important;
  margin: 0 !important;
  font-family: inherit !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
  word-wrap: break-word !important;
  overflow-wrap: break-word !important;
  box-sizing: border-box !important;
  overflow: hidden !important; /* 隐藏滚动条 */
}

/* 修复文本区域的垂直对齐问题 */
textarea.edit-input {
  display: block !important;
  line-height: 1.2 !important;
  overflow: hidden !important; /* 隐藏滚动条 */
}

/* 编辑状态下的节点样式 */
.text-label-node.editing {
  outline: 1px dashed #1a192b !important;
  user-select: text;
}

/* 确保编辑状态下内容不会溢出 */
.text-label-node.editing .node-content {
  position: relative;
  overflow: visible;
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
</style>