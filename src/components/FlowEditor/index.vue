<template>
  <div class="flow-editor">
    <VueFlow v-model="elements" class="flow-viewport" @dragover="onDragOver" @drop="onDrop">
      <Background />
      <Controls />
      <MiniMap />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent } from 'vue'
import { VueFlow } from '@vue-flow/core'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const elements = ref([])

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent) => {
  // 实现节点创建逻辑
}
</script>

<style>
html, body {
  margin: 0;
  height: 100%;
}

#app {
  height: 100%;
}
</style>

<style scoped>
.flow-editor {
  width: 100%;
  height: 100%;
  position: relative;
}

.flow-viewport {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}
</style>

<script lang="ts">
export default defineComponent({
  name: 'FlowEditor'
})
</script> 