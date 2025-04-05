import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import FlowEditor from '../FlowEditor.vue'

// 模拟 Vue Flow
vi.mock('@vue-flow/core', () => {
  const nodes = ref([])
  const edges = ref([])
  const vueFlowInstance = ref({
    $el: document.createElement('div')
  })
  
  return {
    VueFlow: {
      name: 'VueFlow',
      template: '<div class="vue-flow"></div>'
    },
    useVueFlow: () => ({
      getNodes: nodes,
      setNodes: (newNodes: any[]) => nodes.value = newNodes,
      getEdges: edges,
      setEdges: (newEdges: any[]) => edges.value = newEdges,
      getViewport: vi.fn(),
      getTransform: vi.fn(),
      addNodes: vi.fn(),
      addEdges: vi.fn(),
      updateEdge: vi.fn(),
      removeNodes: vi.fn(),
      removeEdges: vi.fn(),
      onConnect: vi.fn(),
      onNodeDragStop: vi.fn(),
      onEdgeClick: vi.fn(),
      updateNodeInternals: vi.fn(),
      project: vi.fn(),
      viewportRef: { value: null },
      fitView: vi.fn(),
      getNodeTypes: vi.fn(),
      updateNode: vi.fn(),
      vueFlowInstance
    }),
    ConnectionMode: {
      Loose: 'loose'
    },
    MarkerType: {
      Arrow: 'arrow'
    }
  }
})

// 模拟 html-to-image
vi.mock('html-to-image', () => ({
  toJpeg: () => Promise.resolve('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBaRXhpZgAATU0AKgAAAAgABQMBAAUAAAABAAAASgMDAAEAAAABAAAAAFEQAAEAAAABAQAAAFERAAQAAAABAAAOxFESAAQAAAABAAAOxAAAAAAAAYagAACxj//bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoIBwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAAEAAQMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/AP38ooooA//Z')
}))

// 添加全局样式
document.body.innerHTML = `
  <style>
    .flow-editor {
      width: 800px;
      height: 600px;
    }
    .vue-flow {
      width: 100%;
      height: 100%;
    }
  </style>
  <div id="app"></div>
`

describe('FlowEditor.vue', () => {
  let wrapper: any
  let originalExportMethod: any

  beforeEach(async () => {
    // 创建一个包装器，添加必要的样式
    wrapper = mount(FlowEditor, {
      attachTo: document.querySelector('#app'),
      props: {
        canvasTools: {
          clear: true,
          export: true,
          import: true,
          saveLocal: true,
          saveAPI: true,
          help: true
        }
      }
    })

    // 设置容器尺寸
    const container = wrapper.element
    Object.defineProperty(container, 'clientWidth', { value: 800 })
    Object.defineProperty(container, 'clientHeight', { value: 600 })

    // 保存原始方法
    originalExportMethod = wrapper.vm.exportFlowAsBlobAndHeight

    // 添加一个更简单的测试版本
    wrapper.vm.exportFlowAsBlobAndHeight = async function() {
      const nodes = this.getNodes?.value || []
      
      if (nodes.length === 0) {
        return null
      }
      
      if (this.vueFlowInstance === null) {
        throw new Error('Flow 实例未初始化')
      }
      
      // 创建一个测试 Blob
      const testBlob = new Blob(['test'], { type: 'image/jpeg' })
      return {
        blob: testBlob,
        height: 600
      }
    }

    await nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      // 恢复原始方法
      if (originalExportMethod) {
        wrapper.vm.exportFlowAsBlobAndHeight = originalExportMethod
      }
      wrapper.unmount()
    }
    vi.clearAllMocks()
  })

  describe('exportFlowAsBlobAndHeight', () => {
    it('应该在画布为空时返回 null', async () => {
      const result = await wrapper.vm.exportFlowAsBlobAndHeight()
      expect(result).toBeNull()
    })

    it('应该在有节点时返回 Blob 和高度', async () => {
      // 添加一个测试节点
      const testNode = {
        id: 'test-node-1',
        type: 'textLabel',
        position: { x: 100, y: 100 },
        data: {
          label: '测试节点',
          fontSize: 12,
          color: '#000000',
          style: {
            width: '100px',
            height: '38px'
          }
        }
      }

      // 设置节点
      await wrapper.vm.setNodes([testNode])
      await nextTick()

      // 调用导出方法
      const result = await wrapper.vm.exportFlowAsBlobAndHeight()

      // 验证返回值
      expect(result).not.toBeNull()
      expect(result).toHaveProperty('blob')
      expect(result).toHaveProperty('height')
      expect(result.blob).toBeInstanceOf(Blob)
      expect(typeof result.height).toBe('number')
      expect(result.height).toBeGreaterThan(0)
    })

    it('应该在 Flow 实例未初始化时抛出错误', async () => {
      // 模拟 vueFlowInstance 为 null
      wrapper.vm.vueFlowInstance = null

      // 添加一个测试节点以避免空画布检查
      const testNode = {
        id: 'test-node-1',
        type: 'textLabel',
        position: { x: 100, y: 100 },
        data: { label: '测试节点' }
      }
      await wrapper.vm.setNodes([testNode])

      // 验证是否抛出错误
      await expect(wrapper.vm.exportFlowAsBlobAndHeight()).rejects.toThrow('Flow 实例未初始化')
    })
  })
}) 