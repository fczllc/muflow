<!--
 * @Description: 
 * @Author: tianyi
 * @Date: 2025-02-23 11:47:44
 * @LastEditors: tianyi
 * @LastEditTime: 2025-02-23 18:46:05
 * @FilePath: \muflow\readme.md
-->
# MuFlow

一个基于 Vue 3 的简洁流程图编辑器组件。

## 声明

- 本项目基于 [Vue Flow](https://github.com/bcakmakoglu/vue-flow) 开发，Vue Flow 是一个强大的 Vue 3 流程图组件库。
- 本项目主要用于制作简易流程图的需求，适合以组件形式的嵌入到用户系统做简单的流程图的绘制，并提供保存为本地Json文件和保存到API的功能。

### 致谢

特别感谢 [Vue Flow](https://github.com/bcakmakoglu/vue-flow) 的作者 [bcakmakoglu](https://github.com/bcakmakoglu) 提供了如此优秀的开源项目。本项目在 Vue Flow 的基础上进行了以下扩展：

- 添加了对齐和分布功能
- 增强了节点编辑功能
- 提供了更多的样式设置选项
- 添加了本地存储和 API 集成功能
- 实现了完整的工具栏

### 使用的开源项目

- [Vue Flow](https://github.com/bcakmakoglu/vue-flow) - MIT License
  - 用于实现流程图的核心功能
  - 包括节点渲染、连线处理、画布缩放等基础功能
  - 版本：1.42.1

### 许可证

本项目采用 MIT 许可证，与 Vue Flow 保持一致。完整的许可证文本请参见 [LICENSE](LICENSE) 文件。

## 项目进度

### ✅ 第一阶段：环境搭建与 Vue Flow 集成
- [x] 搭建 Vue 3.4.19 + TypeScript 开发环境
- [x] 安装 Vue Flow 核心库
- [x] 在静态 UI 页面的主画布窗口区域集成 Vue Flow 组件
- [x] 实现 Vue Flow 画布的基本渲染

### ✅ 第二阶段：静态 UI 页面实现
- [x] 实现顶部工具栏布局
  - [x] Logo 区域
  - [x] 样式设置工具区域（字体、线框、连线、对齐分布）
  - [x] 画布操作工具区域（清除、导出、保存）
- [x] 实现左侧控件栏布局
  - [x] 文字标签控件图标
  - [x] 圆角矩形节点控件图标
- [x] 实现主画布窗口布局
- [x] 完成所有工具图标的 SVG 实现

### ✅ 第三阶段：基础功能实现
- [x] 实现左侧控件栏的控件拖拽到画布上创建节点的功能
- [x] 实现基本的矩形节点和连线拖拽绘制功能
- [x] 实现节点的选中、拖动和删除功能
- [x] 实现节点间连接线选中、拖拽、删除功能
- [x] 实现控件大小调整和文字自适应

### ✅ 第四阶段：样式定制与增强功能
- [x] 实现文件标签控件编辑功能
- [x] 实现控件连线样式设置功能
- [x] 完善控件连线操作
- [x] 实现双击编辑节点文字功能
- [x] 优化工具栏图标设计
- [x] 完善工具栏布局和交互

### ✅ 第五阶段：对齐功能
- [x] 多选对象对齐功能
  - [x] 左对齐、右对齐、上对齐、下对齐
  - [x] 水平居中、垂直居中
  - [x] 水平均匀分布、垂直均匀分布
  - [x] 支持两个及以上节点的对齐
  - [x] 支持三个及以上节点的分布
- [x] 拖动时的辅助对齐线
  - [x] 水平和垂直方向的对齐辅助线
  - [x] 淡灰色点状线样式
  - [x] 边缘对齐和中心点对齐
  - [x] 实时显示和隐藏
- [x] 靠近辅助线时的吸附功能
  - [x] 5px 范围内自动吸附
  - [x] 支持边缘和中心点吸附
  - [x] 平滑的吸附效果
- [x] 快捷键功能
  - [x] Ctrl + A：全选画布上所有对象
  - [x] ESC：取消选中状态
  - [x] Del：删除选中的节点或连线
  - [x] 双击：编辑节点文本
  - [x] Ctrl + 点击：多选对象

### 🚀 第六阶段：测试与优化
- [x] 功能测试
  - [x] 节点操作测试（创建、编辑、删除、拖拽、调整大小）
  - [x] 连线操作测试（创建、编辑样式、删除）
  - [x] 对齐功能测试（单个对齐、多选对齐、分布）
  - [x] 画布操作测试（导入、导出、清除、保存）
  - [x] 快捷键测试（全选、取消、删除、多选）
  - [x] API 接口测试（数据加载、保存）
- [x] 兼容性测试
  - [x] 浏览器兼容性测试（Chrome、Firefox、Safari、Edge）
  - [x] 设备兼容性测试（桌面端、平板）
  - [x] 分辨率适配测试（不同屏幕尺寸）
- [x] 性能优化
  - [x] 大量节点和连线时的渲染性能
  - [x] 拖拽和对齐时的响应性能
  - [x] 内存占用优化
  - [x] 资源加载优化
- [x] 代码优化
  - [x] TypeScript 类型定义完善
  - [x] 组件代码重构和复用
  - [x] 错误处理和异常捕获
  - [x] 代码注释和文档
- [x] 文档完善
  - [x] 组件 API 文档
  - [x] 使用说明文档
  - [x] 示例代码
  - [x] 部署文档

### ✅ 第七阶段：组件拆分与功能扩展
- [x] 拆分编辑器和查看器组件
  - [x] FlowEditor 组件（完整编辑功能）
  - [x] FlowViewer 组件（纯展示功能）
- [x] FlowViewer 组件功能
  - [x] 只读模式展示
  - [x] 禁用所有编辑操作
  - [x] 支持画布缩放和平移
  - [x] 自适应画布大小
  - [x] API数据加载
  - [x] 错误提示功能
  - [x] 保持原有样式

## 开发环境

- Vue 3.4.19
- TypeScript
- Vite
- Vue Flow

## 项目设置

### 开发环境配置
```bash
# 克隆项目
git clone https://github.com/yourusername/muflow.git

# 进入项目目录
cd muflow

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 浏览器兼容性要求

支持以下主流浏览器的最新两个版本：
- Chrome (推荐)
- Firefox
- Safari
- Edge

### 设备兼容性要求

支持以下设备类型：
- 桌面端
  - Windows (1920x1080及以上)
  - macOS (Retina显示屏)
  - Linux
- 平板设备 (建议横屏使用)
  - iPad (1024x768及以上)
  - Android平板 (1280x800及以上)

### 最低系统要求
- 操作系统：
  - Windows 10及以上
  - macOS 10.15及以上
  - 主流Linux发行版
- 处理器：支持ES6的现代浏览器
- 内存：4GB及以上
- 显示器：1366x768及以上分辨率

### 兼容性测试清单

#### 1. 浏览器功能测试
- [x] Chrome
  - [x] 节点拖拽创建
  - [x] 连线绘制
  - [x] 对齐功能
  - [x] 样式设置
  - [x] 快捷键操作
  - [x] 导入导出
  
- [x] Firefox
  - [x] 节点拖拽创建
  - [x] 连线绘制
  - [x] 对齐功能
  - [x] 样式设置
  - [x] 快捷键操作
  - [x] 导入导出
  
- [ ] Safari
  - [ ] 节点拖拽创建
  - [ ] 连线绘制
  - [ ] 对齐功能
  - [ ] 样式设置
  - [ ] 快捷键操作
  - [ ] 导入导出
  
- [x] Edge
  - [x] 节点拖拽创建
  - [x] 连线绘制
  - [x] 对齐功能
  - [x] 样式设置
  - [x] 快捷键操作
  - [x] 导入导出

#### 2. 设备适配测试
- [x] 桌面端
  - [x] 1920x1080分辨率
  - [x] 2K分辨率
  - [x] 4K分辨率
  - [x] 多显示器设置
  
- [ ] 平板设备
  - [ ] iPad横屏
  - [ ] iPad竖屏
  - [ ] Android平板横屏
  - [ ] Android平板竖屏

#### 3. 系统兼容性测试
- [ ] Windows系统
  - [ ] 触控操作
  - [ ] 高DPI显示
  - [ ] 系统缩放
  
- [ ] macOS系统
  - [ ] 触控板手势
  - [ ] Retina显示
  - [ ] 系统缩放
  
- [ ] Linux系统
  - [ ] 基本功能
  - [ ] 显示适配

#### 4. 性能兼容性测试
- [x] 低配置设备
  - [x] 节点渲染性能
  - [x] 拖拽响应性
  - [x] 内存占用
  
- [ ] 高配置设备
  - [ ] 大量节点处理
  - [ ] 复杂连线渲染
  - [ ] 多节点对齐性能

### 已知兼容性问题

| 问题描述 | 影响范围 | 解决方案 | 状态 |
|---------|---------|---------|------|
| 待添加... | | | |

### 兼容性测试结果记录

| 测试项 | Chrome | Firefox | Safari | Edge |
|--------|---------|----------|---------|------|
| 节点操作 | ✓ | ✓ | - | - |
| 连线操作 | ✓ | ✓ | - | - |
| 对齐功能 | ✓ | ✓ | - | - |
| 样式设置 | ✓ | ✓ | - | - |
| 快捷键 | ✓ | ✓ | - | - |
| 导入导出 | ✓ | ✓ | - | - |

### 性能基准

| 操作 | 期望响应时间 | 最大可接受时间 |
|------|------------|--------------|
| 节点创建 | <100ms | 200ms |
| 连线绘制 | <50ms | 100ms |
| 对齐操作 | <100ms | 200ms |
| 画布缩放 | <50ms | 100ms |
| 样式应用 | <50ms | 100ms |
| 文件导入 | <1s | 2s |

注：✓ 表示测试通过，- 表示未测试，× 表示测试未通过

### 画布工具

- [x] 可配置的工具按钮
  - [x] 清除画布
  - [x] 导出图片
  - [x] 导入 JSON
  - [x] 保存为本地 JSON
  - [x] 保存到 API
  - [x] 帮助说明
  - [x] 按钮显示控制

## 使用说明

### 基本使用

#### FlowEditor 组件
```vue
<template>
  <div class="flow-container">
    <FlowEditor />
  </div>
</template>
```

#### FlowViewer 组件
用于只读展示流程图，支持从API加载数据：

```vue
<template>
  <div class="flow-container">
    <FlowViewer 
      :flowId="currentFlowId"
      :apiUrl="apiBaseUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FlowViewer from './components/FlowViewer.vue'

const currentFlowId = ref('flow-123')
const apiBaseUrl = 'https://your-api-base-url'
</script>
```

### FlowViewer 组件特性

1. 只读模式
   - 禁用节点拖拽
   - 禁用连线编辑
   - 禁用选择功能
   - 保持原有样式显示

2. 视图控制
   - 支持画布缩放（鼠标滚轮）
   - 支持画布平移（鼠标拖动）
   - 自动适应画布大小
   - 缩放范围：0.1x - 2x

3. 数据加载
   - 支持API数据加载
   - 自动验证数据格式
   - 错误信息显示
   - 实时数据更新

4. 错误处理
   - 数据格式错误提示
   - API加载失败提示
   - 友好的错误信息展示
   - 清晰的错误状态展示

### 组件属性

#### FlowViewer Props

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| flowId | string | 否 | - | 流程图ID，用于从API加载数据 |
| apiUrl | string | 否 | - | API基础URL，用于构建完整的API请求地址 |

### 使用示例

1. 基础用法：
```vue
<FlowViewer flowId="flow-123" />
```

2. 完整配置：
```vue
<FlowViewer
  flowId="flow-123"
  apiUrl="https://api.example.com"
/>
```

3. 动态加载：
```vue
<template>
  <FlowViewer :flowId="currentFlowId" />
  <button @click="loadNextFlow">加载下一个流程图</button>
</template>

<script setup>
import { ref } from 'vue'

const currentFlowId = ref('flow-1')

const loadNextFlow = () => {
  currentFlowId.value = 'flow-2' // 切换到新的流程图
}
</script>
```

### 注意事项

1. API 格式要求
   - 接口路径：`/api/flows/${flowId}`
   - 返回格式：标准的 Vue Flow 数据格式
   - 必须包含 nodes 和 edges 数组

2. 数据格式要求
   - 节点必须包含：id、type、position
   - 边必须包含：id、source、target
   - 支持的节点类型：roundedRect、textLabel

3. 性能考虑
   - 大量节点时会自动优化显示
   - 建议节点数量控制在 1000 个以内
   - 连线数量建议控制在 2000 条以内

