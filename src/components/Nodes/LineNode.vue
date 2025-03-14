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
    class="line-node vue-flow__node-line"
    :class="{ selected }"
    ref="nodeRef"
    :style="{
      width: width + 'px'
    }"
  >
    <!-- 左侧调整点 -->
    <div 
      v-show="selected"
      class="resize-handle left"
      @mousedown="startResize('left', $event)"
    ></div>

    <!-- 线条容器 -->
    <div 
      class="line-container"
      :style="{
        width: width + 'px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 center'
      }"
    >
      <!-- 左箭头 -->
      <div 
        v-if="showLeftArrow" 
        class="arrow left-arrow"
        :style="arrowStyle"
      ></div>

      <!-- 线条 -->
      <div 
        class="line"
        :style="lineStyle"
      ></div>

      <!-- 右箭头 -->
      <div 
        v-if="showRightArrow" 
        class="arrow right-arrow"
        :style="arrowStyle"
      ></div>
    </div>

    <!-- 右侧调整点 -->
    <div 
      v-show="selected"
      class="resize-handle right"
      :style="{
        position: 'absolute',
        left: `${width * Math.cos(angle * (Math.PI / 180))}px`,
        top: `${width * Math.sin(angle * (Math.PI / 180))}px`,
        transform: 'translate(-50%, -50%)'
      }"
      @mousedown="startResize('right', $event)"
    ></div>

    <!-- 角度值显示器 -->
    <div 
      v-if="isResizing"
      class="angle-value"
    >
      {{ Math.round(angle) }}°
    </div>

    <!-- 角度对齐指示器 -->
    <div 
      v-if="showAngleIndicator"
      class="angle-indicator"
      :style="{
        transform: `rotate(${snapAngle}deg)`,
        opacity: isShiftPressed ? 0.5 : 0
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { NodeProps } from '@vue-flow/core'
import { useVueFlow } from '@vue-flow/core'
import type { CSSProperties } from 'vue'

const props = defineProps<NodeProps>()
const nodeRef = ref<HTMLDivElement | null>(null)
const selected = computed(() => props.selected)

// 获取Vue Flow实例
const { updateNodeInternals, getNodes, setNodes } = useVueFlow()

// 线条状态
const width = ref(120)
const angle = ref(0)
const minWidth = 40 // 最小宽度
let isResizing = false
let resizeDirection: 'left' | 'right' | null = null
let startMousePos = { x: 0, y: 0 }
let nodeStartPos = { x: 0, y: 0 }

// 添加新的状态变量
const isShiftPressed = ref(false)
const showAngleIndicator = ref(false)
const snapAngle = ref(0)

// 计算箭头显示
const showLeftArrow = computed(() => {
  return props.data?.arrowStyle === 'source' || props.data?.arrowStyle === 'both'
})

const showRightArrow = computed(() => {
  return props.data?.arrowStyle === 'target' || props.data?.arrowStyle === 'both'
})

// 计算线条样式
const lineStyle = computed<CSSProperties>(() => {
  const style = props.data?.style || {}
  const strokeWidth = style.strokeWidth || 1
  const color = selected.value ? '#409eff' : (style.stroke || '#000')
  
  const baseStyle: CSSProperties = {
    width: '100%',
    height: '1px',
    backgroundColor: color,
    position: 'absolute',
    top: '50%',
    left: '0',
    transform: `translateY(-50%) scaleY(${strokeWidth})`,
    transformOrigin: 'center'
  }

  // 如果是虚线或点线，使用特殊处理
  if (style.strokeDasharray) {
    return {
      ...baseStyle,
      backgroundColor: 'transparent',
      height: `${strokeWidth}px`,
      transform: 'translateY(-50%)',
      borderStyle: style.strokeDasharray === '5 5' ? 'dashed' : 'dotted',
      borderWidth: `${strokeWidth}px`,
      borderColor: color
    }
  }

  return baseStyle
})

// 计算箭头样式
const arrowStyle = computed<CSSProperties>(() => {
  const style = props.data?.style || {}
  const color = selected.value ? '#409eff' : (style.stroke || '#000')
  const size = Math.max(6, Math.min(10, (style.strokeWidth || 1) * 2))

  return {
    borderWidth: `${size}px`,
    borderColor: `transparent transparent transparent ${color}`
  }
})

// 角度对齐计算函数
const calculateSnapAngle = (rawAngle: number): number => {
  if (!isShiftPressed.value) return rawAngle
  
  // 将角度归一化到 0-360 度范围
  const normalizedAngle = ((rawAngle % 360) + 360) % 360
  
  // 定义对齐角度数组（0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°）
  const snapAngles = Array.from({ length: 8 }, (_, i) => i * 45)
  
  // 找到最接近的对齐角度
  const closestAngle = snapAngles.reduce((prev, curr) => {
    const prevDiff = Math.abs(normalizedAngle - prev)
    const currDiff = Math.abs(normalizedAngle - curr)
    return currDiff < prevDiff ? curr : prev
  })
  
  // 如果在阈值范围内（10度），返回对齐角度
  const threshold = 10
  return Math.abs(normalizedAngle - closestAngle) <= threshold ? closestAngle : rawAngle
}

