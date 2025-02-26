<template>
  <div class="line-style-toolbar">
    <div class="toolbar-section">
      <div class="toolbar-title">线条粗细</div>
      <select v-model="lineWidth" @change="applyLineStyle">
        <option value="1">1px</option>
        <option value="2">2px</option>
        <option value="3">3px</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">线条颜色</div>
      <input type="color" v-model="lineColor" @change="applyLineStyle">
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">线条类型</div>
      <select v-model="lineType" @change="applyLineStyle">
        <option value="solid">实线</option>
        <option value="dashed">虚线</option>
        <option value="dotted">点线</option>
      </select>
    </div>
    
    <div class="toolbar-section">
      <div class="toolbar-title">箭头样式</div>
      <select v-model="arrowStyle" @change="applyLineStyle">
        <option value="none">无箭头</option>
        <option value="source">起点箭头</option>
        <option value="target">终点箭头</option>
        <option value="both">双向箭头</option>
      </select>
    </div>
  </div>
</template> 