<template>
  <div class="app">
    <TopToolbar />
    <div class="main-content">
      <LeftSidebar />
      <FlowEditor />
    </div>
  </div>
</template>

<script setup lang="ts">
import TopToolbar from './components/Toolbar/TopToolbar.vue'
import LeftSidebar from './components/Sidebar/LeftSidebar.vue'
import FlowEditor from './components/FlowEditor/index.vue'
</script>

<style>
.app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style> 