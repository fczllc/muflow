<template>
  <div class="app">
    <FlowEditor />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import FlowEditor from './components/FlowEditor.vue'

export default defineComponent({
  name: 'App',
  components: {
    FlowEditor
  }
})
</script>

<style>
.app {
  width: 100vw;
  height: 100vh;
}
</style> 