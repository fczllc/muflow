# 快速开始

## 安装

1. 安装依赖：

```bash
npm install @vue-flow/core html2canvas lodash-es
```

2. 引入样式：

```typescript
// main.ts
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
```

## 基本使用

1. 创建流程图编辑器：

```vue
<template>
  <div class="app">
    <FlowEditor />
  </div>
</template>

<script setup lang="ts">
import FlowEditor from './components/FlowEditor.vue'
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
}
</style>
```

2. 创建节点：
   - 从左侧工具栏拖拽节点到画布
   - 支持文本标签和圆角矩形两种节点
   - 节点自动生成唯一 ID

3. 编辑节点：
   - 双击节点编辑文本
   - 拖拽节点调整位置
   - 拖拽边角调整大小

4. 连接节点：
   - 从节点锚点拖出连线
   - 连接到目标节点锚点
   - 自动生成平滑曲线

## 高级功能

### 节点对齐

1. 多选节点：
   - 单击选择单个节点
   - Ctrl + 点击多选节点
   - 点击空白取消选择

2. 对齐操作：
   - 左对齐、右对齐
   - 顶对齐、底对齐
   - 水平居中、垂直居中

3. 分布操作：
   - 水平均匀分布
   - 垂直均匀分布

### 样式设置

1. 节点样式：
   - 设置字体大小
   - 设置字体颜色

2. 连线样式：
   - 设置线条粗细
   - 设置线条颜色
   - 设置线条类型
   - 设置箭头样式

### 画布操作

1. 导出功能：
   - 导出为 JPG 图片
   - 导出为 JSON 文件

2. 导入功能：
   - 导入 JSON 文件
   - 自动还原节点和连线

3. 其他功能：
   - 清空画布
   - 保存到本地
   - API 数据交互

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + A | 全选画布上的所有对象 |
| ESC | 取消选中状态 |
| Delete | 删除选中的节点或连线 |
| 双击 | 编辑节点文本 |
| Ctrl + 点击 | 多选对象 |

## API 集成

### 导入数据

```typescript
// 从 API 加载数据
const loadFromAPI = async (apiEndpoint: string) => {
  const response = await fetch(apiEndpoint)
  const data = await response.json()
  
  // 验证数据格式
  if (!validateFlowData(data)) {
    throw new Error('无效的数据格式')
  }
  
  // 更新画布
  setNodes(data.nodes)
  setEdges(data.edges)
}
```

### 保存数据

```typescript
// 保存到 API
const saveToAPI = async (apiEndpoint: string) => {
  const flowData = {
    nodes: getNodes.value,
    edges: getEdges.value,
    metadata: {
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  }
  
  await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(flowData)
  })
}
```

## 注意事项

1. 画布尺寸：
   - 容器必须有明确的宽高
   - 建议使用 100vw/100vh

2. 节点限制：
   - 最小宽度：100px
   - 最小高度：30px
   - 建议不超过 1000 个节点

3. 浏览器支持：
   - Chrome 最新两个版本
   - Firefox 最新两个版本
   - Safari 最新两个版本
   - Edge 最新两个版本

4. 性能优化：
   - 使用防抖处理频繁更新
   - 缓存节点尺寸信息
   - 避免不必要的重渲染 