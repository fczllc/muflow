<template>
  <div class="top-toolbar">
    <img src="@/assets/logo.png" alt="logo" class="logo">
    
    <div class="style-tools">
      <!-- 字体样式设置组
      <div class="tool-title">字体</div> -->
      <div class="tool-group" :class="{ 'disabled': !hasSelectedTextNodes }">
        <select 
          v-model="fontSize" 
          class="font-size-select" 
          :disabled="!hasSelectedTextNodes"
          @change="applyFontStyle"
        >
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
        </select>
        <div class="color-icon-wrapper" :class="{ 'disabled': !hasSelectedTextNodes }">
          <button 
            class="color-icon-btn" 
            title="字体颜色"
            :disabled="!hasSelectedTextNodes" 
            @click="openFontColorPicker"
          >
            <ToolbarIcon type="fontColor" />
            <div class="color-indicator" :style="{ backgroundColor: fontColor }"></div>
          </button>
          <input 
            type="color" 
            v-model="fontColor" 
            ref="fontColorInput"
            class="color-picker-hidden" 
            :disabled="!hasSelectedTextNodes"
            @input="applyFontStyle"
          >
        </div>
        
        <!-- 添加文本对齐按钮组 -->
        <div class="text-align-group">
          <button 
            class="icon-btn"
            :class="{ 'active': textAlign === 'left' }"
            title="左对齐"
            :disabled="!hasSelectedTextNodes"
            @click="applyTextAlign('left')"
          >
            <ToolbarIcon type="textAlignLeft" />
          </button>
          <button 
            class="icon-btn"
            :class="{ 'active': textAlign === 'center' }"
            title="居中对齐"
            :disabled="!hasSelectedTextNodes"
            @click="applyTextAlign('center')"
          >
            <ToolbarIcon type="textAlignCenter" />
          </button>
          <button 
            class="icon-btn"
            :class="{ 'active': textAlign === 'right' }"
            title="右对齐"
            :disabled="!hasSelectedTextNodes"
            @click="applyTextAlign('right')"
          >
            <ToolbarIcon type="textAlignRight" />
          </button>
        </div>
        
        <!-- 添加文本样式按钮组 -->
        <div class="text-style-group">
          <button 
            class="icon-btn" 
            :class="{ active: isBold }"
            title="粗体"
            :disabled="!hasSelectedTextNodes"
            @click="applyTextStyle('bold')"
          >
            <ToolbarIcon type="bold" />
          </button>
          <button 
            class="icon-btn" 
            :class="{ active: isItalic }"
            title="斜体"
            :disabled="!hasSelectedTextNodes"
            @click="applyTextStyle('italic')"
          >
            <ToolbarIcon type="italic" />
          </button>
          <button 
            class="icon-btn" 
            :class="{ active: isUnderline }"
            title="下划线"
            :disabled="!hasSelectedTextNodes"
            @click="applyTextStyle('underline')"
          >
            <ToolbarIcon type="underline" />
          </button>
        </div>
      </div>

      <ToolbarIcon type="separator" />

      <!-- 连线样式设置组 -->
      <div class="tool-group" :class="{ 'disabled': !hasSelectedEdges && !hasSelectedLineNodes && !hasSelectedShapeNodes }">
        <!-- 线条粗细下拉菜单 -->
        <div class="dropdown" :class="{ 'disabled': !hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes) }">
          <button 
            class="dropdown-btn" 
          title="线条粗细"
            :disabled="!hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes)" 
            @click="toggleLineWidthDropdown"
          >
            <ToolbarIcon type="lineWidth" />
            <span class="dropdown-value">{{ lineWidth }}px</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu" v-if="showLineWidthDropdown">
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 0, 'disabled': hasSelectedEdges || hasSelectedLineNodes }"
              @click="selectLineWidth(0)"
            >0px</div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 0.5 }"
              @click="selectLineWidth(0.5)"
            >0.5px</div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 1 }"
              @click="selectLineWidth(1)"
            >1px</div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 1.5 }"
              @click="selectLineWidth(1.5)"
            >1.5px</div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 2 }"
              @click="selectLineWidth(2)"
            >2px</div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 3 }"
              @click="selectLineWidth(3)"
            >3px</div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineWidth === 4 }"
              @click="selectLineWidth(4)"
            >4px</div>
          </div>
        </div>
        <!-- 背景色设置按钮 -->
        <div class="color-icon-wrapper" :class="{ 'disabled': !hasSelectedShapeNodes }">
          <button 
            class="color-icon-btn" 
            title="背景颜色"
            :disabled="!hasSelectedShapeNodes" 
            @click="openBgColorPicker"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="bucket-icon">
