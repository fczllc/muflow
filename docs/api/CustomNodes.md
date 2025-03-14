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

## LineNode 组件

直线节点组件，支持拖拽、调整长度和角度、样式设置。

### 属性 (Props)

继承自 Vue Flow 的 `NodeProps`：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| type | string | 是 | 节点类型，固定为 'line' |
| position | { x: number, y: number } | 是 | 节点位置 |
| selected | boolean | 否 | 是否选中 |
| data | object | 否 | 节点数据 |

### 数据结构

```typescript
interface NodeData {
  width?: number         // 线条长度，默认 120
  angle?: number         // 旋转角度，默认 0
  arrowStyle?: string    // 箭头样式：'none' | 'source' | 'target' | 'both'
  style?: {             // 线条样式
    strokeWidth?: number // 线条粗细，默认 1
    stroke?: string     // 线条颜色，默认 #000000
    strokeDasharray?: string // 线条类型，实线为空，虚线 '5 5'，点线 '2 2'
  }
}
```

### 调整点

提供 2 个调整点：

| 位置 | 类型 | 说明 |
|------|------|------|
| 左端 | left | 调整长度和角度 |
| 右端 | right | 调整长度和角度 |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| Shift + 拖拽 | 启用角度对齐（每45度） |

### 角度对齐

支持的对齐角度：
- 0° (水平)
- 45° (右上)
- 90° (垂直)
- 135° (右下)
- 180° (水平)
- 225° (左下)
- 270° (垂直)
- 315° (左上)

### 样式定制

```css
.line-node {
  /* 节点基本样式 */
  position: relative;
  height: 1px;
  background: transparent;
  
  /* 线条容器 */
  .line-container {
    position: absolute;
    height: 1px;
    transform-origin: 0 center;
  }
  
  /* 线条样式 */
  .line {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  /* 箭头样式 */
  .arrow {
    position: absolute;
    top: 50%;
    width: 0;
    height: 0;
    border-style: solid;
    transform: translateY(-50%);
  }
  
  /* 调整点样式 */
  .resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: white;
    border: 2px solid #409eff;
    border-radius: 50%;
    cursor: move;
  }
  
  /* 角度指示器 */
  .angle-indicator {
    position: absolute;
    width: 100%;
    height: 1px;
    background-color: #409eff;
    opacity: 0.5;
  }
  
  /* 角度值显示 */
  .angle-value {
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 12px;
    color: #666;
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
    <template #node-line="nodeProps">
      <LineNode v-bind="nodeProps" />
    </template>
  </VueFlow>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { RoundedRectNode, TextLabelNode, LineNode } from './components'
</script>