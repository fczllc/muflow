<template>
  <div class="icon-selector" :class="{ 'open': isOpen }">
    <div class="icon-selector-header">
      <h3>选择图标</h3>
      <button class="close-btn" @click="closeSelector">✕</button>
    </div>
    <div class="icon-list">
      <div 
        v-for="icon in icons" 
        :key="icon.type" 
        class="icon-item"
        @click="selectIcon(icon)"
        draggable="true"
        @dragstart="onDragStart($event, icon)"
      >
        <svg 
          class="icon-preview" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          v-html="getIconHTML(icon.type)"
        >
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IconSelector'
})
</script>

<script setup lang="ts">
import { defineEmits, defineProps, onMounted } from 'vue'
import feather from 'feather-icons'

// 定义图标数据接口
interface IconData {
  type: string
  name: string
}

// 定义组件属性
defineProps<{
  isOpen: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', iconData: IconData): void
}>()

// 关闭选择器
const closeSelector = () => {
  emit('close')
}

// 选择图标
const selectIcon = (icon: IconData) => {
  emit('select', icon)
  // 选择后自动关闭选择器
  emit('close')
}

// 拖拽开始
const onDragStart = (event: DragEvent, icon: IconData) => {
  if (event.dataTransfer) {
    // 将图标类型和拖拽类型一起存储
    const dragData = {
      nodeType: 'svgIcon',
      iconType: icon.type
    }
    
    // 使用JSON序列化数据
    event.dataTransfer.setData('application/vueflow', JSON.stringify(dragData))
    event.dataTransfer.effectAllowed = 'move'
  }
}

// 获取图标的HTML内容
const getIconHTML = (iconType: string): string => {
  try {
    // 尝试从feather获取图标
    const icon = feather.icons[iconType]
    if (icon) {
      return icon.contents
    }
    // 如果没有找到，返回默认图标内容
    return feather.icons.circle.contents
  } catch (error) {
    // 错误处理，返回默认图标
    console.error('Failed to load icon:', error)
    return feather.icons.circle.contents
  }
}

// 图标列表，使用 Feather Icons 中的图标名称
const icons: IconData[] = [
  { type: 'arrow-up', name: '上箭头' },
  { type: 'arrow-down', name: '下箭头' },
  { type: 'arrow-left', name: '左箭头' },
  { type: 'arrow-right', name: '右箭头' },
  { type: 'chevrons-up', name: '双上箭头' },
  { type: 'chevrons-down', name: '双下箭头' },
  { type: 'chevrons-left', name: '双左箭头' },
  { type: 'chevrons-right', name: '双右箭头' },
  { type: 'chevron-up', name: '上尖箭头' },
  { type: 'chevron-down', name: '下尖箭头' },
  { type: 'chevron-left', name: '左尖箭头' },
  { type: 'chevron-right', name: '右尖箭头' },
  { type: 'rotate-ccw', name: '左旋转' },
  { type: 'rotate-cw', name: '右旋转' },
  { type: 'refresh-ccw', name: '逆时针刷新' },
  { type: 'refresh-cw', name: '顺时针刷新' },
  { type: 'repeat', name: '循环' },
  { type: 'x', name: '叉号' },
  { type: 'check', name: '勾选' },
  { type: 'plus', name: '加号' },
  { type: 'minus', name: '减号' },
  { type: 'corner-right-up', name: '右上折角' },
  { type: 'corner-right-down', name: '右下折角' },
  { type: 'circle', name: '圆形' }
]
</script>

<style scoped>
.icon-selector {
  position: fixed;
  top: 50%; /* 垂直居中 */
  transform: translateY(-50%) translateX(-100%); /* 垂直居中并初始隐藏 */
  left: 40px; /* 紧靠左侧工具栏 */
  width: 220px; /* 调整宽度更接近图片 */
  height: auto; /* 自动高度 */
  max-height: 500px; /* 最大高度限制 */
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 100;
  overflow: hidden;
  visibility: hidden; /* 初始状态下完全隐藏 */
  opacity: 0; /* 初始状态下透明 */
  pointer-events: none; /* 初始状态下不接收鼠标事件 */
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease, visibility 0s 0.2s; /* 添加过渡动画 */
}

.icon-selector.open {
  transform: translateY(-50%) translateX(0); /* 垂直居中并显示 */
  visibility: visible; /* 打开状态下可见 */
  opacity: 1; /* 打开状态下完全不透明 */
  pointer-events: all; /* 打开状态下接收鼠标事件 */
  transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease, visibility 0s; /* 添加过渡动画 */
}

.icon-selector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background-color: #f5f5f5;
}

.icon-selector-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每排4个图标 */
  gap: 2px; /* 更小的间距 */
  padding: 8px;
  overflow-y: auto;
}

.icon-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  height: 40px;
  border-radius: 4px;
  cursor: grab;
  transition: background-color 0.2s;
}

.icon-item:hover {
  background-color: #f0f0f0;
}

.icon-preview {
  width: 20px;
  height: 20px;
}
</style> 