<path fill="#000000" d="M9.525.626L21.9 13L12 22.9L2.1 13l8.486-8.485L8.11 2.04zM5.93 12h12.142l-6.07-6.07zm14.82 5.39l1.315 1.66c.581.733.581 1.847 0 2.58a1.68 1.68 0 0 1-1.314.657c-.53 0-1-.26-1.314-.657c-.581-.733-.581-1.847 0-2.58z"/>            </svg>
            <div class="color-indicator" :style="{ backgroundColor: bgColor }"></div>
          </button>
          <input 
            type="color" 
            v-model="bgColor" 
            ref="bgColorInput"
            class="color-picker-hidden" 
            :disabled="!hasSelectedShapeNodes"
            @input="applyBgStyle"
          >
        </div>
        
        <div class="color-icon-wrapper" :class="{ 'disabled': !hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes) }">
          <button 
            class="color-icon-btn" 
            title="线条颜色"
            :disabled="!hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes)" 
            @click="openLineColorPicker"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pen-icon">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
            <div class="color-indicator" :style="{ backgroundColor: lineColor }"></div>
          </button>
          <input 
            type="color" 
            v-model="lineColor" 
            ref="lineColorInput"
            class="color-picker-hidden" 
            :disabled="!hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes)"
            @input="applyEdgeStyle"
          >
        </div>
        <div class="dropdown" :class="{ 'disabled': !hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes) }">
          <button 
            class="dropdown-btn" 
          title="线条样式"
            :disabled="!hasSelectedEdges && !hasSelectedLineNodes && (!hasSelectedShapeNodes || hasSelectedTextLabelNodes)" 
            @click="toggleLineStyleDropdown"
          >
            <ToolbarIcon :type="getLineStyleIcon()" />
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu" v-if="showLineStyleDropdown">
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineStyle === 'solid' }"
              @click="selectLineStyle('solid')"
            >
              <ToolbarIcon type="lineStyleSolid" />
            </div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineStyle === 'dashed' }"
              @click="selectLineStyle('dashed')"
            >
              <ToolbarIcon type="lineStyleDashed" />
            </div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': lineStyle === 'dotted' }"
              @click="selectLineStyle('dotted')"
            >
              <ToolbarIcon type="lineStyleDotted" />
            </div>
          </div>
        </div>
        <div class="dropdown" :class="{ 'disabled': (!hasSelectedEdges && !hasSelectedLineNodes) || hasSelectedShapeNodes }">
          <button 
            class="dropdown-btn" 
          title="箭头样式"
            :disabled="(!hasSelectedEdges && !hasSelectedLineNodes) || hasSelectedShapeNodes" 
            @click="toggleArrowStyleDropdown"
          >
            <span class="arrow-icon">{{ getArrowStyleIcon() }}</span>
            <span class="dropdown-arrow">▼</span>
          </button>
          <div class="dropdown-menu" v-if="showArrowStyleDropdown">
            <div 
              class="dropdown-item" 
              :class="{ 'selected': arrowStyle === 'none' }"
              @click="selectArrowStyle('none')"
            >
              <span class="arrow-style-option">─</span>
              <span class="dropdown-item-text">无箭头</span>
            </div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': arrowStyle === 'source' }"
              @click="selectArrowStyle('source')"
            >
              <span class="arrow-style-option">←</span>
              <span class="dropdown-item-text">起点箭头</span>
            </div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': arrowStyle === 'target' }"
              @click="selectArrowStyle('target')"
            >
              <span class="arrow-style-option">→</span>
              <span class="dropdown-item-text">终点箭头</span>
            </div>
            <div 
              class="dropdown-item" 
              :class="{ 'selected': arrowStyle === 'both' }"
              @click="selectArrowStyle('both')"
            >
              <span class="arrow-style-option">↔</span>
              <span class="dropdown-item-text">双向箭头</span>
            </div>
          </div>
        </div>
      </div>

      <ToolbarIcon type="separator" />

      <!-- 对齐分布设置组 -->
       <div class="tool-group" :class="{ 'disabled': !hasMultipleSelectedNodes }">
        <!-- 合并对齐和分布功能下拉菜单 -->
        <div class="dropdown" :class="{ 'disabled': !hasMultipleSelectedNodes }">
        <button 
            class="dropdown-btn" 
            title="对齐与分布"
          :disabled="!hasMultipleSelectedNodes"
            @click="toggleAlignDropdown"
        >
          <ToolbarIcon type="alignLeft" />
            <span class="dropdown-arrow">▼</span>
        </button>
          <div class="dropdown-menu align-dropdown-menu" v-if="showAlignDropdown">
            <!-- 水平对齐组 -->
            <div 
              class="dropdown-item" 
              @click="handleAlignClick('left')"
              title="左对齐"
            >
              <ToolbarIcon type="alignLeft" />
              <span class="dropdown-item-text">左对齐</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleAlignClick('right')" 
          title="右对齐"
        >
          <ToolbarIcon type="alignRight" />
              <span class="dropdown-item-text">右对齐</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleAlignClick('center')" 
          title="水平居中"
        >
          <ToolbarIcon type="alignHCenter" />
              <span class="dropdown-item-text">水平居中</span>
            </div>
            
            <!-- 分隔线 -->
            <div class="dropdown-divider"></div>
            
            <!-- 垂直对齐组 -->
            <div 
              class="dropdown-item" 
              @click="handleAlignClick('top')"
              title="顶对齐"
            >
              <ToolbarIcon type="alignTop" />
              <span class="dropdown-item-text">顶对齐</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleAlignClick('middle')" 
          title="垂直居中"
        >
          <ToolbarIcon type="alignVCenter" />
              <span class="dropdown-item-text">垂直居中</span>
            </div>
            <div 
              class="dropdown-item" 
              @click="handleAlignClick('bottom')"
              title="底对齐"
            >
              <ToolbarIcon type="alignBottom" />
              <span class="dropdown-item-text">底对齐</span>
            </div>
            
            <!-- 分隔线 -->
            <div class="dropdown-divider"></div>
            
            <!-- 分布组 -->
            <div 
              class="dropdown-item" 
          @click="handleDistributeClick('horizontal')" 
          title="水平分布"
              :class="{ 'disabled': !hasThreeOrMoreSelectedNodes }"
        >
          <ToolbarIcon type="distributeH" />
              <span class="dropdown-item-text">水平分布</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleDistributeClick('vertical')" 
          title="垂直分布"
              :class="{ 'disabled': !hasThreeOrMoreSelectedNodes }"
        >
          <ToolbarIcon type="distributeV" />
              <span class="dropdown-item-text">垂直分布</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 图层排列工具组 -->
        <div class="tool-group" :class="{ 'disabled': !hasSelectedNodes }">
        <div class="dropdown" :class="{ 'disabled': !hasSelectedNodes }">
        <button 
            class="dropdown-btn" 
            title="图层"
          :disabled="!hasSelectedNodes"
            @click="toggleLayerDropdown"
        >
          <ToolbarIcon type="layerTop" />
            <span class="dropdown-arrow">▼</span>
        </button>
          <div class="dropdown-menu layer-dropdown-menu" v-if="showLayerDropdown">
            <div 
              class="dropdown-item" 
              @click="handleLayerClick('top')"
              title="置于顶层"
            >
              <ToolbarIcon type="layerTop" />
              <span class="dropdown-item-text">置于顶层</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleLayerClick('bottom')" 
          title="置于底层"
        >
          <ToolbarIcon type="layerBottom" />
              <span class="dropdown-item-text">置于底层</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleLayerClick('up')" 
          title="上移一层"
        >
          <ToolbarIcon type="layerUp" />
              <span class="dropdown-item-text">上移一层</span>
            </div>
            <div 
              class="dropdown-item" 
          @click="handleLayerClick('down')" 
          title="下移一层"
        >
          <ToolbarIcon type="layerDown" />
              <span class="dropdown-item-text">下移一层</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
  height: 40px;
  padding: 0 10px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tool-title {
font-size: 12px;
color: #666;
  min-width: 40px;     /* 设置最小宽度 */
  flex-shrink: 0;      /* 防止被压缩 */
  white-space: nowrap; /* 防止文字换行 */
  text-align: center;  /* 文字居中 */
}

