<template>
  <div class="resource-tool">
    <div class="tool-buttons" title="插入图标">
      <button class="tool-btn" 
              @click="toggleIconSelector" 
              @mouseenter="activeTooltip = 'icons'" 
              @mouseleave="hideTooltip">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">
<path fill="#000000" d="M2 2h9v9H2zm2 2v5h5V4zm9-2h9v9h-9zm2 2v5h5V4zM2 13h9v9H2zm2 2v5h5v-5zm12.5-1.5h2v3h3v2h-3v3h-2v-3h-3v-2h3z"/>
        </svg>
      </button>
      
      <!-- 鱼骨图模板按钮 -->
      <button class="tool-btn" 
              @click="loadFishboneTemplate" 
              @mouseenter="activeTooltip = 'fishbone'" 
              @mouseleave="hideTooltip" title="插入鱼骨图">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024" fill="#000000" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">
<path d="M912.85 398.93h-167.7A51.21 51.21 0 0 0 694 450.08v26.48h-18.12l-73.18-125h5.36a57.2 57.2 0 0 0 57.14-57.14v-78.8a57.21 57.21 0 0 0-57.14-57.14h-119a57.21 57.21 0 0 0-57.14 57.14v78.81a57.2 57.2 0 0 0 57.14 57.14h30.23l73.17 125H421.37l-81-124.38a57.19 57.19 0 0 0 55.79-57.1v-78.82A57.21 57.21 0 0 0 339 159.13H220a57.21 57.21 0 0 0-57.14 57.14v78.81A57.2 57.2 0 0 0 220 352.22h34.46l81 124.34H78.39v72H252l-76.43 112.57h-22.88a57.2 57.2 0 0 0-57.14 57.14v78.8a57.2 57.2 0 0 0 57.14 57.14h119a57.2 57.2 0 0 0 57.14-57.14v-78.8a57.2 57.2 0 0 0-57.14-57.14h-9.12L339 548.56h199.32l-75.94 111.92h-30.47a57.2 57.2 0 0 0-57.14 57.14v78.8a57.2 57.2 0 0 0 57.14 57.14h119a57.2 57.2 0 0 0 57.14-57.14v-78.8a57.2 57.2 0 0 0-57.14-57.14h-1.53l75.94-111.92H694V575a51.21 51.21 0 0 0 51.15 51.15h167.7A51.21 51.21 0 0 0 964 575V450a51.21 51.21 0 0 0-51.15-51.07zM499.91 226.48h97.29v57.09h-97.29z m-269 0.65h97.29v57.09h-97.31z m29.95 559.08h-97.31v-57.08h97.29z m279.22-0.65h-97.31v-57.08h97.29zM892 554.19H766v-83.26h126z" p-id="5116"></path>
        </svg>
      </button>
    </div>
    
    <IconSelector 
      :isOpen="showIconSelector" 
      @close="showIconSelector = false" 
      @select="onIconSelect"
    />
   
    <!-- 鱼骨图确认对话框 -->
    <ConfirmModal 
      :show="showFishboneConfirm"
      title="加载鱼骨图"
      message="确认加载鱼骨图模板吗？当前画布上的内容将被清空。"
      @confirm="confirmLoadFishbone"
      @cancel="cancelLoadFishbone"
    >
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import IconSelector from '../Icons/IconSelector.vue'
import ConfirmModal from '../Modal/ConfirmModal.vue'

// 从VueFlow获取添加节点的方法
const addNodes = inject('addNodes') as (nodes: any[]) => void
const saveToHistory = inject('saveToHistory') as () => void
const clearCanvas = inject('clearCanvas') as () => void

// 控制图标选择器的显示/隐藏
const showIconSelector = ref(false)
const activeTooltip = ref('')

// 鱼骨图模板相关状态
const showFishboneConfirm = ref(false)

