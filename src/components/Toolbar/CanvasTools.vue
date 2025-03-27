<template>
  <div class="canvas-tools">
    <div v-if="buttons.clear" class="tool-btn-wrapper">
      <button class="icon-btn" @click="clearCanvas" @mouseleave="hideTooltip" title="清除画布">
        <ToolbarIcon type="clear" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'clear'">清除画布</div>
    </div>

    <div v-if="buttons.export" class="tool-btn-wrapper">
      <button class="icon-btn" @click="handleExportClick" @mouseleave="hideTooltip" title="导出图片">
        <ToolbarIcon type="export" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'export'">导出图片</div>
    </div>

    <div v-if="buttons.import" class="tool-btn-wrapper">
      <button class="icon-btn" @click="importJSON" @mouseleave="hideTooltip" title="导入Json文件">
        <ToolbarIcon type="import" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'import'">导入Json文件</div>
      <input
        type="file"
        ref="fileInput"
        accept=".json"
        style="display: none"
        @change="handleFileImport"
      >
    </div>

    <div v-if="buttons.mermaid" class="tool-btn-wrapper">
      <button class="icon-btn" @click="importMermaid" @mouseleave="hideTooltip" title="导入Mermaid">
        <ToolbarIcon type="mermaid" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'mermaid'">导入Mermaid流程图</div>
    </div>

    <div v-if="buttons.saveLocal" class="tool-btn-wrapper">
      <button class="icon-btn" @click="saveJSON" @mouseleave="hideTooltip" title="保存为Json文件">
        <ToolbarIcon type="save" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'save'">保存为Json文件</div>
    </div>

    <div v-if="buttons.saveAPI" class="tool-btn-wrapper">
      <button class="icon-btn" @click="handleSaveToAPI" @mouseleave="hideTooltip" title="保存">
        <ToolbarIcon type="saveToAPI" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'saveToAPI'">保存</div>
    </div>

    <div v-if="buttons.help" class="tool-btn-wrapper">
      <button class="icon-btn" @click="showHelp" @mouseleave="hideTooltip" title="查看操作">
        <ToolbarIcon type="help" />
      </button>
      <div class="tooltip" v-show="activeTooltip === 'help'">查看操作</div>
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
              <div class="shortcut-key">悬停</div>
              <div class="shortcut-desc">显示节点连线锚点，从锚点连线</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">Click</div>
              <div class="shortcut-desc">选中，显示缩放锚点，拖动改变大小</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">Ctrl + A</div>
              <div class="shortcut-desc">全选所有对象</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">ESC</div>
              <div class="shortcut-desc">取消选中/编辑状态</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">Ctrl + 点击</div>
              <div class="shortcut-desc">多选对象</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">Del/Backspace</div>
              <div class="shortcut-desc">删除选中的对象</div>
            </div>
                       <div class="shortcut-item">
              <div class="shortcut-key">Ctrl+C/Ctrl+V</div>
              <div class="shortcut-desc">复制/粘贴选中对象</div>
            </div>
            <div class="shortcut-item">
              <div class="shortcut-key">Ctrl+Z</div>
              <div class="shortcut-desc">撤销操作/最多10步</div>
            </div> 
            <div class="shortcut-item">
              <div class="shortcut-key">鼠标框选</div>
              <div class="shortcut-desc">在空白处拖动鼠标框选对象</div>
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
              <div class="shortcut-key">直线操作</div>
              <div class="shortcut-desc">shift+鼠标拖拽两端辅助角度调整</div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- API错误提示模态框 -->
    <ConfirmModal
      :show="showAPIError"
      title="API错误"
      :message="apiErrorMessage"
      @confirm="handleAPIError"
      @cancel="handleAPIError"
    />

    <!-- Mermaid导入模态框 -->
    <MermaidImportModal
      :show="showMermaidModal"
      @confirm="handleMermaidImport"
      @cancel="hideMermaid"
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
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import type { Node as VueFlowNode, Edge as VueFlowEdge } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'
import ConfirmModal from '../Modal/ConfirmModal.vue'
import MermaidImportModal from '../Modal/MermaidImportModal.vue'
import { toJpeg, toPng } from 'html-to-image'
import type { FlowNode, FlowEdge, FlowData, APIResponse } from '../../types/flow'
import { parseMermaidFlowchart } from '../../utils/mermaid/mermaidParser'