.style-tools {
  display: flex;
  align-items: center;
  gap: 2px; /* 增加间距 */
  padding: 0 0 0 16px;
  margin-right: auto;
  flex-wrap: nowrap; /* 防止换行 */
  min-width: 480px; /* 设置最小宽度确保足够空间 */
}

.tool-group {
  display: flex;
  align-items: center;
  margin-right: 4px;
}

.tool-group.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.font-size-select {
  width: 60px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  font-size: 12px;
  border-radius: 3px;
}

.number-input {
  width: 35px;
  height: 24px;
  text-align: center;
  margin: 0 2px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.color-picker {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 3px;
  cursor: pointer;
}

.icon-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  margin: 0 1px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: #e5e5e5;
}

.icon-btn.active {
  background-color: #ddd;
}

.icon-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.canvas-tools {
  display: flex;
  gap: 8px;
}

.tool-btn-wrapper {
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
}

.tooltip::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.75);
}

/* 自定义箭头样式 */
.arrow-style-option {
  color: #606266;
  font-family: sans-serif;
  font-size: 16px;
  padding: 0 4px;
}

/* 自定义线条样式 */
.line-style-option {
  color: #606266;
}

/* 工具组禁用状态 */
.tool-group.disabled button,
.tool-group.disabled input,
.tool-group.disabled select {
  cursor: not-allowed;
}

.logo {
  width: 42px;
  height: 16px;
}

.color-picker-hidden {
  position: absolute;
  width: 0;
  height: 0;
  visibility: hidden;
  pointer-events: none;
}

.color-icon-wrapper {
  position: relative;
  margin: 0 2px;
}

.color-icon-wrapper.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.color-icon-btn {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2px;
}

.color-icon-btn:hover {
  background-color: #e5e5e5;
}

.color-indicator {
  width: 16px;
  height: 3px;
  margin-top: 2px;
  border-radius: 1px;
  border: 1px solid #aaa;
}

/* 添加文本对齐按钮组样式 */
.text-align-group {
  display: flex;
  flex-direction: row; /* 确保水平排列 */
  align-items: center;
  gap: 4px;
  min-width: 92px; /* 确保足够宽度放三个按钮 */
  flex-shrink: 0; /* 防止被压缩 */
}

.text-style-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  min-width: 92px; /* 确保足够宽度放三个按钮 */
  flex-shrink: 0;
}

