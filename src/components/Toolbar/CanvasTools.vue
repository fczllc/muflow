<template>
  <div class="canvas-tools">
    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="clearCanvas" @mouseleave="hideTooltip" title="清除画布">
        <ToolbarIcon type="clear" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'clear'">清除画布</div>
    </div>

    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="exportImage" @mouseleave="hideTooltip" title="导出图片">
        <ToolbarIcon type="export" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'export'">导出图片</div>
    </div>

    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="importJSON" @mouseleave="hideTooltip" title="导入画布">
        <ToolbarIcon type="import" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'import'">导入画布</div>
      <input
        type="file"
        ref="fileInput"
        accept=".json"
        style="display: none"
        @change="handleFileImport"
      >
    </div>

    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="saveJSON" @mouseleave="hideTooltip" title="保存画布">
        <ToolbarIcon type="save" />
      </button>
    </div>

    <!-- 添加确认模态框 -->
    <ConfirmModal
      :show="showClearConfirm"
      title="清除画布"
      message="确认要清除画布吗？此操作不可恢复。"
      @confirm="handleClearConfirm"
      @cancel="handleClearCancel"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CanvasTools'
})
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'
import ConfirmModal from '../Modal/ConfirmModal.vue'
import html2canvas from 'html2canvas'

const { getNodes, getEdges, setNodes, setEdges } = useVueFlow()

// 提示框状态
const activeTooltip = ref<'clear' | 'export' | 'save' | 'import' | null>(null)

// 隐藏提示框
const hideTooltip = () => {
  activeTooltip.value = null
}

// 画布操作方法
const showClearConfirm = ref(false)

const clearCanvas = () => {
  showClearConfirm.value = true
}

const handleClearConfirm = () => {
  setNodes([])
  setEdges([])
  showClearConfirm.value = false
}

const handleClearCancel = () => {
  showClearConfirm.value = false
}

// 导出图片方法
const exportImage = async () => {
  try {
    const flowContainer = document.querySelector('.vue-flow') as HTMLElement
    if (!flowContainer) {
      throw new Error('找不到画布元素')
    }

    const options = {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      ignoreElements: (element: Element) => {
        return element.classList.contains('vue-flow__minimap') ||
               element.classList.contains('vue-flow__controls') ||
               (element as HTMLElement).style.display === 'none'
      }
    }

    const canvas = await html2canvas(flowContainer, options)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    
    const link = document.createElement('a')
    link.download = `flowchart_${getTimestamp()}.jpg`
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

  } catch (error) {
    console.error('导出图片失败:', error)
    alert('导出图片失败，请稍后重试')
  }
}

// 获取时间戳
const getTimestamp = () => {
  const now = new Date()
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`
}

// 导入导出 JSON 相关方法
const fileInput = ref<HTMLInputElement | null>(null)

const importJSON = () => {
  fileInput.value?.click()
}

const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      setNodes(data.nodes || [])
      setEdges(data.edges || [])
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
}

const saveJSON = () => {
  const flowData = {
    nodes: getNodes.value,
    edges: getEdges.value,
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      title: `流程图_${getTimestamp()}`
    }
  }
  
  const jsonStr = JSON.stringify(flowData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `flowchart_${getTimestamp()}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.canvas-tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
  align-items: center;
}

.tool-btn-wrapper {
  position: relative;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0px;
  border-radius: 3px;
  background: transparent;
  cursor: pointer;
}

.icon-btn:hover:not(:disabled) {
  background: var(--hover-color);
}

.tooltip {
  position: absolute;
  left: 40px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}
</style> 