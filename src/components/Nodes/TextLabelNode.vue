<template>
  <div 
    class="text-label-node" 
    :class="{ selected, editing: isEditing, 'align-left': textAlign === 'left', 'align-center': textAlign === 'center', 'align-right': textAlign === 'right' }"
    ref="nodeRef"
    @dblclick="handleDoubleClick"
    @click="handleNodeClick"
    :style="nodeStyle"
  >
    <div class="node-content">
      <span v-if="!isEditing" :style="{ 
        textDecoration: props.data.style?.textDecoration || 'none',
        fontWeight: props.data.style?.fontWeight || 'normal',
        fontStyle: props.data.style?.fontStyle || 'normal'
      }">{{ data.label }}</span>
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
import { ref, computed, nextTick, watch, onMounted } from 'vue'
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

// 计算当前文本对齐方式
const textAlign = computed(() => props.data?.style?.textAlign || 'center')

// 在组件挂载时确保样式对象存在
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
          backgroundColor: props.data.savedBgColor || 'transparent'
        }
      }
    })
  } else {
    // 确保样式对象包含所有需要的属性，包括背景色
    const currentStyle = props.data.style;
    if (!currentStyle.fontWeight || !currentStyle.fontStyle || !currentStyle.textDecoration || !currentStyle.textAlign) {
      updateNode(props.id, {
        data: {
          ...props.data,
          style: {
            ...currentStyle,
            fontWeight: currentStyle.fontWeight || 'normal',
            fontStyle: currentStyle.fontStyle || 'normal',
            textDecoration: currentStyle.textDecoration || 'none',
            textAlign: currentStyle.textAlign || 'center',
            backgroundColor: props.data.savedBgColor || currentStyle.backgroundColor || 'transparent'
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
})

// 监听节点编辑状态变化
watch(() => props.data.isEditing, (newIsEditing) => {
  // 如果外部将编辑状态设为false，同步更新本地状态
  if (newIsEditing === false && isEditing.value === true) {
    isEditing.value = false
  }
})

// 计算节点样式，包括字体样式
const nodeStyle = computed(() => ({
  fontSize: `${props.data.fontSize || 12}px`,
  color: props.data.color || '#000000',
  textAlign: props.data.style?.textAlign || 'center',
  fontWeight: props.data.style?.fontWeight,
  fontStyle: props.data.style?.fontStyle,
  textDecoration: props.data.style?.textDecoration,
  backgroundColor: props.data?.savedBgColor || props.data?.style?.backgroundColor || 'transparent'
}))

// 调整大小相关
const resizeHandlePositions = [
  { class: 'top', type: 'top' },
  { class: 'right', type: 'right' },
  { class: 'bottom', type: 'bottom' },
  { class: 'left', type: 'left' }
]

const startResize = (event: MouseEvent, type: string) => {
  // 确保节点已经完全初始化
  if (!nodeRef.value) return
  
  event.stopPropagation()
  
  // 触发调整大小开始事件
  console.log('[TextLabelNode] 触发 resize-start 事件', { 
    nodeId: props.id,
    nodeType: 'textLabel',
    type: type
  })
  const startEvent = new CustomEvent('resize-start', {
    bubbles: true,
    composed: true,
    detail: { 
      nodeId: props.id,
      nodeType: 'textLabel',
      resizeType: type
    }
  })
  window.dispatchEvent(startEvent)
  
  // 记录初始位置和大小
  const startX = event.clientX
  const startY = event.clientY
  const currentWidth = nodeRef.value ? nodeRef.value.offsetWidth : 100
  const currentHeight = nodeRef.value ? nodeRef.value.offsetHeight : 30
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
        newHeight = Math.max(30, startHeight - deltaY)
        newPosition.y = startPosition.y + (startHeight - newHeight)
        break
      case 'right':
        newWidth = Math.max(100, startWidth + deltaX)
        break
      case 'bottom':
        newHeight = Math.max(30, startHeight + deltaY)
        break
      case 'left':
        newWidth = Math.max(100, startWidth - deltaX)
        newPosition.x = startPosition.x + (startWidth - newWidth)
        break
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
    console.log('[TextLabelNode] 触发 resize-end 事件', {
      nodeId: props.id,
      nodeType: 'textLabel'
    })
    const endEvent = new CustomEvent('resize-end', {
      bubbles: true,
      composed: true,
      detail: { 
        nodeId: props.id,
        nodeType: 'textLabel'
      }
    })
    window.dispatchEvent(endEvent)
    
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

// 处理双击事件，进入编辑模式
const handleDoubleClick = () => {
  if (isEditing.value) return
  
  isEditing.value = true
  editLabel.value = props.data.label || ''
  
  // 更新节点数据，标记为编辑状态
  updateNode(props.id, { 
    data: { 
      ...props.data, 
      isEditing: true
    } 
  })
  
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
  
  // 清除所有文本选择
  window.getSelection()?.removeAllRanges()
  
  // 获取当前节点尺寸
  const currentWidth = nodeRef.value?.offsetWidth || 100
  const currentHeight = nodeRef.value?.offsetHeight || 30
  
  // 获取当前节点的样式，确保样式对象存在
  const currentStyle = props.data?.style || {}
  
  // 更新节点数据
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
  
  isEditing.value = false
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
  box-sizing: border-box;
}

/* 节点内容样式 */
.node-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 根据对齐方式设置内容对齐 */
.text-label-node.align-left .node-content {
  justify-content: flex-start;
  text-align: left;
}

.text-label-node.align-center .node-content {
  justify-content: center;
  text-align: center;
}

.text-label-node.align-right .node-content {
  justify-content: flex-end;
  text-align: right;
}

/* 确保加粗、倾斜和下划线样式正确显示 */
.text-label-node .node-content span {
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
}

.text-label-node.align-left .edit-container {
  justify-content: flex-start;
}

.text-label-node.align-center .edit-container {
  justify-content: center;
}

.text-label-node.align-right .edit-container {
  justify-content: flex-end;
}

/* 编辑输入框样式 */
.edit-input {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  background: transparent !important;
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

.text-label-node.align-left .edit-input {
  text-align: left !important;
}

.text-label-node.align-center .edit-input {
  text-align: center !important;
}

.text-label-node.align-right .edit-input {
  text-align: right !important;
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