<template>
  <div class="logo">
    <span class="logo-text">Flow Editor</span>
  </div>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
  border-right: 1px solid var(--border-color);
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-color);
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Logo'
})
</script> 