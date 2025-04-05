# FlowEditor 组件

流程图编辑器的主组件，提供了完整的流程图编辑功能。

## 属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| canvasTools | CanvasToolsConfig | 见下方 | 配置画布工具按钮的可见性 |

```typescript
// 画布工具配置接口
interface CanvasToolsConfig {
  clear?: boolean;    // 清除按钮
  export?: boolean;   // 导出图片按钮
  import?: boolean;   // 导入数据按钮
  saveLocal?: boolean; // 本地保存按钮
  saveAPI?: boolean;  // API保存按钮
  help?: boolean;     // 帮助按钮
  mermaid?: boolean;  // Mermaid导入按钮
}

// 默认值
{
  clear: true,
  export: true,
  import: true,
  saveLocal: true,
  saveAPI: true,
  help: true,
  mermaid: true
}
```

## 事件 (Events)

该组件内部处理所有事件，不向外部发出事件。

## 暴露的方法 (Methods)

组件通过 `defineExpose` 暴露以下方法，可以通过 ref 引用调用：

| 方法名 | 参数 | 返回值 | 说明 |
|--------|------|--------|------|
| getFlowData | 无 | Object | 获取当前流程图的完整数据 |
| exportFlowData | 无 | void | 导出流程图数据为JSON文件 |
| exportImage | format?: 'jpg'\|'png' | Promise<string\|null> | 导出流程图为图片并自动下载 |
| importFlowData | file: File | Promise<boolean> | 从JSON文件导入流程图数据 |
| saveToAPI | apiEndpoint: string, options?: RequestInit | Promise<boolean> | 保存流程图数据到API |
| loadFromAPI | apiEndpoint: string, options?: RequestInit | Promise<boolean> | 从API加载流程图数据 |
| getDataUrl | format?: 'jpg'\|'png', download?: boolean | Promise<string\|null> | 获取流程图的数据URL，可选是否下载 |
| importFlowDataFromJson | jsonData: string | Promise<boolean> | 从JSON字符串导入流程图数据 |
| saveToJsonProperty | propertyName: string | void | 将流程图数据保存到指定的JSON属性中 |
| exportFlowAsBlobAndHeight | 导出流程图为Blob对象并返回高度 | 无 | Promise<{ blob: Blob; height: number } \| null> |
| fitView | 自动调整视图以显示所有内容 | padding?: number | void |

```typescript
// 可以在TypeScript中这样定义FlowEditor暴露的方法类型
interface FlowEditorMethods {
  getFlowData: () => Object;
  exportFlowData: () => void;
  exportImage: (format?: 'jpg' | 'png') => Promise<string | null>;
  importFlowData: (file: File) => Promise<boolean>;
  saveToAPI: (apiEndpoint: string, options?: RequestInit) => Promise<boolean>;
  loadFromAPI: (apiEndpoint: string, options?: RequestInit) => Promise<boolean>;
  getDataUrl: (format?: 'jpg' | 'png', download?: boolean) => Promise<string | null>;
  exportFlowAsBlobAndHeight: () => Promise<{ blob: Blob; height: number } | null>;
  importFlowDataFromJson: (jsonData: string) => Promise<boolean>;
  saveToJsonProperty: (propertyName: string) => void;
  fitView: (padding?: number) => void;
}
```

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
   - 通过`autoPanOnNodeDrag="false"`禁用拖拽节点时的自动平移功能，防止拖拽到边缘时画布自动移动
   - 添加`node-extent-pad="0"`优化节点拖拽边界行为
   - 提供更精确和可控的节点定位体验

4. **性能优化**
   - 移除仅用于调试目的的代码
   - 减少不必要的DOM监听和事件处理
   - 优化渲染性能

5. **组件配置能力增强**
   - 支持通过`props`传递配置参数
   - 集成依赖注入机制实现子组件配置
   - 提供`canvasTools`参数配置画布工具按钮的可见性

6. **API方法暴露**
   - 暴露关键方法供外部调用，如`getFlowData`、`exportFlowData`、`getDataUrl`等
   - 提供类型定义支持TypeScript类型检查
   - 支持通过ref引用调用组件方法

7. **导出图像能力增强**
   - 支持导出为JPG/PNG格式
   - 优化导出图像质量和精度
   - 实现基于有效内容区域的智能裁剪，自动计算流程图实际内容的边界
   - 添加20px边距，确保导出图像美观
   - 设置1:1像素比例，避免图像失真

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

