<!--
 * MuFlow - Vue Flow based flow chart editor
 * Copyright (c) 2024 tianyi
 * 
 * This project is based on Vue Flow (https://github.com/bcakmakoglu/vue-flow)
 * Vue Flow Copyright (c) bcakmakoglu - Released under MIT License
 * 
 * @license MIT
 -->

<template>
  <div class="app">
    <FlowViewer />
  </div>
</template>

<script setup lang="ts">
import FlowViewer from './components/FlowViewer.vue'
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
}

html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style> 