# 自定义节点组件

## 通用功能特性

所有节点组件共享以下改进功能：

### 编辑状态同步

所有节点组件（RoundedRectNode、TextLabelNode、StartEndNode、ConditionNode、CircleNode）都实现了编辑状态同步机制：

```typescript
// 监听节点编辑状态变化
watch(() => props.data.isEditing, (newIsEditing) => {
  // 如果外部将编辑状态设为false，同步更新本地状态
  if (newIsEditing === false && isEditing.value === true) {
    isEditing.value = false
  }
})
```

这确保了从FlowEditor组件设置的编辑状态变更能够正确同步到各个节点组件。

### 文本选择状态清除

所有支持文本编辑的节点组件都实现了自动清除文本选择功能：

```typescript
// 在finishEditing函数中
const finishEditing = () => {
  isEditing.value = false
  
  // 清除所有文本选择
  window.getSelection()?.removeAllRanges()
  
  // 更新节点数据...
}

// 在handleKeydown函数中处理ESC键
const handleKeydown = (e: KeyboardEvent) => {
  // ...
  if (e.key === 'Escape') {
    isEditing.value = false
    // 清除所有文本选择
    window.getSelection()?.removeAllRanges()
    // 更新节点数据...
  }
  // ...
}
```

这解决了退出编辑模式时文本仍然保持选中状态的问题。

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

## StartEndNode 组件

起止节点组件，通常用于流程图的开始和结束。

### 属性 (Props)

继承自 Vue Flow 的 `NodeProps`：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| type | string | 是 | 节点类型，固定为 'startEnd' |
| position | { x: number, y: number } | 是 | 节点位置 |
| selected | boolean | 否 | 是否选中 |
| data | object | 否 | 节点数据 |

### 数据结构

```typescript
interface NodeData {
  label: string          // 显示文本
  fontSize?: number      // 字体大小，默认 12
  color?: string         // 字体颜色，默认 #000000
  isEditing?: boolean    // 是否处于编辑状态
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

提供 8 个调整点，与RoundedRectNode相同。

### 编辑功能

- 双击节点进入编辑模式
- 支持文本编辑
- ESC键或点击外部退出编辑模式
- 自动清除文本选择状态
- 编辑状态同步

## ConditionNode 组件

条件判断节点组件，通常用于流程图的分支判断。

### 属性 (Props)

继承自 Vue Flow 的 `NodeProps`：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| type | string | 是 | 节点类型，固定为 'condition' |
| position | { x: number, y: number } | 是 | 节点位置 |
| selected | boolean | 否 | 是否选中 |
| data | object | 否 | 节点数据 |

### 数据结构

```typescript
interface NodeData {
  label: string          // 显示文本
  fontSize?: number      // 字体大小，默认 12
  color?: string         // 字体颜色，默认 #000000
  isEditing?: boolean    // 是否处于编辑状态
  style?: {             // 节点样式
    width?: string      // 宽度，默认 120px
    height?: string     // 高度，默认 80px
  }
}
```

### 连线锚点

提供四个方向的连线锚点。

### 编辑功能

- 双击节点进入编辑模式
- 支持文本编辑
- ESC键或点击外部退出编辑模式
- 自动清除文本选择状态
- 编辑状态同步

## CircleNode 组件

圆形节点组件，通常用于表示数据点或特殊状态。

### 属性 (Props)

继承自 Vue Flow 的 `NodeProps`：

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点唯一标识 |
| type | string | 是 | 节点类型，固定为 'circle' |
| position | { x: number, y: number } | 是 | 节点位置 |
| selected | boolean | 否 | 是否选中 |
| data | object | 否 | 节点数据 |

### 数据结构

```typescript
interface NodeData {
  label: string          // 显示文本
  fontSize?: number      // 字体大小，默认 12
  color?: string         // 字体颜色，默认 #000000
  isEditing?: boolean    // 是否处于编辑状态
  style?: {             // 节点样式
    width?: string      // 宽度，默认 38px
    height?: string     // 高度，默认 38px
  }
}
```

### 连线锚点

提供四个方向的连线锚点。

### 编辑功能

- 双击节点进入编辑模式
- 支持文本编辑
- ESC键或点击外部退出编辑模式
- 自动清除文本选择状态
- 编辑状态同步

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
    <template #node-startEnd="nodeProps">
      <StartEndNode v-bind="nodeProps" />
    </template>
    <template #node-condition="nodeProps">
      <ConditionNode v-bind="nodeProps" />
    </template>
    <template #node-circle="nodeProps">
      <CircleNode v-bind="nodeProps" />
    </template>
  </VueFlow>
</template>

<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { 
  RoundedRectNode, 
  TextLabelNode, 
  LineNode,
  StartEndNode,
  ConditionNode,
  CircleNode 
} from './components/Nodes'
</script>