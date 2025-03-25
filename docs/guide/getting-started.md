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
   - 支持文本标签、圆角矩形和直线三种节点
   - 节点自动生成唯一 ID

3. 编辑节点：
   - 双击节点编辑文本（文本标签和圆角矩形节点）
   - 拖拽节点调整位置
   - 拖拽边角调整大小（文本标签和圆角矩形节点）
   - 拖拽端点调整直线长度和角度（直线节点）
   - 按住 Shift 拖拽直线端点可启用角度对齐（每45度）

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
   - 设置字体大小（文本标签和圆角矩形节点）
   - 设置字体颜色（文本标签和圆角矩形节点）
   - 设置直线粗细（直线节点）
   - 设置直线颜色（直线节点）
   - 设置直线类型（直线节点）
   - 设置箭头样式（直线节点）

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

### 工具按钮配置

可以通过配置控制工具栏按钮的显示/隐藏：

```vue
<template>
  <div class="flow-container">
    <FlowEditor>
      <LeftSidebar :buttons="{
        // 基本操作
        clear: true,      // 清除画布
        help: true,       // 帮助说明
        
        // 文件操作
        export: true,     // 导出图片
        import: true,     // 导入JSON
        
        // 保存操作
        saveLocal: true,  // 保存到本地
        saveAPI: true     // 保存到API
      }" />
    </FlowEditor>
  </div>
</template>
```

按钮配置说明：
1. 所有按钮默认显示
2. 可以选择性地隐藏不需要的按钮
3. 未指定的按钮保持默认显示状态
4. 建议根据实际使用场景配置合适的按钮组合

常见配置场景：

1. 本地使用模式：
```typescript
const buttons = {
  clear: true,
  export: true,
  import: true,
  saveLocal: true,
  saveAPI: false,  // 隐藏API保存
  help: true
}
```

2. API集成模式：
```typescript
const buttons = {
  clear: true,
  export: true,
  import: false,    // 隐藏本地导入
  saveLocal: false, // 隐藏本地保存
  saveAPI: true,    // 启用API保存
  help: true
}
```

3. 只读模式：
```typescript
const buttons = {
  clear: false,   // 禁用清除
  export: true,   // 允许导出
  import: false,  // 禁用导入
  saveLocal: false, // 禁用保存
  saveAPI: false,  // 禁用API
  help: true
}
```

## 最新优化功能

### 节点编辑状态同步

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

退出编辑模式时自动清除文本选择：

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

### 统一处理选择和编辑状态

FlowEditor组件中添加了统一处理函数：

```typescript
// 清除选择和编辑状态的通用函数
const clearSelectionAndEditingState = () => {
  // 清除文本选择
  window.getSelection()?.removeAllRanges()
  
  // 查找处于编辑状态的节点并重置
  const editingNodes = getNodes.value.filter(node => node.data?.isEditing)
  if (editingNodes.length > 0) {
    editingNodes.forEach(node => {
      updateNode(node.id, {
        data: {
          ...node.data,
          isEditing: false
        }
      })
    })
  }
  
  // 取消所有节点和边的选择
  if (getNodes.value.some(node => node.selected) || getEdges.value.some(edge => edge.selected)) {
    setNodes(getNodes.value.map(node => ({ ...node, selected: false })))
    setEdges(getEdges.value.map(edge => ({ ...edge, selected: false })))
  }
}
```

这个函数在以下情况下被调用：
- 点击画布空白区域时
- 按下ESC键时
- 双击画布空白区域时

### 禁用双击缩放和自动平移

为了提供更好的编辑体验，VueFlow组件配置进行了以下优化：

```vue
<VueFlow
  :zoom-on-double-click="false"  <!-- 禁用双击缩放，避免与节点编辑冲突 -->
  :autoPanOnNodeDrag="false"     <!-- 禁用节点拖拽时的自动平移 -->
  :node-extent-pad="0"           <!-- 优化节点拖拽边界行为 -->
  <!-- 其他配置 -->
>
  <!-- 内容 -->
</VueFlow>
```

这些配置改进了以下用户体验：
1. 双击节点时不再触发画布缩放，只进入编辑模式
2. 拖拽节点到画布边缘时不再自动移动画布
3. 提供更精确和可控的节点定位体验

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + A | 全选画布上的所有对象 |
| ESC | 取消选中状态和退出编辑模式 |
| Delete | 删除选中的节点或连线 |
| 双击 | 编辑节点文本 |
| Ctrl + 点击 | 多选对象 |
| Shift + 拖拽 | 直线角度对齐（每45度） |

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