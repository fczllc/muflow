# FlowViewer 组件

`FlowViewer` 是一个用于展示流程图的只读组件。它基于 Vue Flow，提供了流程图的查看功能，但不包含编辑能力。

## 基本用法

```vue
<template>
  <FlowViewer
    :api-url="apiUrl"
    :flow-id="flowId"
    @error="handleError"
  />
</template>

<script setup>
import { FlowViewer } from 'muflow'

const apiUrl = 'https://api.example.com'
const flowId = 'flow-123'

const handleError = (error) => {
  console.error('流程图加载失败:', error)
}
</script>
```

## 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| apiUrl | string | '/api' | API 服务器地址 |
| flowId | string | - | 流程图ID，用于从API加载数据 |
| initialData | object | null | 初始流程图数据，可以直接传入而不从API加载 |
| fitView | boolean | true | 是否自动适应视图大小 |
| minZoom | number | 0.5 | 最小缩放比例 |
| maxZoom | number | 2.0 | 最大缩放比例 |
| defaultZoom | number | 1.0 | 默认缩放比例 |
| zoomOnScroll | boolean | false | 是否允许滚轮缩放 |
| panOnScroll | boolean | false | 是否允许滚轮平移 |
| panOnDrag | boolean | true | 是否允许拖拽平移 |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| error | (error: Error) | 当加载或渲染流程图出错时触发 |
| load | (data: object) | 当流程图数据加载完成时触发 |
| ready | - | 当流程图完全渲染完成时触发 |

## 方法

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| loadFlowData | (flowId: string) | Promise<void> | 加载指定ID的流程图数据 |
| centerFlow | - | void | 将流程图居中显示 |
| fitView | (options?: FitViewOptions) | void | 自适应视图大小 |
| zoomTo | (level: number) | void | 缩放到指定比例 |
| getTransform | - | Transform | 获取当前视图变换信息 |

### FitViewOptions 类型

```typescript
interface FitViewOptions {
  padding?: number;       // 边距，默认 0.4
  includeHiddenNodes?: boolean;  // 是否包含隐藏节点，默认 false
  minZoom?: number;      // 最小缩放比例
  maxZoom?: number;      // 最大缩放比例
}
```

### Transform 类型

```typescript
interface Transform {
  x: number;     // X轴平移量
  y: number;     // Y轴平移量
  zoom: number;  // 缩放比例
}
```

## 自动布局

FlowViewer 组件会在加载数据后自动进行以下布局操作：

1. 适应视图大小（如果 `fitView` 为 true）
2. 居中显示流程图
3. 应用默认缩放比例

## 错误处理

组件内置了错误处理机制：

1. API 请求错误
2. 数据格式错误
3. 渲染错误

所有错误都会通过 `error` 事件对外暴露，同时在组件内部显示错误提示。

## 示例

### 基础用法

```vue
<template>
  <FlowViewer
    api-url="https://api.example.com"
    flow-id="flow-123"
    :fit-view="true"
    :min-zoom="0.5"
    :max-zoom="2.0"
    @error="handleError"
    @load="handleLoad"
    @ready="handleReady"
  />
</template>
```

### 使用初始数据

```vue
<template>
  <FlowViewer
    :initial-data="flowData"
    :zoom-on-scroll="true"
    :pan-on-scroll="true"
  />
</template>

<script setup>
const flowData = {
  nodes: [
    // 节点数据
  ],
  edges: [
    // 边数据
  ]
}
</script>
```

### 使用组件方法

```vue
<template>
  <FlowViewer ref="viewerRef" />
  <button @click="handleCenter">居中显示</button>
</template>

<script setup>
import { ref } from 'vue'

const viewerRef = ref(null)

const handleCenter = () => {
  viewerRef.value?.centerFlow()
}
</script>
``` 