// 获取FlowEditor暴露的方法
interface FlowEditorMethods {
  getFlowData: () => any;
  exportFlowData: () => void;
  exportImage: (format?: 'jpg' | 'png') => Promise<string | null>;
  importFlowData: (file: File) => Promise<boolean>;
  saveToAPI: (apiEndpoint: string, options?: RequestInit) => Promise<boolean>;
  loadFromAPI: (apiEndpoint: string, options?: RequestInit) => Promise<boolean>;
  processNodeData: (nodes: any[]) => any[];
  processEdgeData: (edges: any[]) => any[];
  getDataUrl: (format?: 'jpg' | 'png', download?: boolean) => Promise<string | null>;
  importMermaidFlowchart: (script: string) => { success: boolean; message?: string };
}

const flowEditor = inject<FlowEditorMethods | null>('flowEditor', null)

// 获取Vue Flow实例和方法
const { 
  getNodes, 
  getEdges, 
  setNodes, 
  setEdges,
  getTransform,
  toObject,
  fitView,
} = useVueFlow()

// 获取当前缩放比例
const getScale = () => getTransform().zoom || 1

// 提示框状态
const activeTooltip = ref<'clear' | 'export' | 'save' | 'import' | 'help' | 'saveToAPI' | 'mermaid' | null>(null)

// 帮助模态框状态
const showHelpModal = ref(false)

// 隐藏提示框
const hideTooltip = () => {
  activeTooltip.value = null
}

// 画布操作方法
const showClearConfirm = ref(false)