.dropdown {
  position: relative;
  display: inline-block;
  margin: 0 2px;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  min-width: 40px !important;
  height: 24px;
  padding: 0 5px;
  background: #fff;
  border: none !important;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.dropdown-value {
  margin-left: 5px;
  font-size: 12px;
}

.dropdown-arrow {
  font-size: 8px;
  color: #666;
}

.arrow-icon {
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  min-width: 60px;
  padding: 5px 0;
  margin-top: 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 3px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  margin: 6px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
}

.dropdown-item .toolbar-icon {
  width: 20px;
  height: 20px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.selected {
  background: #e5e5e5;
  font-weight: bold;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown.disabled .dropdown-btn {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-item-text {
  margin-left: 8px;
  white-space: nowrap;
}

.align-dropdown-menu,
.distribute-dropdown-menu,
.layer-dropdown-menu {
  width: 120px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
}

.dropdown-divider {
  height: 1px;
  margin: 5px 0;
  overflow: hidden;
  background-color: #e9ecef;
}

/* 添加箭头样式图标样式 */
.arrow-icon {
  font-family: sans-serif;
  font-size: 16px;
  line-height: 1;
  padding: 0 4px;
}

.dropdown-arrow {
  font-size: 8px;
  margin-left: 2px;
  color: #666;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  min-width: 50px;
  height: 24px;
  padding: 0 5px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}
</style>

<script lang="ts">
export default {
  name: 'TopToolbar'
}
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useVueFlow, MarkerType } from '@vue-flow/core'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

// 获取 Vue Flow 实例
const { 
  getNodes,
  getEdges,
  getSelectedNodes, 
  getSelectedEdges, 
  updateNode, 
  setNodes,
  setEdges
} = useVueFlow()

// 计算属性：是否有选中的节点
const hasSelectedNodes = computed(() => getSelectedNodes.value.length > 0)

// 计算属性：是否有选中的边
const hasSelectedEdges = computed(() => getSelectedEdges.value.length > 0)

// 计算属性：是否有选中的直线节点
const hasSelectedLineNodes = computed(() => {
  return getSelectedNodes.value.some(node => node.type === 'line')
})

// 计算属性：是否有选中的文本节点
const hasSelectedTextNodes = computed(() => {
  return getSelectedNodes.value.some(node => node.type === 'textLabel' || node.type === 'roundedRect' || node.type === 'startEnd' || node.type === 'condition' || node.type === 'circle')
})

// 计算是否有两个或更多节点被选中（用于对齐功能）
const hasMultipleSelectedNodes = computed(() => {
  const selectedNodes = getNodes.value.filter(node => node.selected)
  return selectedNodes.length >= 2
})

// 计算是否有三个或更多节点被选中（用于分布功能）
const hasThreeOrMoreSelectedNodes = computed(() => {
  const selectedNodes = getNodes.value.filter(node => node.selected)
  return selectedNodes.length >= 3
})

// 检测是否选中了文本标签节点
const hasSelectedTextLabelNodes = computed(() => {
  return getSelectedNodes.value.some(node => node.type === 'textLabel')
})

// 检测是否选中了形状节点（矩形、开始/结束节点等）
const hasSelectedShapeNodes = computed(() => {
  return getSelectedNodes.value.some(node => {
    return ['textLabel', 'roundedRect', 'startEnd', 'condition', 'circle'].includes(node.type || '')
  })
})

// 字体样式
const fontSize = ref(12)
const fontColor = ref('#000000')
// 添加文本对齐状态
const textAlign = ref<'left' | 'center' | 'right'>('center')
// 添加文本样式状态
const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)

// 连线样式
const lineWidth = ref(1)
const lineColor = ref('#555555')
const lineStyle = ref('solid')
const arrowStyle = ref('target')
const bgColor = ref('#ffffff') // 添加背景色变量，默认白色

// 当前选中的节点和边的ID
const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)

// 线条粗细下拉菜单状态
const showLineWidthDropdown = ref(false)
const showLineStyleDropdown = ref(false)
const showAlignDropdown = ref(false)
const showLayerDropdown = ref(false)
const showArrowStyleDropdown = ref(false)

// 切换线条粗细下拉菜单
const toggleLineWidthDropdown = () => {
  showLineWidthDropdown.value = !showLineWidthDropdown.value
  if (showLineWidthDropdown.value) {
    showLineStyleDropdown.value = false
    showAlignDropdown.value = false
    showLayerDropdown.value = false
    showArrowStyleDropdown.value = false
  }
}

// 切换线条样式下拉菜单
const toggleLineStyleDropdown = () => {
  showLineStyleDropdown.value = !showLineStyleDropdown.value
  if (showLineStyleDropdown.value) {
    showLineWidthDropdown.value = false
    showAlignDropdown.value = false
    showLayerDropdown.value = false
    showArrowStyleDropdown.value = false
  }
}

// 切换对齐下拉菜单
const toggleAlignDropdown = () => {
  showAlignDropdown.value = !showAlignDropdown.value
  if (showAlignDropdown.value) {
    showLineWidthDropdown.value = false
    showLineStyleDropdown.value = false
    showLayerDropdown.value = false
    showArrowStyleDropdown.value = false
  }
}

// 切换图层下拉菜单
const toggleLayerDropdown = () => {
  showLayerDropdown.value = !showLayerDropdown.value
  if (showLayerDropdown.value) {
    showLineWidthDropdown.value = false
    showLineStyleDropdown.value = false
    showAlignDropdown.value = false
    showArrowStyleDropdown.value = false
  }
}

// 切换箭头样式下拉菜单
const toggleArrowStyleDropdown = () => {
  showArrowStyleDropdown.value = !showArrowStyleDropdown.value
  if (showArrowStyleDropdown.value) {
    showLineWidthDropdown.value = false
    showLineStyleDropdown.value = false
    showAlignDropdown.value = false
    showLayerDropdown.value = false
  }
}

// 根据当前线型获取对应图标
const getLineStyleIcon = () => {
  switch (lineStyle.value) {
    case 'solid':
      return 'lineStyleSolid'
    case 'dashed':
      return 'lineStyleDashed'
    case 'dotted':
      return 'lineStyleDotted'
    default:
      return 'lineStyleSolid'
  }
}

// 选择线条粗细
const selectLineWidth = (width: number) => {
  lineWidth.value = width
  showLineWidthDropdown.value = false
  applyEdgeStyle()
}

// 选择线条样式
const selectLineStyle = (style: string) => {
  lineStyle.value = style
  showLineStyleDropdown.value = false
  applyEdgeStyle()
}

// 点击其他地方关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  const dropdowns = document.querySelectorAll('.dropdown')
  let outsideClick = true
  
  dropdowns.forEach(dropdown => {
    if (dropdown.contains(event.target as Node)) {
      outsideClick = false
    }
  })
  
  if (outsideClick) {
    showLineWidthDropdown.value = false
    showLineStyleDropdown.value = false
    showAlignDropdown.value = false
    showLayerDropdown.value = false
    showArrowStyleDropdown.value = false
  }
}