### 基本使用

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

### 配置画布工具按钮

```vue
<template>
  <div class="app">
    <FlowEditor 
      :canvasTools="{
        clear: true,
        export: true,
        import: true,
        saveLocal: true,
        saveAPI: false, // 禁用API保存按钮
        help: true
      }" 
    />
  </div>
</template>
```

### 使用暴露的方法

```vue
<template>
  <div class="app">
    <FlowEditor ref="flowEditorRef" />
    <div class="custom-controls">
      <button @click="exportFlowData">导出流程图</button>
      <button @click="getImageData">获取图片</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FlowEditor from './components/FlowEditor.vue';

// 定义FlowEditor暴露的方法类型
interface FlowEditorMethods {
  exportFlowData: () => void;
  getDataUrl: (format?: 'jpg' | 'png', download?: boolean) => Promise<string | null>;
}

// 获取FlowEditor实例的引用
const flowEditorRef = ref<InstanceType<typeof FlowEditor> | null>(null);

// 自定义导出方法
const exportFlowData = () => {
  if (flowEditorRef.value) {
    // 使用类型断言
    const flowEditor = flowEditorRef.value as unknown as FlowEditorMethods;
    flowEditor.exportFlowData();
  }
};

// 获取图片数据URL
const getImageData = async () => {
  if (flowEditorRef.value) {
    const flowEditor = flowEditorRef.value as unknown as FlowEditorMethods;
    const dataUrl = await flowEditor.getDataUrl('png', false);
    console.log('图片数据URL:', dataUrl);
    // 可以进一步处理图片数据...
  }
};
</script>
```

### 导出流程图为Blob并获取高度

```vue
<template>
  <div class="app">
    <FlowEditor ref="flowEditorRef" />
    <button @click="exportFlowWithHeight">导出流程图</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FlowEditor from './components/FlowEditor.vue';

interface FlowEditorMethods {
  exportFlowAsBlobAndHeight: () => Promise<{ blob: Blob; height: number } | null>;
}

const flowEditorRef = ref<InstanceType<typeof FlowEditor> | null>(null);

const exportFlowWithHeight = async () => {
  if (flowEditorRef.value) {
    const flowEditor = flowEditorRef.value as unknown as FlowEditorMethods;
    const result = await flowEditor.exportFlowAsBlobAndHeight();
    
    if (result) {
      const { blob, height } = result;
      
      // 使用Blob创建一个临时URL
      const url = URL.createObjectURL(blob);
      
      // 创建一个下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = `flow-${height}px.png`;
      link.click();
      
      // 清理临时URL
      URL.revokeObjectURL(url);
      
      console.log('流程图高度:', height);
    } else {
      console.log('流程图为空或导出失败');
    }
  }
};
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
}
</style>
```

这个示例展示了如何：
1. 获取流程图的Blob数据和高度
2. 将Blob数据转换为可下载的文件
3. 在文件名中包含流程图的高度信息
4. 处理空画布的情况

## 方法列表

### 基础方法

| 方法名           | 描述                      | 参数                    | 返回值               |
|-----------------|--------------------------|------------------------|---------------------|
| getFlowData     | 获取当前流程图数据          | 无                     | FlowData 对象        |
| clearFlowData   | 清空当前流程图数据         | 无                      | void                |
| exportFlowData  | 将流程图导出为JSON文件     | 无                      | void                |
| getDataUrl      | 获取流程图的图片数据URL    | format?: 'jpg'/'png', download?: boolean | Promise<string/null> |
| fitView         | 自动调整视图以显示所有内容  | padding?: number       | void                |

### 数据导入导出

| 方法名           | 描述                      | 参数                    | 返回值               |
|-----------------|--------------------------|------------------------|---------------------|
| importFlowData  | 从文件导入流程图数据       | file: File             | Promise<boolean>    |
| saveToAPI       | 将流程图数据保存至API端点  | apiEndpoint: string, options?: RequestInit | Promise<boolean> |
| loadFromAPI     | 从API端点加载流程图数据    | apiEndpoint: string, options?: RequestInit | Promise<boolean> |
| importMermaidFlowchart | 导入Mermaid流程图脚本 | script: string | { success: boolean; message?: string } |

### 节点和边处理
