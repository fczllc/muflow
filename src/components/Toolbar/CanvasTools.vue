<template>
  <div class="canvas-tools">
    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="clearCanvas" @mouseleave="hideTooltip" title="清除画布">
        <ToolbarIcon type="clear" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'clear'">清除画布</div>
    </div>

    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="handleExportClick" @mouseleave="hideTooltip" title="导出图片">
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

    <!-- 添加帮助按钮 -->
    <div class="tool-btn-wrapper">
      <button class="icon-btn" @click="showHelp" @mouseleave="hideTooltip" title="帮助">
        <ToolbarIcon type="help" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'help'">帮助</div>
    </div>

    <!-- 添加导出提示模态框 -->
    <ConfirmModal
      :show="showExportAlert"
      title="导出提示"
      message="画布为空，无法导出图片。"
      @confirm="handleExportAlert"
      @cancel="handleExportAlert"
    />

    <!-- 清除画布确认模态框 -->
    <ConfirmModal
      :show="showClearConfirm"
      title="清除画布"
      message="确认要清除画布吗？此操作不可恢复。"
      @confirm="handleClearConfirm"
      @cancel="handleClearCancel"
    />

    <!-- 帮助模态框 -->
    <div v-if="showHelpModal" class="modal-overlay" @click="hideHelp">
      <div class="help-modal" @click.stop>
        <div class="help-modal-header">
          <h3>快捷键说明</h3>
          <button class="close-btn" @click="hideHelp">&times;</button>
        </div>
        <div class="help-modal-content">
          <div class="shortcut-list">
            <div class="shortcut-item">
              <div class="shortcut-key">Ctrl + 点击</div>
              <div class="shortcut-desc">多选对象</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">Del</div>
              <div class="shortcut-desc">删除选中的对象</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">双击</div>
              <div class="shortcut-desc">编辑节点文本</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">鼠标拖拽</div>
              <div class="shortcut-desc">移动节点位置</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">鼠标滚轮</div>
              <div class="shortcut-desc">缩放画布</div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
import { useVueFlow, Panel } from '@vue-flow/core'
import type { VueFlowStore } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'
import ConfirmModal from '../Modal/ConfirmModal.vue'
import html2canvas from 'html2canvas'

const { getNodes, getEdges, setNodes, setEdges, vueFlowRef, toObject } = useVueFlow()

// 提示框状态
const activeTooltip = ref<'clear' | 'export' | 'save' | 'import' | 'help' | null>(null)

// 帮助模态框状态
const showHelpModal = ref(false)

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

// 添加导出提示状态
const showExportAlert = ref(false)

// 处理导出点击
const handleExportClick = () => {
  if (getNodes.value.length === 0 && getEdges.value.length === 0) {
    showExportAlert.value = true
    return
  }
  exportImage()
}

// 处理导出提示确认
const handleExportAlert = () => {
  showExportAlert.value = false
}