// 初始化节点样式 - 独立出一个函数用来确保节点有样式属性
const initNodeStyle = (nodeId: string) => {
  const node = getNodes.value.find(n => n.id === nodeId)
  if (!node) return
  
  // 确保节点有样式对象
  if (!node.data) {
    node.data = {}
  }
  
  // 获取当前的样式对象，如果不存在则创建空对象
  const currentStyle = node.data.style || {}
  
  // 创建一个完整的样式对象，明确所有属性
  const completeStyle = {
    ...currentStyle,
    // 如果没有设置，则用默认值
    textAlign: currentStyle.textAlign || 'center',
    fontWeight: currentStyle.fontWeight || 'normal',
    fontStyle: currentStyle.fontStyle || 'normal',
    textDecoration: currentStyle.textDecoration || 'none'
  }
  
  // 只有当样式对象缺少任何一个属性时，才更新节点
  if (!currentStyle.textAlign || 
      !currentStyle.fontWeight || 
      !currentStyle.fontStyle || 
      !currentStyle.textDecoration) {
    
    updateNode(nodeId, {
      data: {
        ...node.data,
        style: completeStyle
      }
    })
  }
}

// 重置工具栏状态
const resetToolbar = () => {
  // 重置字体样式
  fontSize.value = 12
  fontColor.value = '#000000'
  textAlign.value = 'center'
  isBold.value = false
  isItalic.value = false
  isUnderline.value = false
  
  // 重置线条样式
  lineWidth.value = 1
  lineColor.value = '#555555'
  lineStyle.value = 'solid'
  arrowStyle.value = 'target'
  
  // 重置背景色
  bgColor.value = '#ffffff'
}

// 同步文本节点样式到工具栏
const syncTextNodeStyles = (nodes: any[]) => {
  // 确保所有选中的文本节点都有完整的样式对象
  nodes.forEach(node => initNodeStyle(node.id))
  
  // 重新获取节点，确保样式已更新
  const updatedNodes = getNodes.value.filter(node => 
    node.selected && (
      node.type === 'textLabel' || 
      node.type === 'roundedRect' || 
      node.type === 'startEnd' || 
      node.type === 'condition' || 
      node.type === 'circle'
    )
  )
  
  if (updatedNodes.length === 0) return
  
  // 如果只选中了一个节点，使用其ID
  if (updatedNodes.length === 1) {
    selectedNodeId.value = updatedNodes[0].id
  }
  
  selectedEdgeId.value = null
  
  // 如果所有节点字体大小相同，则使用该大小，否则保持不变
  const allSameFontSize = updatedNodes.every(node => 
    node.data?.fontSize === updatedNodes[0].data?.fontSize
  )
  
  if (allSameFontSize) {
    fontSize.value = updatedNodes[0].data?.fontSize || 12
  }
  
  // 如果所有节点字体颜色相同，则使用该颜色，否则保持不变
  const allSameColor = updatedNodes.every(node => 
    node.data?.color === updatedNodes[0].data?.color
  )
  
  if (allSameColor) {
    fontColor.value = updatedNodes[0].data?.color || '#000000'
  }
  
  // 检查对齐方式
  const allSameAlign = updatedNodes.every(node => 
    node.data?.style?.textAlign === updatedNodes[0].data?.style?.textAlign
  )
  
  if (allSameAlign) {
    textAlign.value = (updatedNodes[0].data?.style?.textAlign as 'left' | 'center' | 'right') || 'center'
  }
  
  // 检查文本样式: 加粗、倾斜、下划线
  // 对于每种样式，只有所有节点都具有该样式时才显示为激活状态
  
  // 加粗
  isBold.value = updatedNodes.every(node => 
    node.data?.style?.fontWeight === 'bold'
  )
  
  // 倾斜
  isItalic.value = updatedNodes.every(node => 
    node.data?.style?.fontStyle === 'italic'
  )
  
  // 下划线
  isUnderline.value = updatedNodes.every(node => 
    node.data?.style?.textDecoration === 'underline'
  )
}

// 处理样式对象类型问题
const getNodeBackgroundColor = (node: any): string => {
  // 首先检查节点数据中的 style 对象 (这是我们保存背景色的主要位置)
  if (node.data && node.data.style && typeof node.data.style === 'object') {
    if (node.data.style.backgroundColor) {
      return node.data.style.backgroundColor as string;
    }
  }
  
  // 然后检查节点数据中保存的背景色
  if (node.data && node.data.savedBgColor) {
    return node.data.savedBgColor as string;
  }
  
  // 最后检查节点样式对象（虽然我们通常不在这里设置，但以防万一）
  if (node.style && typeof node.style === 'object') {
    if (node.style.backgroundColor) {
      return node.style.backgroundColor as string;
    }
  }
  
  // 默认返回白色
  return '#ffffff';
}