const clearCanvas = () => {
  // 检查是否有节点或边
  if (getNodes.value.length > 0 || getEdges.value.length > 0) {
  showClearConfirm.value = true
  }
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

// 定义Vue Flow实例引用
const vueFlowRef = ref<HTMLElement | null>(null)

// 获取 Vue Flow DOM 元素
onMounted(() => {
  // 使用setTimeout代替requestAnimationFrame
  setTimeout(() => {
    try {
      vueFlowRef.value = document.querySelector('.vue-flow') as HTMLElement
    } catch (err) {
      console.error('获取Vue Flow DOM元素失败')
    }
  }, 100)
  
  // 添加键盘事件监听器
  window.addEventListener('keydown', handleKeyDown)
})

// 处理导出点击
const handleExportClick = () => {
  if (getNodes.value.length === 0 && getEdges.value.length === 0) {
    showExportAlert.value = true
    return
  }
  
  // 如果有注入flowEditor，则使用其暴露的方法
  if (flowEditor) {
    if (typeof flowEditor.getDataUrl === 'function') {
      // 使用新的getDataUrl方法，自动下载
      flowEditor.getDataUrl('jpg', true);
    } else if (typeof flowEditor.exportImage === 'function') {
      // 向后兼容，尝试使用exportImage
      flowEditor.exportImage();
    } else {
      // 降级处理：使用本地方法
      exportImage();
    }
  } else {
    // 降级处理：使用本地方法
    exportImage();
  }
}

// 处理导出提示确认
const handleExportAlert = () => {
  showExportAlert.value = false
}

// 使用简化的导出图片实现，模仿官方示例
// 只有在没有注入flowEditor的情况下才会使用这个方法
const exportImage = async () => {
  try {
    if (!vueFlowRef.value) {
      alert('找不到流程图元素，无法导出')
      return
    }

    // 添加一个类来防止UI抖动
    document.body.classList.add('exporting-image')

    // 保存原始状态 - 只保存节点和边的状态，不修改画布位置
    const originalNodes = getNodes.value.map(node => ({ ...node }))
    const originalEdges = getEdges.value.map(edge => ({ ...edge }))

    // 先将节点和边都设为非选中状态 - 复制一份，避免引用原始对象
    setNodes(getNodes.value.map(node => ({ ...node, selected: false })))
    setEdges(getEdges.value.map(edge => ({ ...edge, selected: false })))

    // 获取画布内容区域
    const canvasParent = vueFlowRef.value.parentElement;
    
    try {
      // 等待DOM更新
      await new Promise<void>(resolve => setTimeout(resolve, 100))

      // 专门为导出创建的样式处理，只处理文本和视觉元素
      const edgeTextBgs = vueFlowRef.value.querySelectorAll('.vue-flow__edge-textbg, .vue-flow__edge-textwrapper rect');
      edgeTextBgs.forEach(rect => {
        if (rect instanceof SVGRectElement) {
          rect.style.fill = '#ffffff';
          rect.style.fillOpacity = '0.8';
          rect.style.stroke = 'none';
          rect.style.strokeWidth = '0';
        }
      });

      const edgeTexts = vueFlowRef.value.querySelectorAll('.vue-flow__edge-text, .vue-flow__edge-textwrapper text');
      edgeTexts.forEach(text => {
        if (text instanceof SVGTextElement) {
          text.style.fontSize = '12px';
          text.style.fontFamily = 'Arial, sans-serif';
        }
      });

      // 导出图片的配置选项
      const exportImageOptions = {
        quality: 0.95,
        backgroundColor: 'white', 
        pixelRatio: 1,
        skipAutoScale: true,
        // 包含所有相关样式
        fontEmbedCSS: document.querySelector('link[rel="stylesheet"]')?.getAttribute('href') || undefined,
        // 只保留图形相关元素,过滤掉控件
        filter: (node: HTMLElement) => {
          if (!node || !node.classList) return true;
          
          // 检查元素是否应该被过滤（基于类名）
          const shouldBeFiltered = [
            'vue-flow__controls', 
            'vue-flow__minimap', 
            'top-toolbar', 
            'node-toolbar',
            'left-sidebar'
          ].some(className => 
            node.classList.contains(className) || 
            node.closest(`.${className}`)
          );
          
          // 仅保留不应被过滤的元素
          return !shouldBeFiltered;
        }
      };

      // 使用toJpeg导出图片
      const dataUrl = await toJpeg(vueFlowRef.value, exportImageOptions).catch(error => {
        throw error;
      });

      // 下载图片
      const fileName = `flowchart_${getTimestamp()}`
      const link = document.createElement('a')
      link.download = `${fileName}.jpg`
      link.href = dataUrl
      // 创建并点击链接以触发下载而不附加到DOM
      link.click()
    } finally {
      // 恢复原始节点和边的状态
      setNodes(originalNodes)
      setEdges(originalEdges)
      
      // 移除导出类
      document.body.classList.remove('exporting-image')
    }
  } catch (error) {
    // 确保无论如何都移除导出类
    document.body.classList.remove('exporting-image')
    console.error('导出图片失败:', error)
    alert('导出图片失败：' + (error instanceof Error ? error.message : String(error)))
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

const handleFileImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    // 如果有注入flowEditor，则使用其暴露的方法
    if (flowEditor && typeof flowEditor.importFlowData === 'function') {
      await flowEditor.importFlowData(file)
    } else {
      // 降级处理：使用本地方法
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // 验证数据格式
          if (!validateFlowData(data)) {
          throw new Error('无效的流程图数据格式')
        }

          // 处理节点和边数据
          // 优先使用flowEditor中的方法，如果没有就用本地缓存的方法
          let nodes, edges;
          if (flowEditor && typeof flowEditor.processNodeData === 'function' && 
              typeof flowEditor.processEdgeData === 'function') {
            nodes = flowEditor.processNodeData(data.nodes);
            edges = flowEditor.processEdgeData(data.edges);
          } else {
            console.warn('未找到flowEditor中的处理方法，使用本地方法');
            // 这里不再定义本地方法，使用更简单的直接使用数据的方式
            nodes = data.nodes;
            edges = data.edges;
          }
          
          // 应用数据到画布
          await applyFlowData(nodes, edges)

        } catch (error) {
          showError(error, '导入失败', true)
        }
      }
      reader.readAsText(file)
    }
  } catch (error) {
    showError(error, '导入失败', true)
  } finally {
    // 清空文件输入框，允许重复选择同一文件
    const input = event.target as HTMLInputElement
    input.value = ''
  }
}

/**
 * 应用流程图数据到画布
 * @param nodes 处理后的节点数据
 * @param edges 处理后的边数据
 */
