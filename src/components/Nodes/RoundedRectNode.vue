<template>
  <div 
    class="rounded-rect-node" 
    :class="{ selected }"
    ref="nodeRef"
    @mouseenter="showHandles = true" 
    @mouseleave="showHandles = false"
  >
    <Handle
      v-for="position in positions"
      :key="position"
      :type="handleType(position)"
      :position="position"
      :style="[handleStyle, { opacity: showHandles ? 1 : 0 }]"
      :id="`${position}-handle`"
    />
    <div class="node-content">
      {{ data.label }}
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
import { ref, computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
const { updateNode } = useVueFlow()

const nodeRef = ref<HTMLElement | null>(null)
const showHandles = ref(false)
const selected = computed(() => props.selected)

const positions = [Position.Top, Position.Right, Position.Bottom, Position.Left]

const nodeStyle = computed(() => ({
  width: props.style?.width || '150px',
  height: props.style?.height || '40px'
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
  
  const startX = event.clientX
  const startY = event.clientY
  const nodeElement = nodeRef.value
  const startWidth = nodeElement.offsetWidth
  const startHeight = nodeElement.offsetHeight
  
  const onMouseMove = (e: MouseEvent) => {
    e.preventDefault()
    
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    
    let newWidth = startWidth
    let newHeight = startHeight
    
    switch (type) {
      case 'right':
        newWidth = Math.max(150, startWidth + dx)
        break
      case 'left':
        newWidth = Math.max(150, startWidth - dx)
        break
      case 'bottom':
        newHeight = Math.max(40, startHeight + dy)
        break
      case 'top':
        newHeight = Math.max(40, startHeight - dy)
        break
    }
    
    // 直接设置节点的样式
    nodeElement.style.width = `${newWidth}px`
    nodeElement.style.height = `${newHeight}px`
  }
  
  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'default'
  }
  
  document.body.style.cursor = type === 'left' || type === 'right' ? 'ew-resize' : 'ns-resize'
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
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
  min-width: 150px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: inherit;
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
</style> 