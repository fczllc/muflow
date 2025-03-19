<template>
  <div class="edge-label-dialog-overlay" @click.self="cancel">
    <div class="edge-label-dialog">
      <div class="dialog-header">
        <h3>编辑连线标签</h3>
      </div>
      <div class="dialog-body">
        <input 
          ref="inputRef"
          v-model="localLabel"
          type="text" 
          class="label-input"
          @keydown.enter="confirm"
          @keydown.esc="cancel"
          placeholder="请输入标签文本"
        />
      </div>
      <div class="dialog-footer">
        <button class="cancel-btn" @click="cancel">取消</button>
        <button class="confirm-btn" @click="confirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EdgeLabelDialog'
})
</script>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  edge: {
    type: Object,
    required: true
  },
  label: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['confirm', 'cancel'])

// 创建本地响应式变量存储标签值
const localLabel = ref(props.label)
const inputRef = ref<HTMLInputElement | null>(null)

// 确认按钮处理
const confirm = () => {
  emit('confirm', localLabel.value)
}

// 取消按钮处理
const cancel = () => {
  emit('cancel')
}

// 组件挂载后自动聚焦输入框
onMounted(async () => {
  await nextTick()
  if (inputRef.value) {
    inputRef.value.focus()
    inputRef.value.select()
  }
})
</script>

<style scoped>
.edge-label-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.edge-label-dialog {
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 350px;
  max-width: 90%;
  overflow: hidden;
}

.dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.label-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.label-input:focus {
  border-color: #4096ff;
  box-shadow: 0 0 0 2px rgba(64, 150, 255, 0.1);
}

.dialog-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

button {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.confirm-btn {
  background-color: #1677ff;
  color: white;
}

.confirm-btn:hover {
  background-color: #4096ff;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.cancel-btn:hover {
  background-color: #e6e6e6;
}
</style> 