const applyFlowData = async (nodes: FlowNode[], edges: FlowEdge[]): Promise<void> => {
  // 保存原始节点位置，用于后续验证
  const originalPositions = new Map<string, {x: number, y: number}>();
  nodes.forEach(node => {
    originalPositions.set(node.id, {...node.position});
  });

  // 清空当前画布
        setNodes([])
        setEdges([])

  // 使用setTimeout确保异步操作完成，统一异步处理方式
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        // 添加新的节点和边
        setNodes(nodes)
        setEdges(edges)

        // 强制确保节点位置与原始位置保持一致
        setTimeout(() => {
          forcePreserveOriginalPositions(originalPositions);
          resolve()
        }, 100);
      } catch (err) {
        console.error('设置节点和边时出错:', err)
        resolve() // 即使出错也要resolve，避免promise挂起
      }
    }, 50)
  })
}

/**
 * 强制节点保持原始位置，防止Vue Flow内部调整
 * @param originalPositions 原始节点位置映射
 */
const forcePreserveOriginalPositions = (originalPositions: Map<string, {x: number, y: number}>) => {
  const currentNodes = getNodes.value;
  let positionsChanged = false;

  const updatedNodes = currentNodes.map(node => {
    const originalPos = originalPositions.get(node.id);
    if (originalPos) {
      // 检查位置是否有变化（考虑舍入误差）
      const xDiff = Math.abs(node.position.x - originalPos.x);
      const yDiff = Math.abs(node.position.y - originalPos.y);

      // 如果位置有变化（超过0.01像素），恢复原始位置
      if (xDiff > 0.01 || yDiff > 0.01) {
        positionsChanged = true;
        
        return {
          ...node,
          position: originalPos
        };
      }
    }
    return node;
  });

  if (positionsChanged) {
    setNodes(updatedNodes);
  }
}

/**
 * 显示错误信息
 * @param error 错误对象或消息
 * @param title 错误标题
 * @param useAlert 是否使用alert而非模态框
 */
const showError = (error: unknown, title: string = '错误', useAlert: boolean = false) => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  if (useAlert) {
    alert(`${title}：${errorMessage}`)
  } else {
    apiErrorMessage.value = errorMessage
    showAPIError.value = true
  }
  
  console.error(`${title}:`, error)
}

const saveJSON = () => {
  // 如果有注入flowEditor，则使用其暴露的方法
  if (flowEditor && typeof flowEditor.exportFlowData === 'function') {
    flowEditor.exportFlowData()
  } else {
    // 降级处理：使用本地方法
  try {
    // 获取节点和边的数据
    const nodes = getNodes.value.map((node: VueFlowNode) => {
        // 直接使用原始位置，不修改坐标
        const position = {
          x: node.position.x,
          y: node.position.y
        }

        // 提取节点的宽度和高度
        let width: number = 100; // 默认宽度
        let height: number = 38; // 默认高度
        
        // 尝试从DOM获取节点尺寸
        const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
        if (nodeElement) {
          const rect = nodeElement.getBoundingClientRect();
          width = Math.round(rect.width);
          height = Math.round(rect.height);
        } else {
          // 从样式获取宽度和高度
          if (node.data?.style?.width && typeof node.data.style.width === 'string') {
            const parsedWidth = parseInt(node.data.style.width);
            if (!isNaN(parsedWidth)) {
              width = parsedWidth;
            }
          }
          
          if (node.data?.style?.height && typeof node.data.style.height === 'string') {
            const parsedHeight = parseInt(node.data.style.height);
            if (!isNaN(parsedHeight)) {
              height = parsedHeight;
            }
        }
      }

      return {
        ...node,
        position,
          // 保存节点尺寸信息
          width,
          height,
        data: {
          ...node.data,
          label: node.data?.label || '',
          fontSize: node.data?.fontSize || 14,
          color: node.data?.color || '#000000',
            style: {
              ...(node.data?.style || {}),
              width: `${width}px`,
              height: `${height}px`
            }
        },
        selected: false // 重置选中状态
      }
    })

      // 完整保存边的所有属性，特别是锚点信息
    const edges = getEdges.value.map((edge: VueFlowEdge) => ({
        ...edge,  // 保留所有原始属性
      id: edge.id,
      source: edge.source,
      target: edge.target,
        sourceHandle: edge.sourceHandle,  // 明确保存源锚点
        targetHandle: edge.targetHandle,  // 明确保存目标锚点
        type: edge.type,  // 保留原始边类型，不设置默认值
      style: {
        ...(typeof edge.style === 'object' ? edge.style : {}),
        strokeWidth: typeof edge.style === 'object' ? edge.style.strokeWidth || 1 : 1,
        stroke: typeof edge.style === 'object' ? edge.style.stroke || '#555555' : '#555555'
      },
      markerEnd: edge.markerEnd,
      markerStart: edge.markerStart,
        data: edge.data,
      selected: false
    }))

      // 导出流程图数据
      const getFlowData = () => {
        return {
      nodes,
      edges,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        title: `流程图_${getTimestamp()}`
          }
      }
    }

      const flowData = getFlowData()
    
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
  } catch (error) {
      showError(error, '保存失败', true)
    }
  }
}

