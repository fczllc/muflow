<template>
  <div 
    class="text-label-node" 
    :class="{ selected }"
    ref="nodeRef"
    :style="nodeStyle"
  >
    <div class="node-content">
      {{ data.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
const { updateNode } = useVueFlow()

const nodeRef = ref<HTMLElement | null>(null)
const selected = computed(() => props.selected)

// 计算节点样式，包括字体样式
const nodeStyle = computed(() => ({
  fontSize: `${props.data.fontSize || 14}px`,
  color: props.data.color || '#000000'
}))
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
</style> 