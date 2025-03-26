<!--
 * MermaidImportModal.vue
 * 用于导入Mermaid流程图脚本的对话框组件
 -->

<template>
  <div v-if="show" class="modal-overlay">
    <div class="mermaid-import-modal">
      <div class="modal-header">
        <h3>导入Mermaid流程图</h3>
        <button class="close-btn" @click="$emit('cancel')">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="mermaid-script">请粘贴Mermaid流程图脚本（限制200行）</label>
          <textarea 
            id="mermaid-script" 
            v-model="mermaidScript" 
            class="mermaid-textarea"
            placeholder="粘贴Mermaid flowchart脚本代码..."
            @input="validateInput"
          ></textarea>
          <div v-if="error" class="error-message">{{ error }}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="$emit('cancel')">取消</button>
        <button 
          class="confirm-btn" 
          @click="handleConfirm" 
          :disabled="!!error || !mermaidScript.trim()"
        >确认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineEmits, defineProps } from 'vue'

// 定义组件属性
const props = defineProps<{
  show: boolean
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm', script: string): void
}>()

// 组件状态
const mermaidScript = ref('')
const error = ref('')

// 监听显示状态变化，重置表单
watch(() => props.show, (newVal) => {
  if (newVal) {
    mermaidScript.value = ''
    error.value = ''
  }
})

// 验证输入
const validateInput = () => {
  const script = mermaidScript.value
  
  // 检查长度限制
  const lineCount = script.split('\n').length
  if (lineCount > 200) {
    error.value = '脚本超过200行不能解析'
    return
  }
  
  // 检查是否包含flowchart关键字
  if (script.trim() && !script.includes('flowchart')) {
    error.value = '非flowchart类型'
    return
  }
  
  error.value = ''
}

// 提交表单
const handleConfirm = () => {
  if (error.value || !mermaidScript.value.trim()) return
  
  // 发送确认事件
  emit('confirm', mermaidScript.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mermaid-import-modal {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  color: #999;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #333;
}

.mermaid-textarea {
  width: 100%;
  min-height: 250px;
  padding: 12px;
  font-family: monospace;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.error-message {
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
}

.modal-footer {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #333;
}

.confirm-btn {
  background-color: #4caf50;
  color: white;
}

.confirm-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MermaidImportModal'
})
</script> 