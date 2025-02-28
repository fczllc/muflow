<script setup lang="ts">
import { computed, watch, onMounted, ref } from 'vue'
import { getBezierPath, getSmoothStepPath, getStraightPath, Position, useVueFlow } from '@vue-flow/core'
import type { EdgeStyle } from '../../types/flow'

interface EdgeProps {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: Position
  targetPosition: Position
  data?: Record<string, any>
  markerEnd?: string
  markerStart?: string
  style?: EdgeStyle
  selected?: boolean
  animated?: boolean
}

const props = defineProps<EdgeProps>()

// 使用 Vue Flow 钩子，但不直接修改边的状态
const { getEdges } = useVueFlow()

// 内部选中状态，用于确保视觉效果正确显示
const isSelected = ref(false)

// 监听选中状态变化
watch(() => props.selected, (newValue) => {
  console.log(`Edge ${props.id} selected changed to: ${newValue}`)
  isSelected.value = newValue
})

// 计算路径
const path = computed(() => {
  // 根据连线类型选择不同的路径计算函数
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = props
  
  // 设置路径参数
  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  }
  
  // 默认使用平滑步进路径
  const [pathString] = getSmoothStepPath({
    ...pathParams,
    borderRadius: 8, // 设置圆角半径
  })
  
  return pathString
})

// 计算源端点标识位置
const sourceMarkerPosition = computed(() => {
  const { sourceX, sourceY } = props
  return { x: sourceX - 4, y: sourceY - 4 } // 调整位置使标识居中
})

// 计算目标端点标识位置
const targetMarkerPosition = computed(() => {
  const { targetX, targetY } = props
  return { x: targetX - 4, y: targetY - 4 } // 调整位置使标识居中
})

// 计算样式
const edgeStyle = computed(() => {
  // 基础样式
  const baseStyle = {
    ...props.style,
    // 移除 px 单位，只保留数值
    strokeWidth: typeof props.style?.strokeWidth === 'string' 
      ? props.style.strokeWidth.replace('px', '') 
      : props.style?.strokeWidth,
    stroke: props.style?.stroke?.startsWith('#') && props.style.stroke.length === 4 
      ? `#${props.style.stroke[1]}${props.style.stroke[1]}${props.style.stroke[2]}${props.style.stroke[2]}${props.style.stroke[3]}${props.style.stroke[3]}`
      : props.style?.stroke,
  }
  
  return baseStyle
})

// 组件挂载时检查选中状态
onMounted(() => {
  isSelected.value = props.selected || false
  
  // 监听连线事件并添加错误处理
  window.addEventListener('error', (e) => {
    if (e.message.includes('fn is not a function') && 
        e.filename.includes('vue-flow-core')) {
      console.warn('捕获到 Vue Flow 连线错误，但不影响功能');
      e.preventDefault();
    }
  }, true);
})
</script>

<template>
  <g 
    :class="[
      'vue-flow__edge', 
      isSelected ? 'edge-selected' : '',
      props.selected ? 'selected' : '',
      animated ? 'animated' : '',
    ]"
  >
    <!-- 交互路径 - 不再添加自定义点击事件，让 Vue Flow 处理 -->
    <path
      :d="path"
      fill="none"
      stroke-opacity="0"
      stroke-width="25"
      class="vue-flow__edge-interaction-path"
      style="cursor: pointer;"
    />
    
    <!-- 主路径 -->
    <path
      :id="id"
      :d="path"
      class="vue-flow__edge-path"
      :style="edgeStyle"
      :marker-end="markerEnd"
      :marker-start="markerStart"
    />
    
    <!-- 选中状态下显示的端点标识 -->
    <g v-if="isSelected" class="edge-markers">
      <!-- 源端点标识（空心小正方形） -->
      <rect
        :x="sourceMarkerPosition.x+1"
        :y="sourceMarkerPosition.y+1"
        width="8"
        height="8"
        class="edge-marker source-marker"
        fill="white"
        stroke="#1a192b"
        stroke-width="1"
      />
      
      <!-- 目标端点标识（空心小正方形） -->
      <rect
        :x="targetMarkerPosition.x+1"
        :y="targetMarkerPosition.y+1"
        width="8"
        height="8"
        class="edge-marker target-marker"
        fill="white"
        stroke="#1a192b"
        stroke-width="1"
      />
    </g>
  </g>
</template>

<style scoped>
/* 动画效果 */
.animated .vue-flow__edge-path {
  stroke-dasharray: 5;
  animation: dashdraw 0.5s linear infinite;
}

@keyframes dashdraw {
  from {
    stroke-dashoffset: 10;
  }
}

/* 端点标识样式 */
.source-marker, .target-marker {
  fill: white;
  stroke: #1a192b;
}

/* 确保标记在最上层 */
.edge-markers {
  pointer-events: none;
  z-index: 1000;
}

/* 确保选中状态的视觉效果明显 */
.edge-selected .vue-flow__edge-path,
.selected .vue-flow__edge-path {
  stroke-width: 2px !important;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.3));
}

/* 尝试使用 !important 确保标记点显示 */
.edge-marker {
  visibility: visible !important;
  display: block !important;
}

/* 增加交互路径的宽度，确保整个连线都有足够宽的可点击区域 */
.vue-flow__edge-interaction-path {
  cursor: pointer !important;
  pointer-events: all !important;
  stroke-opacity: 0;
  stroke-width: 25px !important; /* 增加宽度，确保更容易选中 */
}

/* 确保主路径也可以点击 */
.vue-flow__edge-path {
  pointer-events: stroke !important;
  cursor: pointer !important;
}
</style> 