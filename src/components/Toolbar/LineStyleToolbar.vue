<template>
  <div class="line-style-toolbar">
    <div class="toolbar-section">
      <div class="toolbar-title">线条粗细</div>
      <select v-model="state.lineWidth" @change="applyLineStyle">
        <option value="1">1px</option>
        <option value="2">2px</option>
        <option value="3">3px</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">线条颜色</div>
      <input type="color" v-model="state.lineColor" @change="applyLineStyle">
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">线条类型</div>
      <select v-model="state.lineType" @change="applyLineStyle">
        <option value="solid">实线</option>
        <option value="dashed">虚线</option>
        <option value="dotted">点线</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">箭头样式</div>
      <select v-model="state.arrowStyle" @change="applyLineStyle">
        <option value="none">无箭头</option>
        <option value="source">起点箭头</option>
        <option value="target">终点箭头</option>
        <option value="both">双向箭头</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVueFlow, MarkerType } from '@vue-flow/core'
import type { EdgeStyle } from '../../types/flow'

// 定义类型
type LineType = 'solid' | 'dashed' | 'dotted'
type ArrowStyle = 'none' | 'source' | 'target' | 'both'

interface LineStyleState {
  lineWidth: string
  lineColor: string
  lineType: LineType
  arrowStyle: ArrowStyle
}

const { getEdges, setEdges } = useVueFlow()

// 添加响应式变量
const state = ref<LineStyleState>({
  lineWidth: '2',
  lineColor: '#000000',
  lineType: 'solid',
  arrowStyle: 'none'
})

// 计算线条样式
const computedStyle = computed<EdgeStyle>(() => {
  const style: EdgeStyle = {
    strokeWidth: state.value.lineWidth,
    stroke: state.value.lineColor,
  }

  // 设置线条类型
  switch (state.value.lineType) {
    case 'dashed':
      style.strokeDasharray = '5,5'
      break
    case 'dotted':
      style.strokeDasharray = '2,2'
      break
    default:
      style.strokeDasharray = ''
  }

  return style
})

// 应用样式方法
const applyLineStyle = () => {
  setEdges(
    getEdges.value.map(edge => {
      if (edge.selected) {
        return {
          ...edge,
          style: computedStyle.value,
          markerStart: state.value.arrowStyle === 'source' || state.value.arrowStyle === 'both' 
            ? MarkerType.Arrow 
            : undefined,
          markerEnd: state.value.arrowStyle === 'target' || state.value.arrowStyle === 'both' 
            ? MarkerType.Arrow 
            : undefined
        }
      }
      return edge
    })
  )
}
</script> 