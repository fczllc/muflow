# Mermaid流程图导入功能

MuFlow现在支持从Mermaid流程图脚本导入流程图，让你可以轻松地将现有的Mermaid定义转换为交互式Vue Flow流程图。

## 功能特点

- 支持从Mermaid flowchart脚本导入流程图
- 支持TB/TD/LR三种方向的流程图
- 支持五种常用节点类型：默认节点、圆角矩形、体育场形状、圆形和菱形
- 支持连线标签和样式
- 自动布局节点，无需手动调整位置

## 支持的Mermaid节点类型

MuFlow支持以下Mermaid节点类型映射：

| Mermaid节点类型 | Mermaid语法示例 | MuFlow节点类型 |
| -------------- | -------------- | ------------ |
| 默认节点 | `id` 或 `id[文本]` | 圆角矩形节点 |
| 圆角矩形 | `id(文本)` | 圆角矩形节点 |
| 体育场形状 | `id([文本])` | 起止节点 |
| 圆形 | `id((文本))` | 圆形节点 |
| 菱形 | `id{文本}` | 条件节点 |

## 支持的连线样式

MuFlow支持以下Mermaid连线样式映射：

| Mermaid连线 | 形态 | MuFlow样式 |
| ----------- | ---- | ---------- |
| 普通线 | `---` | 实线 |
| 加粗线 | `===` | 粗实线 |
| 点状线 | `-.-` | 点线 |

## 使用方法

### 手动导入

1. 点击左侧工具栏中的"导入Mermaid"按钮
2. 在弹出的对话框中粘贴Mermaid流程图脚本
3. 点击"确认"按钮完成导入

### API导入

也可以通过API调用导入Mermaid流程图：

```javascript
// 获取FlowEditor组件的引用
const flowEditor = this.$refs.flowEditor;

// 导入Mermaid脚本
const script = `flowchart LR
    A[开始] --> B{条件}
    B -->|是| C(处理)
    B -->|否| D(跳过)
    C --> E[结束]
    D --> E`;

const result = flowEditor.importMermaidFlowchart(script);
if (result.success) {
  console.log('导入成功！');
} else {
  console.error('导入失败：', result.message);
}
```

## 限制说明

- 不支持子图(subgraph)
- 不支持BT/RL方向的流程图
- 不支持节点背景色、边框样式等样式属性
- 不支持复杂的连线类型
- 节点标签最多支持200行

## 示例

这里有一些常用的Mermaid流程图示例，可以复制使用：

```
flowchart LR
    A[开始] --> B{是否满足条件?}
    B -->|是| C(处理数据)
    B -->|否| D(跳过处理)
    C --> E[结束]
    D --> E
```

```
flowchart TD
    A[开始] --> B[初始化]
    B --> C{检查数据}
    C -->|有效| D[处理数据]
    C -->|无效| E[报错]
    D --> F[保存结果]
    E --> G[记录日志]
    F --> H[结束]
    G --> H
```

更多示例可以在`public/mermaid-test.html`页面中查看。

## 故障排除

如果导入过程中遇到问题，请检查：

1. 确保Mermaid脚本包含`flowchart`关键字和有效的方向(TB, TD, LR)
2. 确保节点ID唯一
3. 确保没有使用不支持的节点类型或连线类型
4. 确保脚本行数不超过200行 