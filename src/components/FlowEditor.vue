<script setup>
// ... 现有代码 ...

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
</script>

<template>
  <VueFlow
    v-model="elements"
    :default-zoom="1"
    :min-zoom="0.2"
    :max-zoom="4"
    no-drag-class-name="nodrag"
    no-wheel-class-name="nowheel"
    @nodeDragStart="onNodeDragStart"
    @keydown="onKeyDown"
  >
    <!-- ... 其他内容 ... -->
  </VueFlow>
</template> 