// 在编辑器节点变更时同步工具栏状态
const onNodesChange = () => {
  const selectedNodes = getSelectedNodes.value

  // 重置样式设置
  resetToolbar()
  
  if (selectedNodes.length > 0) {
    // 选中节点时处理
    if (selectedNodes.some(n => n.type === 'textLabel' || 
                               n.type === 'roundedRect' || 
                               n.type === 'startEnd' || 
                               n.type === 'condition' || 
                               n.type === 'circle')) {
      // 处理文本节点样式
      syncTextNodeStyles(selectedNodes)
    }
    
    // 处理直线节点样式
    const lineNodes = selectedNodes.filter(node => node.type === 'line')
    if (lineNodes.length > 0) {
      if (lineNodes[0].data?.style?.strokeWidth) {
        lineWidth.value = lineNodes[0].data.style.strokeWidth
      } else {
        lineWidth.value = 1
      }
      
      if (lineNodes[0].data?.style?.stroke) {
        lineColor.value = lineNodes[0].data?.style.stroke || '#555555'
      }
      
      if (lineNodes[0].data?.style?.strokeDasharray) {
        const dashArray = lineNodes[0].data.style.strokeDasharray
        if (dashArray === '5 5') {
          lineStyle.value = 'dashed'
        } else if (dashArray === '2 2') {
          lineStyle.value = 'dotted'
        } else {
          lineStyle.value = 'solid'
        }
      } else {
        lineStyle.value = 'solid'
      }
      
      arrowStyle.value = lineNodes[0].data?.arrowStyle || 'none'
    }
    
    // 处理可设置背景色的节点样式
    const shapeNodes = selectedNodes.filter(node => 
      node.type === 'textLabel' || 
      node.type === 'roundedRect' || 
      node.type === 'startEnd' || 
      node.type === 'condition' || 
      node.type === 'circle'
    )
    
    if (shapeNodes.length > 0) {
      // 使用辅助函数获取背景色
      bgColor.value = getNodeBackgroundColor(shapeNodes[0]);
      
      // 只对非文本标签节点同步边框样式
      if (shapeNodes[0].type !== 'textLabel') {
        // 同步边框样式
        if (shapeNodes[0].data?.style?.borderWidth) {
          // 确保转换为数字
          let borderWidth = shapeNodes[0].data.style.borderWidth;
          if (typeof borderWidth === 'string') {
            borderWidth = parseFloat(borderWidth.replace(/[^\d.-]/g, '')) || 1;
          }
          lineWidth.value = borderWidth;
        } else if (shapeNodes[0].data?.savedBorderWidth) {
          // 确保转换为数字
          let savedBorderWidth = shapeNodes[0].data.savedBorderWidth;
          if (typeof savedBorderWidth === 'string') {
            savedBorderWidth = parseFloat(savedBorderWidth.replace(/[^\d.-]/g, '')) || 1;
          }
          lineWidth.value = savedBorderWidth;
        }
        
        if (shapeNodes[0].data?.style?.borderColor) {
          lineColor.value = shapeNodes[0].data.style.borderColor;
        } else if (shapeNodes[0].data?.savedBorderColor) {
          lineColor.value = shapeNodes[0].data.savedBorderColor;
        }
        
        if (shapeNodes[0].data?.style?.borderStyle) {
          switch (shapeNodes[0].data.style.borderStyle) {
            case 'dashed':
              lineStyle.value = 'dashed';
              break;
            case 'dotted':
              lineStyle.value = 'dotted';
              break;
            default:
              lineStyle.value = 'solid';
          }
        } else if (shapeNodes[0].data?.savedBorderStyle) {
          lineStyle.value = shapeNodes[0].data.savedBorderStyle;
        }
      }
    }
  }
  
  // 检查选中的边
  const selectedEdges = getSelectedEdges.value
  if (selectedEdges.length > 0) {
    const edge = selectedEdges[0]
    if (edge.data?.savedLineWidth !== undefined) {
      lineWidth.value = edge.data.savedLineWidth
    } else {
      lineWidth.value = parseInt(String((edge.style as any)?.strokeWidth || '1').replace('px', '')) || 1
    }
    
    if (edge.data?.savedLineColor) {
      lineColor.value = edge.data.savedLineColor
    } else {
      lineColor.value = (edge.style as any)?.stroke || '#555555'
    }
    
    if (edge.data?.savedLineStyle) {
      lineStyle.value = edge.data.savedLineStyle
    } else {
      const strokeDasharray = (edge.style as any)?.strokeDasharray
      if (strokeDasharray) {
        if (strokeDasharray === '5 5') {
          lineStyle.value = 'dashed'
        } else if (strokeDasharray === '2 2') {
          lineStyle.value = 'dotted'
        } else {
          lineStyle.value = 'solid'
        }
      } else {
        lineStyle.value = 'solid'
      }
    }
    
    if (edge.data?.savedArrowStyle) {
      arrowStyle.value = edge.data.savedArrowStyle
    } else {
      if (edge.markerStart && edge.markerEnd) {
        arrowStyle.value = 'both'
      } else if (edge.markerEnd) {
        arrowStyle.value = 'target'
      } else if (edge.markerStart) {
        arrowStyle.value = 'source'
      } else {
        arrowStyle.value = 'none'
      }
    }
  }
}

