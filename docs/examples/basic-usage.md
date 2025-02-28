# 基础使用示例

## 基本流程图

创建一个简单的流程图，包含两个节点和一条连线：

```vue
<template>
  <div class="flow-container">
    <FlowEditor />
  </div>
</template>

<script setup lang="ts">
import { FlowEditor } from '@/components/FlowEditor.vue'
</script>

<style>
.flow-container {
  width: 800px;
  height: 600px;
  border: 1px solid #ddd;
}
</style>
```

## 预设节点和连线

创建带有预设节点和连线的流程图：

```vue
<template>
  <div class="flow-container">
    <FlowEditor :initial-nodes="nodes" :initial-edges="edges" />
  </div>
</template>

<script setup lang="ts">
import { FlowEditor } from '@/components/FlowEditor.vue'
import { ref } from 'vue'

const nodes = ref([
  {
    id: '1',
    type: 'roundedRect',
    position: { x: 100, y: 100 },
    data: {
      label: '开始',
      fontSize: 14,
      color: '#333',
      style: {
        width: 120,
        height: 40,
        borderRadius: 4
      }
    }
  },
  {
    id: '2',
    type: 'textLabel',
    position: { x: 300, y: 100 },
    data: {
      label: '处理中',
      fontSize: 14,
      color: '#666'
    }
  }
])

const edges = ref([
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    style: {
      stroke: '#999',
      strokeWidth: 2
    }
  }
])
</script>
```

## 事件处理

监听节点和连线的事件：

```vue
<template>
  <div class="flow-container">
    <FlowEditor
      @nodeClick="handleNodeClick"
      @edgeClick="handleEdgeClick"
      @nodeDoubleClick="handleNodeDoubleClick"
      @selectionChange="handleSelectionChange"
    />
  </div>
</template>

<script setup lang="ts">
import { FlowEditor } from '@/components/FlowEditor.vue'

const handleNodeClick = (node: Node) => {
  console.log('Node clicked:', node)
}

const handleEdgeClick = (edge: Edge) => {
  console.log('Edge clicked:', edge)
}

const handleNodeDoubleClick = (node: Node) => {
  console.log('Node double clicked:', node)
}

const handleSelectionChange = (elements: Array<Node | Edge>) => {
  console.log('Selection changed:', elements)
}
</script>
```

## 自定义样式

使用 CSS 变量自定义组件样式：

```vue
<template>
  <div class="flow-container custom-theme">
    <FlowEditor />
  </div>
</template>

<style>
.custom-theme {
  --flow-bg-color: #f5f5f5;
  --flow-node-bg: #fff;
  --flow-node-border: #ccc;
  --flow-node-color: #333;
  --flow-node-selected: #1890ff;
  --flow-edge-color: #999;
  --flow-edge-selected: #1890ff;
}
</style>
```

## 数据导入导出

实现数据的导入和导出功能：

```vue
<template>
  <div class="flow-container">
    <div class="flow-actions">
      <button @click="exportData">导出数据</button>
      <button @click="importData">导入数据</button>
    </div>
    <FlowEditor ref="flowEditor" />
  </div>
</template>

<script setup lang="ts">
import { FlowEditor } from '@/components/FlowEditor.vue'
import { ref } from 'vue'

const flowEditor = ref()

const exportData = () => {
  const data = flowEditor.value.exportToJson()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'flow-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importData = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files[0]
    const text = await file.text()
    const data = JSON.parse(text)
    flowEditor.value.importFromJson(data)
  }
  input.click()
}
</script>

<style>
.flow-actions {
  margin-bottom: 16px;
}

.flow-actions button {
  margin-right: 8px;
}
</style>
```

## 自动布局

使用自动布局功能排列节点：

```vue
<template>
  <div class="flow-container">
    <div class="flow-actions">
      <button @click="autoLayout">自动布局</button>
    </div>
    <FlowEditor ref="flowEditor" />
  </div>
</template>

<script setup lang="ts">
import { FlowEditor } from '@/components/FlowEditor.vue'
import { ref } from 'vue'

const flowEditor = ref()

const autoLayout = () => {
  const nodes = flowEditor.value.getNodes()
  const edges = flowEditor.value.getEdges()
  
  // 简单的自动布局算法
  const spacing = 200
  let x = 100
  let y = 100
  
  nodes.forEach((node, index) => {
    node.position = {
      x: x + (index % 3) * spacing,
      y: y + Math.floor(index / 3) * spacing
    }
  })
  
  flowEditor.value.setNodes(nodes)
}
</script>
```

## 最佳实践

1. 组件初始化：
   - 确保容器有固定尺寸
   - 提供合适的初始节点位置
   - 设置适当的缩放范围

2. 性能优化：
   - 使用 `v-memo` 优化节点渲染
   - 避免频繁更新节点数据
   - 大量节点时使用虚拟滚动

3. 错误处理：
   - 验证导入的数据格式
   - 处理节点连接的边界情况
   - 提供用户友好的错误提示

4. 用户体验：
   - 添加加载状态指示
   - 提供操作确认对话框
   - 实现撤销/重做功能 