// 鱼骨图数据
const fishboneTemplate = {
  "nodes": [
    {
      "id": "line-1",
      "type": "line",
      "dimensions": {
        "width": 466,
        "height": 1
      },
      "computedPosition": {
        "x": 56,
        "y": 186,
        "z": 0
      },
      "handleBounds": {
        "source": [],
        "target": []
      },
      "draggable": true,
      "selectable": true,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "initialized": false,
      "isParent": false,
      "position": {
        "x": 56,
        "y": 186
      },
      "data": {
        "label": "直线",
        "style": {
          "strokeWidth": 1,
          "stroke": "#000000",
          "width": "466px",
          "height": "1px",
          "textAlign": "center",
          "fontWeight": "normal",
          "fontStyle": "normal",
          "textDecoration": "none"
        },
        "width": 466.0321877295602,
        "angle": 0,
        "arrowStyle": "target",
        "fontSize": 14,
        "color": "#000000"
      },
      "events": {},
      "style": {
        "strokeWidth": 1,
        "stroke": "#000000",
        "width": "466px",
        "height": "1px"
      },
      "width": 466,
      "height": 1
    },
    {
      "id": "textLabel-2",
      "type": "textLabel",
      "dimensions": {
        "width": 100,
        "height": 30
      },
      "computedPosition": {
        "x": 542,
        "y": 171.5,
        "z": 0
      },
      "handleBounds": {
        "source": [],
        "target": []
      },
      "selected": false,
      "dragging": false,
      "resizing": false,
      "initialized": false,
      "isParent": false,
      "position": {
        "x": 542,
        "y": 171.5
      },
      "data": {
        "label": "文本",
        "style": {
          "width": "100px",
          "height": "30px",
          "textAlign": "left",
          "fontWeight": "normal",
          "fontStyle": "normal",
          "textDecoration": "none"
        },
        "fontSize": 14,
        "color": "#000000"
      },
      "events": {},
      "width": 100,
      "height": 30
    },
    {
      "id": "line-3",
      "type": "line",
      "dimensions": {
        "width": 168,
        "height": 1
      },
      "computedPosition": {
        "x": 355.5,
        "y": 60.5,
        "z": 0
      },
      "handleBounds": {
        "source": [],
        "target": []
      },
      "draggable": true,
      "selectable": true,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "initialized": false,
      "isParent": false,
      "position": {
        "x": 355.5,
        "y": 60.5
      },
      "data": {
        "label": "直线",
        "style": {
          "strokeWidth": 1,
          "stroke": "#000000",
          "width": "168px",
          "height": "1px",
          "textAlign": "center",
          "fontWeight": "normal",
          "fontStyle": "normal",
          "textDecoration": "none"
        },
        "width": 168.06700812154654,
        "angle": 45,
        "arrowStyle": "target",
        "fontSize": 14,
        "color": "#000000"
      },
      "events": {},
      "style": {
        "strokeWidth": 1,
        "stroke": "#000000",
        "width": "168px",
        "height": "1px"
      },
      "width": 168,
      "height": 1
    },
    {
      "id": "line-1742804286366-beudmyd0q",
      "type": "line",
      "dimensions": {
        "width": 168,
        "height": 1
      },
      "computedPosition": {
        "x": 177.5,
        "y": 60.5,
        "z": 0
      },
      "handleBounds": {
        "source": [],
        "target": []
      },
      "draggable": true,
      "selectable": true,
      "connectable": true,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "initialized": false,
      "isParent": false,
      "position": {
        "x": 177.5,
        "y": 60.5
      },
      "data": {
        "label": "直线",
        "style": {
          "strokeWidth": 1,
          "stroke": "#000000",
          "width": "168px",
          "height": "1px",
          "textAlign": "center",
          "fontWeight": "normal",
          "fontStyle": "normal",
          "textDecoration": "none"
        },
        "width": 168.06700812154654,
        "angle": 45,
        "arrowStyle": "target",
        "draggable": true,
        "selectable": true,
        "connectable": true,
        "fontSize": 14,
        "color": "#000000"
      },
      "events": {},
      "width": 168,
      "height": 1
    },
    {
      "id": "line-1742804329044-w5dna4ff5",
      "type": "line",
      "dimensions": {
        "width": 204,
        "height": 1
      },
      "computedPosition": {
        "x": 382.5,
        "y": 193.5,
        "z": 0
      },
      "handleBounds": {
        "source": [],
        "target": []
      },
      "draggable": true,
      "selectable": true,
      "connectable": true,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "initialized": false,
      "isParent": false,
      "position": {
        "x": 382.5,
        "y": 193.5
      },
      "data": {
        "label": "直线",
        "style": {
          "strokeWidth": 1,
          "stroke": "#000000",
          "width": "204px",
          "height": "1px",
          "textAlign": "center",
          "fontWeight": "normal",
          "fontStyle": "normal",
          "textDecoration": "none"
        },
        "width": 172.0363333717619,
        "angle": 135,
        "arrowStyle": "source",
        "draggable": true,
        "selectable": true,
        "connectable": true,
        "fontSize": 14,
        "color": "#000000"
      },
      "events": {},
      "style": {
        "strokeWidth": 1,
        "stroke": "#000000",
        "width": "204px",
        "height": "1px"
      },
      "width": 204,
      "height": 1
    },
    {
      "id": "line-1742804329044-er1xr9pds",
      "type": "line",
      "dimensions": {
        "width": 165,
        "height": 1
      },
      "computedPosition": {
        "x": 204.5,
        "y": 193.5,
        "z": 0
      },
      "handleBounds": {
        "source": [],
        "target": []
      },
      "draggable": true,
      "selectable": true,
      "connectable": true,
      "selected": false,
      "dragging": false,
      "resizing": false,
      "initialized": false,
      "isParent": false,
      "position": {
        "x": 204.5,
        "y": 193.5
      },
      "data": {
        "label": "直线",
        "style": {
          "strokeWidth": 1,
          "stroke": "#000000",
          "width": "165px",
          "height": "1px",
          "textAlign": "center",
          "fontWeight": "normal",
          "fontStyle": "normal",
          "textDecoration": "none"
        },
        "width": 164.7619494907729,
        "angle": 135,
        "arrowStyle": "source",
        "draggable": true,
        "selectable": true,
        "connectable": true,
        "fontSize": 14,
        "color": "#000000"
      },
      "events": {},
      "style": {
        "strokeWidth": 1,
        "stroke": "#000000",
        "width": "165px",
        "height": "1px"
      },
      "width": 165,
      "height": 1
    }
  ]
}

