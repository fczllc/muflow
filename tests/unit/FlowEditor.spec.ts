import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FlowEditor from '@/components/FlowEditor.vue'
import { nextTick } from 'vue'

describe('FlowEditor.vue', () => {
  let wrapper: any

  beforeEach(() => {
    // 创建一个包装器
    wrapper = mount(FlowEditor)
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