// 显示帮助
const showHelp = () => {
  showHelpModal.value = true
}

// 隐藏帮助
const hideHelp = () => {
  showHelpModal.value = false
}

// 添加全选快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 检查是否按下 Ctrl+A
  if (event.ctrlKey && event.key.toLowerCase() === 'a') {
    event.preventDefault() // 阻止浏览器默认的全选行为
    
    // 获取所有节点和边
    const nodes = getNodes.value
    const edges = getEdges.value
    
    // 将所有节点和边设置为选中状态
    setNodes(nodes.map(node => ({ ...node, selected: true })))
    setEdges(edges.map(edge => ({ ...edge, selected: true })))
  }
  
  // 检查是否按下 ESC
  if (event.key === 'Escape') {
    // 获取所有节点和边
    const nodes = getNodes.value
    const edges = getEdges.value
    
    // 将所有节点和边设置为非选中状态
    setNodes(nodes.map(node => ({ ...node, selected: false })))
    setEdges(edges.map(edge => ({ ...edge, selected: false })))
  }
}

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// API相关状态
const showAPIError = ref(false)
const apiErrorMessage = ref('')

/**
 * 验证流程图数据格式
 * @param data 要验证的数据
 * @returns boolean 数据是否有效
 */
const validateFlowData = (data: FlowData): boolean => {
  try {
    // 检查基本结构
    if (!data || typeof data !== 'object') {
      throw new Error('无效的数据格式')
    }

    // 检查nodes数组
    if (!Array.isArray(data.nodes)) {
      throw new Error('nodes必须是数组')
    }

    // 检查edges数组
    if (!Array.isArray(data.edges)) {
      throw new Error('edges必须是数组')
    }

    // 验证每个节点的必要属性
    data.nodes.forEach((node: FlowNode) => {
      if (!node.id || !node.type || !node.position || 
          typeof node.position.x !== 'number' || 
          typeof node.position.y !== 'number') {
        throw new Error('节点数据格式错误')
      }
    })

    // 验证每个边的必要属性
    data.edges.forEach((edge: FlowEdge) => {
      if (!edge.id || !edge.source || !edge.target) {
        throw new Error('边数据格式错误')
      }
    })

    return true
  } catch (error) {
    apiErrorMessage.value = error instanceof Error ? error.message : '数据验证失败'
    showAPIError.value = true
    return false
  }
}

/**
 * 从API加载流程图数据
 * @param apiEndpoint API端点URL
 * @param options 可选的请求配置
 */
const loadFromAPI = async (apiEndpoint: string, options?: RequestInit): Promise<APIResponse> => {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error('API请求失败: ' + response.statusText)
    }

    const data = await response.json()

    // 验证数据格式
    if (!validateFlowData(data)) {
      return { success: false, error: '数据验证失败' }
    }

    // 处理节点和边数据
    // 优先使用flowEditor中的方法，如果没有就用更简单的直接使用数据
    let nodes, edges;
    if (flowEditor && typeof flowEditor.processNodeData === 'function' && 
        typeof flowEditor.processEdgeData === 'function') {
      nodes = flowEditor.processNodeData(data.nodes);
      edges = flowEditor.processEdgeData(data.edges);
    } else {
      console.warn('未找到flowEditor中的处理方法，使用简单处理');
      nodes = data.nodes;
      edges = data.edges;
    }
    
    // 应用数据到画布（使用统一的异步处理）
    await applyFlowData(nodes, edges)

    return { success: true, data: { nodes, edges } }
  } catch (error) {
    showError(error, '从API加载失败')
    return { success: false, error: error instanceof Error ? error.message : '从API加载失败' }
  }
}

