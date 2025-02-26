<script setup>
// ... 现有代码 ...

import { useVueFlow } from '@vue-flow/core';
import { ref, nextTick, shallowRef } from 'vue';
import { VueFlow, Panel, Background, MiniMap, Controls } from '@vue-flow/core';
import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';

// 导入自定义节点组件
import RoundedRectNode from './Nodes/RoundedRectNode.vue';
import TextLabelNode from './Nodes/TextLabelNode.vue';

const { onNodeClick, onEdgeClick, addEdges, onConnect, onConnectStart, onConnectEnd } = useVueFlow();

const connectingRef = ref(false);

// 定义节点类型
const nodeTypes = {
  roundedRect: RoundedRectNode,
  textLabel: TextLabelNode
};

// 监听连线完成事件，强制刷新状态
onConnect((params) => {
  console.log('连线创建:', params);
  
  // 为连线添加默认样式
  const newEdge = {
    ...params,
    // 使用圆角阶梯式连线（更美观）
    type: 'smoothstep', 
    style: { 
      stroke: '#555',
      strokeWidth: 2,
    },
    // 可以为每个边添加自定义数据
    data: {
      savedLineWidth: 2,
      savedLineColor: '#555',
      savedLineStyle: 'solid'
    },
    // 根据需要设置箭头
    markerEnd: {
      type: 'arrow',
      color: '#555'
    }
  };
  
  // 添加边到画布
  addEdges([newEdge]);
});

// 使用正确的事件处理钩子
onEdgeClick(({ edge }) => {
  console.log(`Edge ${edge.id} clicked via Vue Flow event system`);
  // 在这里处理边被点击的逻辑
});

// 自定义节点拖动行为
const onNodeDragStart = (event, node) => {
  // 如果节点处于编辑状态，则阻止拖动
  if (event.target.closest('.edit-input') || 
      event.target.tagName === 'INPUT' || 
      event.target.tagName === 'TEXTAREA' ||
      node.data.isEditing) {
    event.preventDefault()
    return false
  }
}

// 自定义键盘事件处理
const onKeyDown = (event) => {
  // 如果焦点在编辑输入框内，则不处理Delete键
  if (event.key === 'Delete' && 
      (document.activeElement.tagName === 'INPUT' || 
       document.activeElement.tagName === 'TEXTAREA')) {
    return
  }
  
  // 其他键盘事件处理...
}

onConnectStart(() => {
  connectingRef.value = true;
});

onConnect(() => {
  // 确保所有连接状态正确更新
  nextTick(() => {
    connectingRef.value = false;
  });
});
</script>

<template>
  <VueFlow
    v-model="elements"
    :default-zoom="1"
    :min-zoom="0.2"
    :max-zoom="4"
    :node-types="nodeTypes"
    no-drag-class-name="nodrag"
    no-wheel-class-name="nowheel"
    @nodeDragStart="onNodeDragStart"
    @keydown="onKeyDown"
  >
    <!-- 不再需要自定义边组件的插槽 -->
    <!-- <template #edge-custom="props">
      <CustomEdge v-bind="props" />
    </template> -->
    
    <!-- 其他内容保持不变 -->
    <Background 
      pattern-color="#aaa" 
      :gap="20"
    />
    
    <!-- 其他面板和控件 -->
  </VueFlow>
</template> 