// 隐藏提示
const hideTooltip = () => {
  activeTooltip.value = ''
}

// 切换图标选择器显示状态
const toggleIconSelector = () => {
  showIconSelector.value = !showIconSelector.value
  hideTooltip()
}

// 显示鱼骨图确认对话框
const loadFishboneTemplate = () => {
  activeTooltip.value = 'fishbone'
  showFishboneConfirm.value = true
}

// 确认加载鱼骨图
const confirmLoadFishbone = () => {
  if (clearCanvas && addNodes) {
    // 清空当前画布
    clearCanvas()
    
    // 加载鱼骨图模板
    addNodes(fishboneTemplate.nodes)
    
    // 保存历史记录
    if (saveToHistory) {
      saveToHistory()
    }
  }
  
  // 关闭确认对话框
  showFishboneConfirm.value = false
}

// 取消加载鱼骨图
const cancelLoadFishbone = () => {
  showFishboneConfirm.value = false
}

// 处理图标选择
const onIconSelect = (iconData: { type: string, name: string }) => {
  if (addNodes) {
    const newNode = {
      id: `svgIcon-${Date.now()}`,
      type: 'svgIcon',
      position: { x: 100, y: 100 },
      data: {
        iconType: iconData.type,
        width: 24,
        height: 24,
        strokeWidth: 2,
        color: '#333333'
      },
      draggable: true,
      selectable: true,
      connectable: false
    }
    
    // 添加节点
    addNodes([newNode])
    
    // 保存历史记录
    if (saveToHistory) {
      saveToHistory()
    }
  }
  
  // 关闭选择器
  showIconSelector.value = false
}
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ResourceTool'
})
</script>

<style scoped>
.resource-tool {
  padding: 10px;
}

.tool-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none;
  background-color: transparent;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
}

.tool-btn svg {
  color: #555;
  margin-top:8px;
}

.tool-btn:hover {
  background-color: #f5f5f5;

}

</style> 