# FlowEditor 组件

流程图编辑器的主组件，提供了完整的流程图编辑功能。

## 属性 (Props)

该组件没有可配置的属性。

## 事件 (Events)

该组件内部处理所有事件，不向外部发出事件。

## 方法 (Methods)

该组件不对外暴露方法。

## VueFlow 配置

FlowEditor 组件内部对 VueFlow 进行了以下关键配置：

```vue
<VueFlow
  v-model="elements"
  :default-zoom="1"
  :min-zoom="0.2"
  :max-zoom="4"
  :node-types="nodeTypes"
  :snap-to-grid="true"
  :snap-grid="[10, 10]"
  :nodes-draggable="true"
  :nodes-connectable="true"
  :edges-updatable="true"
  :pane-movable="true"
  :pannable="true"
  :zoom-on-scroll="false"
  :zoom-on-pinch="false"
  :zoom-on-double-click="false"
  :autoPanOnNodeDrag="false"
  :node-extent-pad="0"
>
  <!-- 内容 -->
</VueFlow>
```

### 重要配置说明

1. **缩放控制**
   - `:zoom-on-scroll="false"` - 禁用鼠标滚轮缩放，提高拖拽编辑体验
   - `:zoom-on-pinch="false"` - 禁用触控板捏合缩放
   - `:zoom-on-double-click="false"` - 禁用双击缩放，避免与节点编辑冲突

2. **拖拽行为控制**
   - `:autoPanOnNodeDrag="false"` - 禁用节点拖拽时的自动平移功能，防止拖拽到边缘时画布自动移动
   - `:node-extent-pad="0"` - 设置节点边界填充为0，优化拖拽体验

3. **网格对齐**
   - `:snap-to-grid="true"` - 启用网格对齐
   - `:snap-grid="[10, 10]"` - 设置网格大小为10x10像素

## 子组件

### TopToolbar

顶部工具栏组件，提供以下功能：
- 字体样式设置（大小、颜色）
- 连线样式设置（粗细、颜色、类型、箭头）
- 对齐和分布功能
- 画布操作（清除、导出、保存、导入）

### LeftSidebar

左侧工具栏组件，提供以下功能：
- 文本标签控件
- 圆角矩形节点控件
- 直线控件

### 自定义节点

#### StartEndNode

起止节点组件，用于表示流程的开始和结束：
- 椭圆形外观
- 支持拖拽、调整大小和文本编辑
- 提供四个方向的连接点

#### RoundedRectNode

圆角矩形节点组件，支持：
- 拖拽移动
- 大小调整
- 文本编辑
- 连线锚点

#### TextLabelNode

文本标签节点组件，支持：
- 拖拽移动
- 大小调整
- 文本编辑

#### LineNode

直线节点组件，支持：
- 拖拽移动
- 长度和角度调整
- 箭头样式设置
- 线条样式设置（粗细、颜色、类型）

#### ConditionNode

条件节点组件，菱形外观：
- 拖拽移动
- 大小调整
- 文本编辑
- 连线锚点

#### CircleNode

圆形节点组件：
- 拖拽移动
- 大小调整
- 文本编辑
- 连线锚点

### AlignmentLines

对齐辅助线组件，提供：
- 水平对齐线
- 垂直对齐线
- 自动吸附功能

## 功能说明

### 节点操作

1. 创建节点
   - 从左侧工具栏拖拽控件到画布
   - 自动生成唯一 ID
   - 默认大小和样式

2. 编辑节点
   - 双击编辑文本（支持所有节点类型）
   - 拖拽调整位置
   - 拖拽边角调整大小
   - 拖拽端点调整直线长度和角度（直线节点）

3. 选择节点
   - 单击选择单个节点
   - Ctrl + 点击多选
   - 点击空白取消选择

4. 删除节点
   - 选中后按 Delete 键删除
   - 删除节点时自动删除相关连线
   
5. 编辑状态管理
   - 统一编辑状态同步机制
   - 自动清除文本选择状态
   - ESC键或点击画布退出编辑模式

### 连线操作

1. 创建连线
   - 从节点锚点拖出连线
   - 连接到目标节点锚点
   - 自动生成平滑曲线

2. 编辑连线
   - 选中后修改样式
   - 支持线条粗细、颜色、类型
   - 支持箭头样式设置

3. 删除连线
   - 选中后按 Delete 键删除

### 对齐功能

1. 对齐操作
   - 左对齐、右对齐
   - 顶对齐、底对齐
   - 水平居中、垂直居中

2. 分布操作
   - 水平均匀分布
   - 垂直均匀分布

3. 辅助对齐
   - 拖拽时显示对齐线
   - 自动吸附到对齐位置
   - 支持边缘和中心对齐

### 画布操作

1. 导出功能
   - 导出为图片
   - 导出为 JSON 文件

2. 导入功能
   - 导入 JSON 文件
   - 自动还原节点和连线

3. 其他功能
   - 清空画布
   - 保存到本地
   - API 数据交互

## 最新优化功能

1. **节点编辑交互优化**
   - 改进节点编辑状态同步机制，确保FlowEditor和节点组件之间的状态一致
   - 统一所有节点类型的编辑行为，包括StartEndNode、TextLabelNode、RoundedRectNode、ConditionNode和CircleNode
   - 添加`clearSelectionAndEditingState`函数，统一处理选择和编辑状态的清除

2. **双击冲突解决**
   - 通过`zoom-on-double-click="false"`禁用双击缩放，避免与节点编辑功能冲突
   - 保留其他缩放和导航方式，如顶部工具栏的缩放按钮

3. **自动平移禁用**
   - 通过`autoPanOnNodeDrag="false"`禁用拖拽节点时的自动平移功能
   - 添加`node-extent-pad="0"`优化节点拖拽边界行为
   - 提供更精确和可控的节点定位体验

4. **性能优化**
   - 移除仅用于调试目的的代码
   - 减少不必要的DOM监听和事件处理
   - 优化渲染性能

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl + A | 全选画布上的所有对象 |
| ESC | 取消选中状态和退出编辑模式 |
| Delete | 删除选中的节点或连线 |
| 双击 | 编辑节点文本 |
| Ctrl + 点击 | 多选对象 |
| Shift + 拖拽 | 直线角度对齐（0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°）|

## 使用示例

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