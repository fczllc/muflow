<template>
  <div class="line-style-toolbar">
    <div class="toolbar-section">
      <div class="toolbar-title">线条粗细</div>
      <select v-model="lineWidth" @change="applyLineStyle">
        <option value="1">1px</option>
        <option value="2">2px</option>
        <option value="3">3px</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">线条颜色</div>
      <input type="color" v-model="lineColor" @change="applyLineStyle">
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">线条类型</div>
      <select v-model="lineType" @change="applyLineStyle">
        <option value="solid">实线</option>
        <option value="dashed">虚线</option>
        <option value="dotted">点线</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">箭头样式</div>
      <select v-model="arrowStyle" @change="applyLineStyle">
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

const { getEdges, setEdges } = useVueFlow()

// 添加响应式变量
const lineWidth = ref('2')
const lineColor = ref('#000000')
const lineType = ref('solid')
const arrowStyle = ref('none')

// 添加方法
const applyLineStyle = () => {
  setEdges(
    getEdges.value.map(edge => {
      if (edge.selected) {
        return {
          ...edge,
          style: {
            strokeWidth: parseInt(lineWidth.value),
            stroke: lineColor.value,
            strokeDasharray: lineType.value === 'dashed' ? '5 5' : 
                           lineType.value === 'dotted' ? '2 2' : undefined
          },
          // 使用 MarkerType 设置箭头
          markerStart: arrowStyle.value === 'source' || arrowStyle.value === 'both' 
            ? MarkerType.Arrow 
            : undefined,
          markerEnd: arrowStyle.value === 'target' || arrowStyle.value === 'both' 
            ? MarkerType.Arrow 
            : undefined
        }
      }
      return edge
    })
  )
}
</script> 