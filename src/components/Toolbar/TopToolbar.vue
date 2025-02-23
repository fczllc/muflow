<template>
  <div class="top-toolbar">
    <Logo />
    
    <div class="style-tools">
      <!-- 字体样式设置组 -->
      <div class="tool-group">
        <select v-model="fontSize" class="font-size-select">
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="18">18px</option>
          <option value="20">20px</option>
        </select>
        <input type="color" v-model="fontColor" class="color-picker" title="字体颜色">
      </div>

      <ToolbarIcon type="divider" />

      <!-- 线框样式设置组 -->
      <div class="tool-group">
        <input type="number" v-model="borderWidth" min="1" max="10" class="number-input" title="边框粗细">
        <input type="color" v-model="borderColor" class="color-picker" title="边框颜色">
      </div>

      <ToolbarIcon type="divider" />

      <!-- 连线样式设置组 -->
      <div class="tool-group">
        <input type="number" v-model="lineWidth" min="1" max="10" class="number-input" title="线条粗细">
        <input type="color" v-model="lineColor" class="color-picker" title="线条颜色">
        <button class="icon-btn" @click="toggleLineStyle" title="线条样式">
          <ToolbarIcon :type="currentLineStyle" />
        </button>
        <button class="icon-btn" @click="toggleArrowStyle" title="箭头样式">
          <ToolbarIcon :type="currentArrowStyle" />
        </button>
      </div>

      <ToolbarIcon type="divider" />

      <!-- 对齐分布设置组 -->
      <div class="tool-group">
        <button class="icon-btn" @click="alignLeft" title="左对齐">
          <ToolbarIcon type="alignLeft" />
        </button>
        <button class="icon-btn" @click="alignRight" title="右对齐">
          <ToolbarIcon type="alignRight" />
        </button>
        <button class="icon-btn" @click="alignTop" title="顶对齐">
          <ToolbarIcon type="alignTop" />
        </button>
        <button class="icon-btn" @click="alignBottom" title="底对齐">
          <ToolbarIcon type="alignBottom" />
        </button>
        <button class="icon-btn" @click="alignHCenter" title="水平居中">
          <ToolbarIcon type="alignHCenter" />
        </button>
        <button class="icon-btn" @click="alignVCenter" title="垂直居中">
          <ToolbarIcon type="alignVCenter" />
        </button>
        <button class="icon-btn" @click="distributeHorizontal" title="水平分布">
          <ToolbarIcon type="distributeH" />
        </button>
        <button class="icon-btn" @click="distributeVertical" title="垂直分布">
          <ToolbarIcon type="distributeV" />
        </button>
      </div>
    </div>

    <!-- 画布操作工具 -->
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
        <button class="icon-btn" @click="saveJSON"  @mouseleave="hideTooltip" title="保存画布">
          <ToolbarIcon type="save" />
        </button>

      </div>
    </div>
  </div>
</template>

<style scoped>
.top-toolbar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-color);
}

.style-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  margin-right: auto;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.font-size-select {
  width: 70px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.number-input {
  width: 50px;
  height: 24px;
  padding: 0 4px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.color-picker {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--hover-color);
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
  border-radius: 4px;
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
</style>

<script setup lang="ts">
import { ref } from 'vue'
import Logo from '../Logo/Logo.vue'
import ToolbarIcon from '../Icons/ToolbarIcon.vue'

// 字体样式
const fontSize = ref(12)
const fontColor = ref('#000000')

// 边框样式
const borderWidth = ref(1)
const borderColor = ref('#000000')

// 连线样式
const lineWidth = ref(1)
const lineColor = ref('#000000')
const currentLineStyle = ref<'lineSolid' | 'lineDashed' | 'lineDotted'>('lineSolid')
const currentArrowStyle = ref<'arrowNone' | 'arrowSingle' | 'arrowDouble'>('arrowSingle')

// 切换线条样式
const toggleLineStyle = () => {
  const styles: ['lineSolid', 'lineDashed', 'lineDotted'] = ['lineSolid', 'lineDashed', 'lineDotted']
  const currentIndex = styles.indexOf(currentLineStyle.value)
  currentLineStyle.value = styles[(currentIndex + 1) % styles.length]
}

// 切换箭头样式
const toggleArrowStyle = () => {
  const styles: ['arrowNone', 'arrowSingle', 'arrowDouble'] = ['arrowNone', 'arrowSingle', 'arrowDouble']
  const currentIndex = styles.indexOf(currentArrowStyle.value)
  currentArrowStyle.value = styles[(currentIndex + 1) % styles.length]
}

// 对齐和分布方法
const alignLeft = () => { /* 实现左对齐 */ }
const alignRight = () => { /* 实现右对齐 */ }
const alignTop = () => { /* 实现顶对齐 */ }
const alignBottom = () => { /* 实现底对齐 */ }
const alignHCenter = () => { /* 实现水平居中 */ }
const alignVCenter = () => { /* 实现垂直居中 */ }
const distributeHorizontal = () => { /* 实现水平分布 */ }
const distributeVertical = () => { /* 实现垂直分布 */ }

// 提示框状态
const activeTooltip = ref<'clear' | 'export' | 'save' | null>(null)

// 显示/隐藏提示框

const hideTooltip = () => {
  activeTooltip.value = null
}

// 画布操作方法
const clearCanvas = () => { /* 实现清除画布 */ }
const exportImage = () => { /* 实现导出图片 */ }
const saveJSON = () => { /* 实现保存JSON */ }
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TopToolbar'
})
</script> 