/**
 * 保存流程图数据到API
 * @param apiEndpoint API端点URL
 * @param options 可选的请求配置
 */
const saveToAPI = async (apiEndpoint: string = 'YOUR_API_ENDPOINT') => {
  try {
    // 生成画布数据
    const flowData = {
      nodes: getNodes.value,
      edges: getEdges.value,
      metadata: {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        title: `流程图_${getTimestamp()}`
      }
    }

    // 调用 API 保存数据
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(flowData)
    })

    if (!response.ok) {
      throw new Error('保存到API失败: ' + response.statusText)
    }

    // 使用统一的成功提示
    alert('保存成功')
  } catch (error) {
    showError(error, '保存到API失败')
  }
}

// 添加用于处理保存到API点击事件的函数
const handleSaveToAPI = () => {
  // 如果有注入flowEditor，则使用其暴露的方法
  if (flowEditor && typeof flowEditor.saveToAPI === 'function') {
    flowEditor.saveToAPI('YOUR_API_ENDPOINT')
  } else {
    // 降级处理：使用本地方法
    saveToAPI();
  }
}

// 处理API错误
const handleAPIError = () => {
  showAPIError.value = false
  apiErrorMessage.value = ''
}

// Mermaid导入状态
const showMermaidModal = ref(false)

// 导入Mermaid流程图
const importMermaid = () => {
  showMermaidModal.value = true
  // 实际功能在后续阶段实现
}

// 隐藏Mermaid导入模态框
const hideMermaid = () => {
  showMermaidModal.value = false
}

// 处理Mermaid脚本导入
const handleMermaidImport = (script: string) => {
  try {
    // 如果有注入flowEditor，则使用其暴露的方法
    if (flowEditor && typeof flowEditor.importMermaidFlowchart === 'function') {
      const result = flowEditor.importMermaidFlowchart(script);
      
      if (!result.success) {
        apiErrorMessage.value = result.message || '导入失败，请检查脚本格式';
        showAPIError.value = true;
      }
    } else {
      // 如果没有注入flowEditor或者没有importMermaidFlowchart方法，则使用本地解析
      const parsedData = parseMermaidFlowchart(script);
      
      if (!parsedData.success) {
        // 如果解析失败，显示错误消息
        apiErrorMessage.value = parsedData.message || '解析失败，请检查脚本格式';
        showAPIError.value = true;
        return;
      }
      
      if (parsedData.nodes.length === 0) {
        // 如果没有解析出节点，显示错误消息
        apiErrorMessage.value = '解析结果为空，请检查脚本内容';
        showAPIError.value = true;
        return;
      }
      
      // 清空当前画布
      setNodes([]);
      setEdges([]);
      
      // 设置解析后的节点和边
      setNodes(parsedData.nodes);
      setEdges(parsedData.edges);
      
      // 不再自动调整视图，保持100%的缩放比例
      // setTimeout(() => {
      //  fitView({ padding: 0.2 });
      // }, 100);
      
      console.log('成功导入Mermaid流程图');
    }
  } catch (error) {
    console.error('导入Mermaid时出错:', error);
    apiErrorMessage.value = '导入失败，发生未知错误';
    showAPIError.value = true;
  } finally {
    // 隐藏模态框
    hideMermaid();
  }
}

// 定义按钮配置接口
interface ButtonsConfig {
  clear?: boolean
  export?: boolean
  import?: boolean
  saveLocal?: boolean
  saveAPI?: boolean
  help?: boolean
  mermaid?: boolean
}

// 定义组件属性
interface Props {
  buttons?: ButtonsConfig
}

// 设置默认值
const props = withDefaults(defineProps<Props>(), {
  buttons: () => ({
    clear: true,
    export: true,
    import: true,
    saveLocal: true,
    saveAPI: true,
    help: true,
    mermaid: true
  })
})
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
  padding-bottom: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
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

/* 添加新的样式 */
.icon-btn[title="从API导入"],
.icon-btn[title="保存到API"] {
  /* 可以添加特殊的样式来区分API相关的按钮 */
  background-color: #f0f8ff;
}

.icon-btn[title="从API导入"]:hover,
.icon-btn[title="保存到API"]:hover {
  background-color: #e6f3ff;
}
</style> 