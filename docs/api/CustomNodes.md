# 自定义节点组件

## RoundedRectNode 组件

圆角矩形节点组件，支持连线、拖拽、调整大小和文本编辑。

### 属性 (Props)

继承自 Vue Flow 的 `NodeProps`：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| type | string | 是 | 节点类型，固定为 'roundedRect' |
| position | { x: number, y: number } | 是 | 节点位置 |
| selected | boolean | 否 | 是否选中 |
| data | object | 否 | 节点数据 |

### 数据结构

```typescript
interface NodeData {
  label: string          // 显示文本
  fontSize?: number      // 字体大小，默认 14
  color?: string         // 字体颜色，默认 #000000
  style?: {             // 节点样式
    width?: string      // 宽度，默认 120px
    height?: string     // 高度，默认 42px
  }
}
```

### 连线锚点

提供四个方向的连线锚点：

| 位置 | 类型 | ID | 说明 |
|------|------|------|------|
| 左侧 | target | left-handle | 目标锚点 |
| 右侧 | source | right-handle | 源锚点 |
| 顶部 | target | top-handle | 目标锚点 |
| 底部 | source | bottom-handle | 源锚点 |

### 大小调整

提供 8 个调整点：

| 位置 | 类型 | 说明 |
|------|------|------|
| 上边 | top | 垂直调整 |
| 右边 | right | 水平调整 |
| 下边 | bottom | 垂直调整 |
| 左边 | left | 水平调整 |
| 左上 | topLeft | 对角调整 |
| 右上 | topRight | 对角调整 |
| 左下 | bottomLeft | 对角调整 |
| 右下 | bottomRight | 对角调整 |

### 样式定制

```css
.rounded-rect-node {
  /* 节点基本样式 */
  padding: 10px;
  border-radius: 3px;
  border: 1px solid #555;
  background: white;
  
  /* 尺寸限制 */
  min-width: 120px;
  min-height: 42px;
  
  /* 选中状态 */
  &.selected {
    border: 1px solid #1a192b;
    box-shadow: 0 0 0 1px #1a192b;
  }
  
  /* 编辑状态 */
  &.editing {
    user-select: text;
  }
}
```

## TextLabelNode 组件

文本标签节点组件，支持拖拽、调整大小和多行文本编辑。

### 属性 (Props)

继承自 Vue Flow 的 `NodeProps`：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| type | string | 是 | 节点类型，固定为 'textLabel' |
| position | { x: number, y: number } | 是 | 节点位置 |
| selected | boolean | 否 | 是否选中 |
| data | object | 否 | 节点数据 |

### 数据结构

```typescript
interface NodeData {
  label: string          // 显示文本
  fontSize?: number      // 字体大小，默认 14
  color?: string         // 字体颜色，默认 #000000
  style?: {             // 节点样式
    width?: string      // 宽度，默认 100px
    height?: string     // 高度，默认 30px
  }
}
```

### 大小调整

提供 4 个调整点：

| 位置 | 类型 | 说明 |
|------|------|------|
| 上边 | top | 垂直调整 |
| 右边 | right | 水平调整 |
| 下边 | bottom | 垂直调整 |
| 左边 | left | 水平调整 |

### 样式定制

```css
.text-label-node {
  /* 节点基本样式 */
  padding: 5px;
  background: transparent;
  
  /* 尺寸限制 */
  min-width: 100px;
  min-height: 30px;
  
  /* 选中状态 */
  &.selected {
    outline: 1px dashed #1a192b;
  }
  
  /* 编辑状态 */
  &.editing {
    outline: 1px dashed #1a192b;
    user-select: text;
  }
}
```

## 使用示例

```vue
<template>
  <VueFlow>
    <!-- 注册自定义节点 -->
    <template #node-roundedRect="nodeProps">
      <RoundedRectNode v-bind="nodeProps" />
    </template>
    <template #node-textLabel="nodeProps">
      <TextLabelNode v-bind="nodeProps" />
    </template>
  </VueFlow>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { RoundedRectNode, TextLabelNode } from './components'
</script> 