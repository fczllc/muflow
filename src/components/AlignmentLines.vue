<template>
  <div class="alignment-lines">
    <div
      v-for="line in lines"
      :key="line.id"
      class="alignment-line"
      :class="line.type"
      :style="{
        [line.type === 'vertical' ? 'left' : 'top']: `${line.position}px`,
        [line.type === 'vertical' ? 'height' : 'width']: '100%'
      }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AlignmentLines'
})
</script>

<script setup lang="ts">
defineProps<{
  lines: Array<{
    id: string
    type: 'horizontal' | 'vertical'
    position: number
  }>
}>()
</script>

<style scoped>
.alignment-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.alignment-line {
  position: absolute;
  pointer-events: none;
  border: none;
}

.vertical {
  width: 0;
  transform: translateX(-50%);
  border-left: 1px dotted #999999;
}

.horizontal {
  height: 0;
  transform: translateY(-50%);
  border-top: 1px dotted #999999;
}
</style> 