// 导出图片方法
const exportImage = async () => {
  try {
    // 获取画布元素
    const flowElement = vueFlowRef.value
    if (!flowElement) {
      throw new Error('找不到画布元素')
    }

    // 获取流程图数据和视口信息
    const flow = toObject()
    const viewport = flow.viewport

    // 获取流程图内容区域
    const viewport_element = flowElement.querySelector('.vue-flow__viewport') as HTMLElement
    if (!viewport_element) {
      throw new Error('找不到流程图内容区域')
    }

    // 计算内容的边界
    const nodes = getNodes.value
    if (nodes.length === 0) {
      throw new Error('没有可导出的节点')
    }

    // 计算所有节点的边界
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    nodes.forEach(node => {
      const x = node.position.x
      const y = node.position.y
      const width = typeof node.width === 'number' ? node.width : 100
      const height = typeof node.height === 'number' ? node.height : 40

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    })

    // 添加内边距
    const padding = 50
    const width = maxX - minX + padding * 2
    const height = maxY - minY + padding * 2

    // 创建临时容器
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '-9999px'
    tempContainer.style.width = width + 'px'
    tempContainer.style.height = height + 'px'
    tempContainer.style.background = '#ffffff'
    tempContainer.style.overflow = 'hidden'
    document.body.appendChild(tempContainer)

    // 克隆视口内容
    const clonedViewport = viewport_element.cloneNode(true) as HTMLElement
    
    // 调整克隆内容的样式
    clonedViewport.style.transform = 'none'
    clonedViewport.style.width = width + 'px'
    clonedViewport.style.height = height + 'px'
    clonedViewport.style.position = 'relative'
    clonedViewport.style.overflow = 'hidden'
    
    // 获取并调整变换面板
    const transformPane = clonedViewport.querySelector('.vue-flow__transformationpane') as HTMLElement
    if (transformPane) {
      const transform = `translate(${viewport.x + padding - minX}px, ${viewport.y + padding - minY}px) scale(${viewport.zoom})`
      transformPane.style.transform = transform
      transformPane.style.transformOrigin = '0 0'
    }

    // 处理SVG箭头标记
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
    marker.setAttribute('id', 'vue-flow__arrow')
    marker.setAttribute('class', 'vue-flow__arrowhead')
    marker.setAttribute('markerWidth', '12.5')
    marker.setAttribute('markerHeight', '12.5')
    marker.setAttribute('viewBox', '-10 -10 20 20')
    marker.setAttribute('orient', 'auto')
    marker.setAttribute('refX', '0')
    marker.setAttribute('refY', '0')
    
    const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    markerPath.setAttribute('d', 'M-5,-4 L0,0 L-5,4')
    markerPath.setAttribute('fill', 'none')
    markerPath.setAttribute('stroke', 'currentColor')
    markerPath.setAttribute('stroke-width', '2')
    markerPath.setAttribute('stroke-linecap', 'round')
    markerPath.setAttribute('stroke-linejoin', 'round')
    
    marker.appendChild(markerPath)
    defs.appendChild(marker)

    // 查找所有SVG元素并添加箭头定义
    const svgElements = clonedViewport.querySelectorAll('svg')
    svgElements.forEach(svg => {
      // 移除现有的 defs
      const existingDefs = svg.querySelector('defs')
      if (existingDefs) {
        existingDefs.remove()
      }
      
      // 创建新的 defs，不带任何样式
      const newDefs = defs.cloneNode(true) as SVGDefsElement
      if (newDefs.hasAttribute('style')) {
        newDefs.removeAttribute('style')
      }
      
      // 确保 defs 是第一个子元素
      if (svg.firstChild) {
        svg.insertBefore(newDefs, svg.firstChild)
      } else {
        svg.appendChild(newDefs)
      }
      
      // 确保所有使用箭头的路径都正确引用marker
      const paths = svg.querySelectorAll('path')
      paths.forEach(path => {
        // 检查是否有 marker-end 或 marker-start 属性
        const hasMarkerEnd = path.hasAttribute('marker-end')
        const hasMarkerStart = path.hasAttribute('marker-start')
        
        if (hasMarkerEnd) {
          path.setAttribute('marker-end', 'url(#vue-flow__arrow)')
        }
        if (hasMarkerStart) {
          path.setAttribute('marker-start', 'url(#vue-flow__arrow)')
        }
        
        // 确保路径的样式正确
        if (hasMarkerEnd || hasMarkerStart) {
          path.style.strokeWidth = '2'
          path.style.stroke = 'currentColor'
        }
      })
      
      // 移除可能影响箭头显示的样式
      svg.removeAttribute('style')
      svg.style.overflow = 'visible'
    })
    
    tempContainer.appendChild(clonedViewport)

    // 等待一小段时间让内容渲染
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      // 使用 html2canvas 捕获内容
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 1,
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      // 转换为JPG格式
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92)

      // 下载图片
      const link = document.createElement('a')
      link.download = `flowchart_${getTimestamp()}.jpg`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('转换图片失败:', error)
      throw error
    } finally {
      // 清理临时元素
      document.body.removeChild(tempContainer)
    }
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

// 显示帮助
const showHelp = () => {
  showHelpModal.value = true
}

// 隐藏帮助
const hideHelp = () => {
  showHelpModal.value = false
}
</script>

<style scoped>
.canvas-tools {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}

.tool-btn-wrapper {
  position: relative;
}

.icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--hover-color);
  color: #333;
}

.tooltip {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.75);
  color: white;
  font-size: 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.help-modal {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.help-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.help-modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #666;
}

.help-modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f8f8;
  border-radius: 6px;
}

.shortcut-key {
  font-family: monospace;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 13px;
  color: #666;
}

.shortcut-desc {
  color: #333;
  font-size: 14px;
}
</style> 