# TopToolbar 组件

顶部工具栏组件，提供样式设置、对齐分布和画布操作功能。

## 属性 (Props)

该组件没有可配置的属性。

## 事件 (Events)

| 事件名 | 参数 | 说明 |
|--------|------|------|
| align | direction: 'left' \| 'right' \| 'top' \| 'bottom' \| 'center' \| 'middle' | 触发对齐操作 |
| distribute | direction: 'horizontal' \| 'vertical' | 触发分布操作 |

## 方法 (Methods)

该组件不对外暴露方法。

## 功能区域

### 字体样式工具

提供节点文本样式设置：

| 工具 | 功能 | 说明 |
|------|------|------|
| 字体大小 | 设置选中节点的字体大小 | 支持 12px - 20px |
| 字体颜色 | 设置选中节点的字体颜色 | 支持任意颜色 |

### 连线样式工具

提供连线和直线节点的样式设置：

| 工具 | 功能 | 说明 |
|------|------|------|
| 线条粗细 | 设置选中连线或直线的粗细 | 支持 1px - 10px |
| 线条颜色 | 设置选中连线或直线的颜色 | 支持任意颜色 |
| 线条类型 | 设置选中连线或直线的类型 | 支持实线、虚线、点线 |
| 箭头样式 | 设置选中连线或直线的箭头 | 支持无箭头、起点箭头、终点箭头、双向箭头 |

### 对齐工具

提供节点对齐功能：

| 工具 | 功能 | 说明 |
|------|------|------|
| 左对齐 | 将选中节点左边界对齐 | 需选中两个及以上节点 |
| 右对齐 | 将选中节点右边界对齐 | 需选中两个及以上节点 |
| 顶对齐 | 将选中节点上边界对齐 | 需选中两个及以上节点 |
| 底对齐 | 将选中节点下边界对齐 | 需选中两个及以上节点 |
| 水平居中 | 将选中节点水平居中对齐 | 需选中两个及以上节点 |
| 垂直居中 | 将选中节点垂直居中对齐 | 需选中两个及以上节点 |

### 分布工具

提供节点分布功能：

| 工具 | 功能 | 说明 |
|------|------|------|
| 水平分布 | 将选中节点水平均匀分布 | 需选中三个及以上节点 |
| 垂直分布 | 将选中节点垂直均匀分布 | 需选中三个及以上节点 |

### 画布工具

提供画布操作功能：

| 工具 | 功能 | 说明 |
|------|------|------|
| 清除画布 | 清除画布上的所有内容 | 有确认提示 |
| 导出图片 | 将画布导出为 JPG 图片 | 自动计算内容区域 |
| 导入文件 | 导入 JSON 格式的流程图数据 | 支持拖拽导入 |
| 保存文件 | 将流程图保存为 JSON 文件 | 包含完整数据 |

## 状态管理

组件内部维护以下状态：

1. 字体样式状态：
   - fontSize: 字体大小
   - fontColor: 字体颜色

2. 连线和直线样式状态：
   - lineWidth: 线条粗细（1-10px）
   - lineColor: 线条颜色
   - lineStyle: 线条类型（solid、dashed、dotted）
   - arrowStyle: 箭头样式（none、source、target、both）

## 使用示例

```vue
<template>
  <TopToolbar
    @align="handleAlign"
    @distribute="handleDistribute"
  />
</template>

<script setup lang="ts">
import { TopToolbar } from './components'
import type { AlignDirection, DistributeDirection } from '../types'

const handleAlign = (direction: AlignDirection) => {
  // 处理对齐操作
}

const handleDistribute = (direction: DistributeDirection) => {
  // 处理分布操作
}
</script>
``` 