// 开始调整大小
const startResize = (direction: 'left' | 'right', event: MouseEvent) => {
  event.stopPropagation()
  event.preventDefault()
  
  isResizing = true
  resizeDirection = direction
  
  // 记录开始时的鼠标位置和节点位置
  startMousePos = { x: event.clientX, y: event.clientY }
  
  const currentNode = getNodes.value.find(n => n.id === props.id)
  if (!currentNode?.position) return
  
  nodeStartPos = { ...currentNode.position }
  
  // 添加 shift 键监听
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      isShiftPressed.value = true
      showAngleIndicator.value = true
    }
  }
  
  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift') {
      isShiftPressed.value = false
      showAngleIndicator.value = false
    }
  }
  
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('keyup', handleKeyUp)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', () => {
    handleMouseUp()
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('keyup', handleKeyUp)
  })
}

// 处理鼠标移动
const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing) return
  
  // 获取当前节点
  const currentNode = getNodes.value.find(n => n.id === props.id)
  if (!currentNode) return
  
  // 获取画布元素和其位置
  const vueFlowWrapper = document.querySelector('.vue-flow__transformationpane')
  if (!vueFlowWrapper) return
  const wrapperRect = vueFlowWrapper.getBoundingClientRect()
  
  // 计算鼠标在画布中的相对位置
  const mouseX = event.clientX - wrapperRect.left
  const mouseY = event.clientY - wrapperRect.top
  
  // 计算当前右侧点的位置
  const currentRightPoint = {
    x: currentNode.position.x + width.value * Math.cos(angle.value * (Math.PI / 180)),
    y: currentNode.position.y + width.value * Math.sin(angle.value * (Math.PI / 180))
  }
  
  // 根据拖动方向处理
  if (resizeDirection === 'right') {
    // 右侧调整点：以左侧为固定点计算
    const dx = mouseX - currentNode.position.x
    const dy = mouseY - currentNode.position.y
    const newWidth = Math.max(minWidth, Math.sqrt(dx * dx + dy * dy))
    let newAngle = Math.atan2(dy, dx) * (180 / Math.PI)
    
    // 应用角度对齐
    if (isShiftPressed.value) {
      newAngle = calculateSnapAngle(newAngle)
      snapAngle.value = newAngle
    }
    
    // 更新宽度和角度
    width.value = newWidth
    angle.value = newAngle
  } else {
    // 左侧调整点：以右侧为固定点计算
    const dx = mouseX - currentRightPoint.x
    const dy = mouseY - currentRightPoint.y
    const newWidth = Math.max(minWidth, Math.sqrt(dx * dx + dy * dy))
    let newAngle = (Math.atan2(dy, dx) * (180 / Math.PI)) + 180
    
    // 应用角度对齐
    if (isShiftPressed.value) {
      newAngle = calculateSnapAngle(newAngle)
      snapAngle.value = newAngle
    }
    
    // 计算新的节点位置，使右侧点保持固定
    const newPosition = {
      x: currentRightPoint.x - newWidth * Math.cos(newAngle * (Math.PI / 180)),
      y: currentRightPoint.y - newWidth * Math.sin(newAngle * (Math.PI / 180))
    }
    
    // 更新节点位置
    const nodes = getNodes.value.map(node => 
      node.id === props.id 
        ? { ...node, position: newPosition }
        : node
    )
    setNodes(nodes)
    
    // 更新宽度和角度
    width.value = newWidth
    angle.value = newAngle
  }
  
  // 更新节点数据
  props.data.width = width.value
  props.data.angle = angle.value
  
  // 更新节点内部状态
  updateNodeInternals([props.id])
}

// 处理鼠标释放
const handleMouseUp = () => {
  isResizing = false
  resizeDirection = null
  isShiftPressed.value = false
  showAngleIndicator.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 组件卸载时清理事件监听
onUnmounted(() => {
  if (isResizing) {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
})

// 组件挂载时初始化状态
onMounted(() => {
  // 设置默认宽度
  width.value = props.data?.width || 120
  angle.value = props.data?.angle || 0
  
  // 确保节点数据中有宽度和角度
  if (!props.data.width) {
    props.data.width = width.value
  }
  if (props.data.angle === undefined) {
    props.data.angle = angle.value
  }
  
  // 更新节点内部状态
  updateNodeInternals([props.id])
})
</script>

<style>
/* 直接覆盖Vue Flow对line类型节点的样式 */
.vue-flow__node-line {
  border: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border-radius: 0 !important;
  min-height: 0 !important;
  min-width: 0 !important;
  box-shadow: none !important;
}
</style>

<style scoped>
.line-node {
  position: relative !important;
  height: 1px !important;
  cursor: pointer !important;
  background: transparent !important;
  border: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.line-node.selected {
  outline: none !important;
  border: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}

.line-container {
  position: absolute !important;
  height: 1px !important;
  top: 0 !important;
  left: 0 !important;
  transform-origin: 0 center;
}

.line {
  position: absolute !important;
  width: 100% !important;
  height: 100% !important;
  pointer-events: all !important;
  z-index: 1 !important;
}

/* 箭头样式 */
.arrow {
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  border-style: solid;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 2;
}

.left-arrow {
  left: -10px;
  transform: translateY(-50%) rotate(180deg);
}

.right-arrow {
  right: -10px;
}

/* 调整点样式 */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: #fff;
  border: 2px solid #409eff;
  border-radius: 50%;
  cursor: move;
  z-index: 10;
}

.resize-handle:hover {
  background-color: #e6f3ff;
  transform: scale(1.2);
}

.resize-handle.left {
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%);
}

.resize-handle.right {
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
}

/* 增加可交互区域 */
.line-node::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  cursor: pointer;
  z-index: 0;
}

/* 角度对齐指示器样式 */
.angle-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #409eff;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

/* 角度值显示器样式 */
.angle-value {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  color: #666;
  font-size: 12px;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  background-color: white;
  padding: 2px 4px;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LineNode'
})
</script> 