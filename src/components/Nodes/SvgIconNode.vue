<template>
  <div 
    class="svg-icon-node"
    :class="{ 'selected': selected }"
    @dblclick="handleDoubleClick"
    style="border: none !important; background-color: transparent !important; padding: 0 !important; box-shadow: none !important;"
  >
    <!-- SVG图标 -->
    <svg 
      class="svg-icon" 
      :width="data.width || 24" 
      :height="data.height || 24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      :stroke-width="data.strokeWidth || 2" 
      :stroke-linecap="data.strokeLinecap || 'round'" 
      :stroke-linejoin="data.strokeLinejoin || 'round'"
      :style="{ color: data.color || '#333' }"
      v-html="getIconHTML(data.iconType || '')"
    >
    </svg>

    <!-- 选择边框和调整大小的控件 -->
    <div v-if="selected" class="resize-handle top-left" @mousedown="startResize('topLeft', $event)"></div>
    <div v-if="selected" class="resize-handle top-right" @mousedown="startResize('topRight', $event)"></div>
    <div v-if="selected" class="resize-handle bottom-left" @mousedown="startResize('bottomLeft', $event)"></div>
    <div v-if="selected" class="resize-handle bottom-right" @mousedown="startResize('bottomRight', $event)"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

// 添加默认导出
export default defineComponent({
  name: 'SvgIconNode',
  props: {
    id: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    connectable: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'svgIcon'
    }
  }
})
</script>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import feather from 'feather-icons'

// 获取Vue Flow的节点状态管理API
const { findNode, updateNode } = useVueFlow()

// 定义属性，确保符合NodeProps接口
const props = defineProps<{
  id: string
  data: {
    iconType?: string
    label?: string
    width?: number
    height?: number
    strokeWidth?: number
    strokeLinecap?: 'round' | 'butt' | 'square'
    strokeLinejoin?: 'round' | 'miter' | 'bevel'
    color?: string
    [key: string]: any
  }
  selected: boolean
}>()

// 获取图标的HTML内容
const getIconHTML = (iconType: string): string => {
  try {
    // 尝试从feather获取图标
    const icon = feather.icons[iconType]
    if (icon) {
      return icon.contents
    }
    // 如果没有找到，返回默认图标内容
    return feather.icons.circle.contents
  } catch (error) {
    // 错误处理，返回默认图标
    console.error('Failed to load icon:', error)
    return feather.icons.circle.contents
  }
}

// 处理双击事件
const handleDoubleClick = () => {
  // 可以添加双击处理逻辑，例如修改图标大小或颜色
  console.log('双击图标节点:', props.id)
}

// 处理调整大小逻辑
const resizing = ref(false)
const resizeType = ref<'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | null>(null)
const startSize = ref({ width: 0, height: 0 })
const startPos = ref({ x: 0, y: 0 })
const aspectRatio = ref(1)

// 开始调整大小
const startResize = (type: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight', event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  
  const node = findNode(props.id)
  if (!node) return
  
  // 获取初始尺寸和位置
  const width = props.data.width || 24
  const height = props.data.height || 24
  
  startSize.value = { width, height }
  startPos.value = { x: event.clientX, y: event.clientY }
  aspectRatio.value = width / height
  resizeType.value = type
  resizing.value = true
  
  // 创建自定义事件通知画布组件
  window.dispatchEvent(new CustomEvent('resize-start'))
  
  // 添加临时事件监听器
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
  
  // 设置光标
  document.body.style.cursor = 
    type === 'topLeft' || type === 'bottomRight' ? 'nwse-resize' : 'nesw-resize'
}

// 处理调整大小过程
const handleResize = (event: MouseEvent) => {
  if (!resizing.value || !resizeType.value) return
  
  const deltaX = event.clientX - startPos.value.x
  const deltaY = event.clientY - startPos.value.y
  
  // 根据拖动方向和等比例要求计算新尺寸
  let newWidth = startSize.value.width
  let newHeight = startSize.value.height
  
  switch (resizeType.value) {
    case 'bottomRight':
      // 等比例调整大小
      newWidth = Math.max(startSize.value.width + deltaX, 16)
      newHeight = Math.max(newWidth / aspectRatio.value, 16)
      break
    case 'topRight':
      // 等比例调整大小
      newWidth = Math.max(startSize.value.width + deltaX, 16)
      newHeight = Math.max(newWidth / aspectRatio.value, 16)
      break
    case 'bottomLeft':
      // 等比例调整大小
      newWidth = Math.max(startSize.value.width - deltaX, 16)
      newHeight = Math.max(newWidth / aspectRatio.value, 16)
      break
    case 'topLeft':
      // 等比例调整大小
      newWidth = Math.max(startSize.value.width - deltaX, 16)
      newHeight = Math.max(newWidth / aspectRatio.value, 16)
      break
  }
  
  // 更新节点数据
  updateNode(props.id, {
    data: {
      ...props.data,
      width: Math.round(newWidth),
      height: Math.round(newHeight)
    }
  })
}

// 结束调整大小
const stopResize = () => {
  resizing.value = false
  resizeType.value = null
  
  // 移除临时事件监听器
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  
  // 恢复默认光标
  document.body.style.cursor = 'default'
  
  // 创建自定义事件通知画布组件
  window.dispatchEvent(new CustomEvent('resize-end'))
}

// 清理
onUnmounted(() => {
  if (resizing.value) {
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }
})
</script>

<style scoped>
.svg-icon-node {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: transparent !important;
  min-width: 16px;
  min-height: 16px;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  outline: none !important;
}

/* 添加这个选择器，确保Vue Flow节点的样式被覆盖 */
:deep(.vue-flow__node) {
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  box-shadow: none !important;
  outline: none !important;
}

.svg-icon {
  transition: all 0.2s;
}

.svg-icon:hover {
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.2));
}

.resize-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border: 1px solid #1a73e8;
  border-radius: 50%;
  z-index: 10;
}

.top-left {
  top: -4px;
  left: -4px;
  cursor: nwse-resize;
}

.top-right {
  top: -4px;
  right: -4px;
  cursor: nesw-resize;
}

.bottom-left {
  bottom: -4px;
  left: -4px;
  cursor: nesw-resize;
}

.bottom-right {
  bottom: -4px;
  right: -4px;
  cursor: nwse-resize;
}

.selected {
  outline: none !important;
}
</style> 