// 应用字体样式到选中的节点
const applyFontStyle = () => {
  const selectedNodes = getSelectedNodes.value
  
  selectedNodes.forEach(node => {
    updateNode(node.id, {
      data: {
        ...node.data,
        fontSize: fontSize.value,
        color: fontColor.value
      }
    })
  })
}

// 应用文本样式（粗体、斜体、下划线）到选中的节点
const applyTextStyle = (styleType: 'bold' | 'italic' | 'underline' | 'fontWeight' | 'fontStyle' | 'textDecoration', currentValue?: string) => {
  // 获取当前选中的节点
  const selectedNodes = getSelectedNodes.value.filter(node => {
    return node.type === 'roundedRect' || node.type === 'textLabel' || 
           node.type === 'startEnd' || node.type === 'condition' || node.type === 'circle'
  })
  
  if (selectedNodes.length === 0) return
  
  // 确定新的样式值
  let newStyleValue = currentValue
  let actualStyleType: 'fontWeight' | 'fontStyle' | 'textDecoration' = 'fontWeight'
  
  // 将简写样式类型转换为实际的样式属性
  if (styleType === 'bold') {
    actualStyleType = 'fontWeight'
    newStyleValue = isBold.value ? 'normal' : 'bold'
    isBold.value = !isBold.value
  } else if (styleType === 'italic') {
    actualStyleType = 'fontStyle'
    newStyleValue = isItalic.value ? 'normal' : 'italic'
    isItalic.value = !isItalic.value
  } else if (styleType === 'underline') {
    actualStyleType = 'textDecoration'
    newStyleValue = isUnderline.value ? 'none' : 'underline'
    isUnderline.value = !isUnderline.value
  } else if (!currentValue) {
    // 如果没有提供当前值，则根据样式类型和当前状态切换
    switch (styleType) {
      case 'fontWeight':
        newStyleValue = isBold.value ? 'normal' : 'bold'
        break
      case 'fontStyle':
        newStyleValue = isItalic.value ? 'normal' : 'italic'
        break
      case 'textDecoration':
        newStyleValue = isUnderline.value ? 'none' : 'underline'
        break
    }
    actualStyleType = styleType
  }
  
  // 更新选中节点的样式
  selectedNodes.forEach(node => {
    // 确保节点有数据对象
    if (!node.data) {
      node.data = {}
    }
    
    // 确保节点有样式对象
    if (!node.data.style) {
      node.data.style = {}
    }
    
    // 更新节点样式
    updateNode(node.id, {
      data: {
        ...node.data,
        style: {
          ...node.data.style,
          [actualStyleType]: newStyleValue
        }
      }
    })
  })
}

// 应用文本对齐样式到选中的节点
const applyTextAlign = (direction: 'left' | 'center' | 'right') => {
  textAlign.value = direction
  const selectedNodes = getSelectedNodes.value
  
  selectedNodes.forEach(node => {
    // 只应用于可以有文本的节点类型
    if (node.type === 'textLabel' || node.type === 'roundedRect' || node.type === 'startEnd' || node.type === 'condition' || node.type === 'circle') {
      // 确保样式对象存在
      const style = node.data?.style || {}
      // 更新文本对齐方式
      const updatedStyle = {
        ...style,
        textAlign: direction
      }
      
    updateNode(node.id, {
      data: {
        ...node.data,
          style: updatedStyle
        }
      })
    }
  })
}

// 应用背景色样式到选中的节点
const applyBgStyle = () => {
  const selectedShapeNodes = getNodes.value.filter(node => 
    node.selected && (
      node.type === 'textLabel' || 
      node.type === 'roundedRect' || 
      node.type === 'startEnd' || 
      node.type === 'condition' || 
      node.type === 'circle'
    )
  )
  
  if (selectedShapeNodes.length === 0) {
    return
  }
  
  // 更新选中的节点
  selectedShapeNodes.forEach(node => {
    // 确保节点有数据对象和样式对象
    const currentData = node.data || {}
    const currentStyle = currentData.style || {}
    
    updateNode(node.id, {
      data: {
        ...currentData,
        savedBgColor: bgColor.value,
        style: {
          ...currentStyle,
          backgroundColor: bgColor.value
        }
      }
    })
  })
}

