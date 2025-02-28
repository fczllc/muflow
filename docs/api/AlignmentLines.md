# AlignmentLines 组件

对齐辅助线组件，用于在节点拖拽时显示对齐参考线。

## 属性 (Props)

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| lines | Array<AlignmentLine> | 是 | 对齐线数组 |

### AlignmentLine 类型定义

```typescript
interface AlignmentLine {
  id: string                          // 对齐线唯一标识
  type: 'horizontal' | 'vertical'     // 对齐线类型
  position: number                    // 对齐线位置（像素值）
}
```

## 事件 (Events)

该组件不向外部发出事件。

## 方法 (Methods)

该组件不对外暴露方法。

## 对齐类型

### 水平对齐

显示水平方向的对齐参考线：

| 对齐位置 | 说明 |
|---------|------|
| 顶部对齐 | 节点上边界对齐 |
| 中心对齐 | 节点垂直中心对齐 |
| 底部对齐 | 节点下边界对齐 |

### 垂直对齐

显示垂直方向的对齐参考线：

| 对齐位置 | 说明 |
|---------|------|
| 左侧对齐 | 节点左边界对齐 |
| 中心对齐 | 节点水平中心对齐 |
| 右侧对齐 | 节点右边界对齐 |

## 样式定制

```css
.alignment-lines {
  /* 容器样式 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.alignment-line {
  /* 对齐线基本样式 */
  position: absolute;
  pointer-events: none;
  border: none;
  
  /* 垂直对齐线 */
  &.vertical {
    width: 0;
    transform: translateX(-50%);
    border-left: 1px dotted #999999;
  }
  
  /* 水平对齐线 */
  &.horizontal {
    height: 0;
    transform: translateY(-50%);
    border-top: 1px dotted #999999;
  }
}
```

## 使用示例

```vue
<template>
  <VueFlow>
    <!-- 添加对齐线组件 -->
    <AlignmentLines :lines="alignmentLines" />
  </VueFlow>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { AlignmentLines } from './components'

// 对齐线状态
const alignmentLines = ref<Array<{
  id: string
  type: 'horizontal' | 'vertical'
  position: number
}>>([])

// 在节点拖拽时更新对齐线
const onNodeDrag = (event) => {
  const { node } = event
  const otherNodes = getNodes.value.filter(n => n.id !== node.id)
  
  // 计算对齐线
  alignmentLines.value = calculateAlignment(node, otherNodes)
}
</script>
```

## 对齐计算

组件配合 `calculateAlignment` 函数使用，该函数计算拖拽节点与其他节点的对齐关系：

```typescript
function calculateAlignment(
  draggedNode: Node,
  otherNodes: Node[]
): AlignmentLine[] {
  const lines: AlignmentLine[] = []
  
  // 获取拖拽节点的边界
  const draggedBounds = {
    left: draggedNode.position.x,
    right: draggedNode.position.x + width,
    top: draggedNode.position.y,
    bottom: draggedNode.position.y + height,
    centerX: draggedNode.position.x + width / 2,
    centerY: draggedNode.position.y + height / 2
  }
  
  // 遍历其他节点计算对齐
  otherNodes.forEach(node => {
    // ... 计算对齐关系
    // ... 生成对齐线数据
  })
  
  return lines
}
```

## 注意事项

1. 对齐线组件是纯展示组件，不处理任何交互逻辑
2. 对齐线的计算和更新由父组件负责
3. 对齐线使用绝对定位，确保覆盖整个画布区域
4. 对齐线不响应任何鼠标事件，避免干扰节点拖拽 