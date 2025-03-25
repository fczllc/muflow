# LeftSidebar 组件

左侧工具栏组件，提供节点控件和画布工具。

## 属性 (Props)

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| buttons | ButtonsConfig | 见下方 | 控制画布工具按钮的显示/隐藏 |

### ButtonsConfig 类型定义

```typescript
interface ButtonsConfig {
  clear?: boolean    // 清除画布按钮
  export?: boolean   // 导出图片按钮
  import?: boolean   // 导入JSON按钮
  saveLocal?: boolean // 保存为本地JSON按钮
  saveAPI?: boolean  // 保存到API按钮
  help?: boolean     // 帮助按钮
}

// 默认值
const defaultButtons = {
  clear: true,
  export: true,
  import: true,
  saveLocal: true,
  saveAPI: true,
  help: true
}
```

## 事件 (Events)

该组件不向外部发出事件。

## 方法 (Methods)

该组件不对外暴露方法。

## 控件列表

### 节点控件

提供可拖拽的节点控件：

| 控件 | 类型 | 说明 |
|------|------|------|
| 文本标签 | textLabel | 纯文本节点，支持多行文本编辑 |
| 圆角矩形 | roundedRect | 带边框的矩形节点，支持连线 |
| 直线 | line | 可调整长度和角度的直线节点 |

### 画布工具

位于底部的画布操作工具：

| 工具 | 功能 | 说明 |
|------|------|------|
| 清除画布 | 清除所有内容 | 有确认提示 |
| 导出图片 | 导出为 JPG | 自动计算区域 |
| 导入文件 | 导入 JSON 数据 | 支持拖拽导入 |
| 保存文件 | 保存为 JSON | 包含完整数据 |
| 帮助 | 显示帮助信息 | 包含快捷键说明 |

## 拖拽功能

组件提供以下拖拽功能：

1. 拖拽数据格式：
   ```typescript
   interface DragData {
     type: 'textLabel' | 'roundedRect' | 'line'
     dataTransfer: 'application/vueflow'
   }
   ```

2. 拖拽事件：
   - dragstart: 开始拖拽，设置数据和效果
   - drag: 拖拽过程中，更新位置
   - dragend: 拖拽结束，清理状态

3. 拖拽效果：
   - 鼠标样式变为 move
   - 拖拽时显示半透明预览
   - 放置时自动计算位置

## 样式定制

组件样式可通过 CSS 变量定制：

```css
:root {
  /* 工具栏样式 */
  --sidebar-width: 40px;
  --sidebar-bg: #ffffff;
  --sidebar-border: #e0e0e0;
  
  /* 按钮样式 */
  --btn-size: 32px;
  --btn-hover-bg: #f5f5f5;
  --btn-active-bg: #e0e0e0;
  
  /* 图标样式 */
  --icon-color: #666666;
  --icon-size: 16px;
}
```

## 使用示例

1. 默认显示所有按钮：
```vue
<LeftSidebar />
```

2. 自定义显示特定按钮：
```vue
<LeftSidebar :buttons="{
  clear: true,
  export: true,
  import: false,    // 隐藏导入按钮
  saveLocal: true,
  saveAPI: false,   // 隐藏保存到API按钮
  help: true
}" />
```

3. 只显示最基本的按钮：
```vue
<LeftSidebar :buttons="{
  clear: true,
  saveLocal: true,
  help: true
}" /> 