// 应用边框/线条样式
const applyEdgeStyle = () => {
  // 获取选中的边和节点
  const selectedEdges = getSelectedEdges.value
  const selectedLineNodes = getNodes.value.filter(node => node.selected && node.type === 'line')
  
  // 获取选中的形状节点（但不包括文本标签节点）
  const selectedShapeNodes = getNodes.value.filter(node => 
    node.selected && 
    ['roundedRect', 'startEnd', 'condition', 'circle'].includes(node.type || '') && 
    node.type !== 'textLabel'
  )
  
  // 如果没有选中任何边、线节点或形状节点，则直接返回
  if (selectedEdges.length === 0 && selectedLineNodes.length === 0 && selectedShapeNodes.length === 0) {
    return
  }
  
  // 设置线型
  let strokeDasharray = undefined
  if (lineStyle.value === 'dashed') {
    strokeDasharray = '5 5'
  } else if (lineStyle.value === 'dotted') {
    strokeDasharray = '2 2'
  }
  
  // 确保线宽是数字类型
  const lineWidthNum = Number(lineWidth.value)
  
  // 更新边的样式
  selectedEdges.forEach(edge => {
          // 处理箭头配置
    let markerEnd = undefined
    if (arrowStyle.value === 'target' || arrowStyle.value === 'both') {
      markerEnd = {
              type: MarkerType.Arrow,
              color: lineColor.value,
              width: 15,
              height: 15,
              strokeWidth: 2
            }
    }
    
    let markerStart = undefined
    if (arrowStyle.value === 'source' || arrowStyle.value === 'both') {
              markerStart = {
        type: MarkerType.Arrow,
        color: lineColor.value,
        width: 15,
        height: 15,
        strokeWidth: 2
      }
    }
    
    // 更新边 - 使用setEdges方法而不是updateEdge函数
    const updatedEdges = getEdges.value.map(e => {
      if (e.id === edge.id) {
          return {
          ...e,
          style: {
            ...e.style,
            strokeWidth: lineWidthNum,
            stroke: lineColor.value,
            strokeDasharray
          },
            markerEnd,
          markerStart,
            data: {
            ...e.data,
            savedLineWidth: lineWidthNum,
              savedLineColor: lineColor.value,
              savedLineStyle: lineStyle.value,
              savedArrowStyle: arrowStyle.value
            }
        };
      }
      return e;
    });
    
    // 更新边集合
    setEdges(updatedEdges);
  })
  
  // 更新线节点的样式
  selectedLineNodes.forEach(node => {
    updateNode(node.id, {
      style: {
        ...node.style,
        strokeWidth: lineWidthNum,
        stroke: lineColor.value,
        strokeDasharray
      },
          data: {
            ...node.data,
            style: {
          ...node.data?.style,
          strokeWidth: lineWidthNum,
              stroke: lineColor.value,
              strokeDasharray
            },
            arrowStyle: arrowStyle.value
          }
    })
  })
  
  // 更新形状节点的边框样式（排除文本标签节点）
  selectedShapeNodes.forEach(node => {
    // 确保节点数据和样式对象存在
    const nodeData = node.data || {}
    const nodeStyle = nodeData.style || {}
    
    // 处理边框宽度 - 根据节点类型使用不同的格式
    let borderWidth: string | number = lineWidthNum;
    
    // 对于条件节点和圆形节点，使用纯数字值
    if (node.type === 'condition' || node.type === 'circle') {
      borderWidth = lineWidthNum; // SVG使用纯数字值
    } 
    // 对于其他节点类型使用带单位的值
    else {
      borderWidth = `${lineWidthNum}px`;
    }
    
    // 更新节点数据中的边框样式
    updateNode(node.id, {
      data: {
        ...nodeData,
        style: {
          ...nodeStyle,
          borderWidth: borderWidth,
          borderColor: lineColor.value,
          borderStyle: lineStyle.value === 'solid' ? 'solid' : 
                      lineStyle.value === 'dashed' ? 'dashed' : 'dotted'
        },
        savedBorderWidth: lineWidthNum, // 始终保存为纯数字
        savedBorderColor: lineColor.value,
        savedBorderStyle: lineStyle.value
      }
    })
  })
}

// 添加分布事件
const emit = defineEmits<{
  (e: 'align', direction: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle'): void
  (e: 'distribute', direction: 'horizontal' | 'vertical'): void
  (e: 'layer', action: 'top' | 'bottom' | 'up' | 'down'): void
}>()

// 对齐按钮点击处理
const handleAlignClick = (direction: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'middle') => {
  // 调用父组件的对齐方法
  emit('align', direction)
}

// 分布按钮点击处理
const handleDistributeClick = (direction: 'horizontal' | 'vertical') => {
  emit('distribute', direction)
}

// 层级按钮点击处理
const handleLayerClick = (action: 'top' | 'bottom' | 'up' | 'down') => {
  emit('layer', action)
}

// 添加对颜色选择器的引用
const fontColorInput = ref<HTMLInputElement | null>(null)
const lineColorInput = ref<HTMLInputElement | null>(null)
const bgColorInput = ref<HTMLInputElement | null>(null) // 背景色输入框引用

// 打开字体颜色选择器
const openFontColorPicker = () => {
  fontColorInput.value?.click()
}

// 打开线条颜色选择器
const openLineColorPicker = () => {
  lineColorInput.value?.click()
}

// 打开背景色选择器
const openBgColorPicker = () => {
  bgColorInput.value?.click()
}

// 获取箭头样式图标
const getArrowStyleIcon = () => {
  switch (arrowStyle.value) {
    case 'none':
      return '─'
    case 'source':
      return '←'
    case 'target':
      return '→'
    case 'both':
      return '↔'
    default:
      return '─'
  }
}

// 选择箭头样式
const selectArrowStyle = (style: string) => {
  arrowStyle.value = style
  showArrowStyleDropdown.value = false
  applyEdgeStyle()
}

// 设置初始工具栏状态并添加事件监听
onMounted(() => {
  // 初始化工具栏状态
  onNodesChange()
  
  // 添加节点变化的监听
  watch(() => getSelectedNodes.value, () => {
    onNodesChange()
  }, { immediate: true })
  
  // 添加边变化的监听
  watch(() => getSelectedEdges.value, () => {
    onNodesChange()
  }, { immediate: true })
  
  // 监听背景色的变化，确保颜色指示器同步更新
  watch(() => bgColor.value, (newColor) => {
  })

  // 添加点击事件监听器
  document.addEventListener('click', handleClickOutside)
})

// 移除点击事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 