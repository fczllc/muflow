<template>
  <div class="toolbar-icon">
    <!-- 根据类型显示不同的图标 -->
    <svg v-if="type === 'textLabel'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7V4h16v3"></path>
      <path d="M9 20h6"></path>
      <path d="M12 4v16"></path>
    </svg>
    
    <!-- 字体颜色图标 -->
    <svg v-else-if="type === 'fontColor'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round">
<path fill="#555555" d="M9.6 14L12 7.7l2.4 6.3M11 5L5.5 19h2.2l1.1-3H15l1.1 3h2.2L13 5z"/>
    </svg>
    
    <svg v-else-if="type === 'roundedRect'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
    
    <!-- 直线图标 -->
    <svg v-else-if="type === 'line'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    
    <!-- 输入节点图标 -->
    <svg v-else-if="type === 'inputNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12h8"></path>
      <path d="M21 9l-4 3 4 3V9z"></path>
      <path d="M11 5v14"></path>
    </svg>
    
    <!-- 上下连接节点图标 -->
    <svg v-else-if="type === 'topBottomNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="4" y="8" width="16" height="8" rx="2"></rect>
      <line x1="12" y1="4" x2="12" y2="8"></line>
      <line x1="12" y1="16" x2="12" y2="20"></line>
    </svg>
    
    <!-- 左右连接节点图标 -->
    <svg v-else-if="type === 'leftRightNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="4" width="8" height="16" rx="2"></rect>
      <line x1="4" y1="12" x2="8" y2="12"></line>
      <line x1="16" y1="12" x2="20" y2="12"></line>
    </svg>
    
    <!-- 输出节点图标 -->
    <svg v-else-if="type === 'outputNode'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12h-8"></path>
      <path d="M3 9l4 3-4 3V9z"></path>
      <path d="M13 5v14"></path>
    </svg>
    
    <!-- 分隔线 -->
    <svg v-else-if="type === 'separator'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="3" x2="12" y2="21"></line>
    </svg>
    
    <!-- 左对齐 -->
    <svg v-else-if="type === 'alignLeft'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M3 2v20"/><path d="M7 7.5c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C8.098 5 8.565 5 9.5 5h9c.935 0 1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549C21 6.098 21 6.565 21 7.5s0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549c-.348.201-.815.201-1.75.201h-9c-.935 0-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549C7 8.902 7 8.435 7 7.5Zm0 9c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C8.098 14 8.565 14 9.5 14h6c.935 0 1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549c.201.348.201.815.201 1.75s0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549c-.348.201-.815.201-1.75.201h-6c-.935 0-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549C7 17.902 7 17.435 7 16.5Z"/></g>
    </svg>
    
    <!-- 右对齐 -->
    <svg v-else-if="type === 'alignRight'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M21 2v20"/><path d="M17 7.5c0-.935 0-1.402-.201-1.75a1.5 1.5 0 0 0-.549-.549C15.902 5 15.435 5 14.5 5h-9c-.935 0-1.402 0-1.75.201a1.5 1.5 0 0 0-.549.549C3 6.098 3 6.565 3 7.5s0 1.402.201 1.75a1.5 1.5 0 0 0 .549.549C4.098 10 4.565 10 5.5 10h9c.935 0 1.402 0 1.75-.201a1.5 1.5 0 0 0 .549-.549C17 8.902 17 8.435 17 7.5Zm0 9c0-.935 0-1.402-.201-1.75a1.5 1.5 0 0 0-.549-.549C15.902 14 15.435 14 14.5 14h-6c-.935 0-1.402 0-1.75.201a1.5 1.5 0 0 0-.549.549C6 15.098 6 15.565 6 16.5s0 1.402.201 1.75a1.5 1.5 0 0 0 .549.549C7.098 19 7.565 19 8.5 19h6c.935 0 1.402 0 1.75-.201a1.5 1.5 0 0 0 .549-.549c.201-.348.201-.815.201-1.75Z"/></g>
    </svg>
    
    <!-- 顶对齐 -->
    <svg v-else-if="type === 'alignTop'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M2 3h20"/><path d="M7.5 7c-.935 0-1.402 0-1.75.201a1.5 1.5 0 0 0-.549.549C5 8.098 5 8.565 5 9.5v9c0 .935 0 1.402.201 1.75a1.5 1.5 0 0 0 .549.549C6.098 21 6.565 21 7.5 21s1.402 0 1.75-.201a1.5 1.5 0 0 0 .549-.549c.201-.348.201-.815.201-1.75v-9c0-.935 0-1.402-.201-1.75a1.5 1.5 0 0 0-.549-.549C8.902 7 8.435 7 7.5 7Zm9 0c-.935 0-1.402 0-1.75.201a1.5 1.5 0 0 0-.549.549C14 8.098 14 8.565 14 9.5v6c0 .935 0 1.402.201 1.75a1.5 1.5 0 0 0 .549.549c.348.201.815.201 1.75.201s1.402 0 1.75-.201a1.5 1.5 0 0 0 .549-.549c.201-.348.201-.815.201-1.75v-6c0-.935 0-1.402-.201-1.75a1.5 1.5 0 0 0-.549-.549C17.902 7 17.435 7 16.5 7Z"/></g>
    </svg>
    
    <!-- 底对齐 -->
    <svg v-else-if="type === 'alignBottom'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M2 21h20"/><path d="M7.5 17c-.935 0-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549C5 15.902 5 15.435 5 14.5v-9c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C6.098 3 6.565 3 7.5 3s1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549C10 4.098 10 4.565 10 5.5v9c0 .935 0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549C8.902 17 8.435 17 7.5 17Zm9 0c-.935 0-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549C14 15.902 14 15.435 14 14.5v-6c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C15.098 6 15.565 6 16.5 6s1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549C19 7.098 19 7.565 19 8.5v6c0 .935 0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549c-.348.201-.815.201-1.75.201Z"/></g>
    </svg>
    
    <!-- 水平居中 -->
    <svg v-else-if="type === 'alignHCenter'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M12 2v3m0 17v-3m0-5v-4"/><path d="M5 7.5c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C6.098 5 6.565 5 7.5 5h9c.935 0 1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549C19 6.098 19 6.565 19 7.5s0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549c-.348.201-.815.201-1.75.201h-9c-.935 0-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549C5 8.902 5 8.435 5 7.5Zm2 9c0-.935 0-1.402.201-1.75a1.5 1.5 0 0 1 .549-.549C8.098 14 8.565 14 9.5 14h5c.935 0 1.402 0 1.75.201a1.5 1.5 0 0 1 .549.549c.201.348.201.815.201 1.75s0 1.402-.201 1.75a1.5 1.5 0 0 1-.549.549c-.348.201-.815.201-1.75.201h-5c-.935 0-1.402 0-1.75-.201a1.5 1.5 0 0 1-.549-.549C7 17.902 7 17.435 7 16.5Z"/></g>
    </svg>
    
    <!-- 垂直居中 -->
    <svg v-else-if="type === 'alignVCenter'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M2 12h3m17 0h-3m-5 0h-4"/><path d="M7.5 5c-.935 0-1.402 0-1.75.201a1.5 1.5 0 0 0-.549.549C5 6.098 5 6.565 5 7.5v9c0 .935 0 1.402.201 1.75a1.5 1.5 0 0 0 .549.549C6.098 19 6.565 19 7.5 19s1.402 0 1.75-.201a1.5 1.5 0 0 0 .549-.549c.201-.348.201-.815.201-1.75v-9c0-.935 0-1.402-.201-1.75a1.5 1.5 0 0 0-.549-.549C8.902 5 8.435 5 7.5 5Zm9 2c-.935 0-1.402 0-1.75.201a1.5 1.5 0 0 0-.549.549C14 8.098 14 8.565 14 9.5v5c0 .935 0 1.402.201 1.75a1.5 1.5 0 0 0 .549.549c.348.201.815.201 1.75.201s1.402 0 1.75-.201a1.5 1.5 0 0 0 .549-.549c.201-.348.201-.815.201-1.75v-5c0-.935 0-1.402-.201-1.75a1.5 1.5 0 0 0-.549-.549C17.902 7 17.435 7 16.5 7Z"/></g>
    </svg>
    
    <!-- 水平均匀分布 - 更新图标 -->
    <svg v-else-if="type === 'distributeHorizontal' || type === 'distributeH'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="6" height="10" x="9" y="7" rx="2"/><path d="M4 22V2m16 20V2"/></g>    </svg>
    
    <!-- 垂直均匀分布 - 更新图标 -->
    <svg v-else-if="type === 'distributeVertical' || type === 'distributeV'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="10" height="6" x="7" y="9" rx="2"/><path d="M22 20H2M22 4H2"/></g>
    </svg>
    
    <!-- 置于顶层图标 -->
    <svg v-else-if="type === 'layerTop'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path stroke="#999999" id="svg_8" d="m1.87007,16.6922l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#fff"/>
  <path stroke="#999999" id="svg_7" d="m1.87007,11.69224l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#fff"/>
  <path stroke="#666666" id="svg_5" d="m1.87007,7.06728l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87496l-10.03116,-4.87496z" fill="#666666"/>
    </svg>
    
    <!-- 置于底层图标 -->
    <svg v-else-if="type === 'layerBottom'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path stroke="#666666" id="svg_8" d="m1.87007,16.6922l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#666666"/>
  <path stroke="#999999" id="svg_7" d="m1.87007,11.69224l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#fff"/>
  <path stroke="#999999" id="svg_5" d="m1.80757,7.06728l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87496l-10.03116,-4.87496z" fill="#ffffff"/>
    </svg>
    
    <!-- 上移一层图标 -->
    <svg v-else-if="type === 'layerUp'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path stroke="#999999" id="svg_7" d="m1.87007,16.69217l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#ffffff"/>
  <path stroke="#666666" id="svg_8" d="m1.87007,12.06721l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#666666"/>
  <path transform="rotate(89.664 11.8924 4.60031)" stroke="#999999" id="svg_10" d="m11.72421,4.60031l1.66576,-6.09531l-2.99509,6.09531l2.99509,6.0953l-1.66576,-6.0953z" fill="#999999"/>
    </svg>
    
    <!-- 线条粗细图标 -->
    <svg v-else-if="type === 'lineWidth'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
<path fill="#000000" d="M2.75 3.5a.75.75 0 0 0 0 1.5h18.5a.75.75 0 0 0 0-1.5zM2 10.75c0-.69.56-1.25 1.25-1.25h17.5a1.25 1.25 0 1 1 0 2.5H3.25C2.56 12 2 11.44 2 10.75m0 7.5c0-.966.784-1.75 1.75-1.75h16.5a1.75 1.75 0 1 1 0 3.5H3.75A1.75 1.75 0 0 1 2 18.25"/>
    </svg>
    
    <!-- 线型图标 - 实线 -->
    <svg v-else-if="type === 'lineStyleSolid'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 12" fill="none" stroke="currentColor" stroke-width="2">
     <line x1="0" y1="1" x2="30" y2="1" />
    </svg>
    
    <!-- 线型图标 - 虚线 -->
    <svg v-else-if="type === 'lineStyleDashed'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 12" fill="none" stroke="black" stroke-width="2" >
   <line x1="0" y1="3" x2="30" y2="3" stroke-dasharray="6" />
          </svg>
    
    <!-- 线型图标 - 点线 -->
    <svg v-else-if="type === 'lineStyleDotted'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 30 12" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="0" y1="5" x2="30" y2="5" stroke-dasharray="3" />
    </svg>
    
    <!-- 下移一层图标 -->
    <svg v-else-if="type === 'layerDown'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
 <path stroke="#666666" id="svg_8" d="m1.93257,13.00471l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#666666"/>
  <path stroke="#999999" id="svg_7" d="m1.74507,7.87974l10.03116,-4.87496l10.03119,4.87496l-10.03119,4.87497l-10.03116,-4.87497z" fill="#ffffff"/>
  <path transform="rotate(89.664 11.9519 20.2227)" stroke="#999999" id="svg_10" d="m12.09937,20.22272l-1.45993,-6.09531l2.625,6.09531l-2.625,6.0953l1.45993,-6.0953z" fill="#999999"/>
    </svg>
    
    <!-- 清除画布 -->
    <svg v-else-if="type === 'clear'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path fill="none" stroke="currentColor" stroke-width="2" d="M10 4a2 2 0 1 1 4 0v6h6v4H4v-4h6zM4 14h16v8H4zm12 8v-5.635M8 22v-5.635M12 22v-5.635"/>
    </svg>
    
    <!-- 导出图片 -->
    <svg v-else-if="type === 'export'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 画布外框 -->
      <rect x="3" y="3" width="18" height="18" rx="2"></rect>
      <!-- 图片标志 -->
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
    
    <!-- 保存为本地JSON图标 -->
    <svg v-else-if="type === 'save'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path fill="#000000" d="M491 299h-43l-58 42h79v128H43V341h79l-58-42H21q-8 0-14.5 6.5T0 320v149q0 18 12.5 30.5T43 512h426q18 0 30.5-12.5T512 469V320q0-8-6.5-14.5T491 299M256 0q-21 0-21 21v297l-94-77q-7-6-16-5t-14 7q-6 7-5 16t7 14l143 111l141-111q15-15 2-30q-16-14-30-2l-92 77V21q0-21-21-21m171 405q0 9-6.5 15.5T405 427q-8 0-14.5-6.5T384 405q0-8 6.5-14.5T405 384q9 0 15.5 6.5T427 405m-64 0q0 9-6.5 15.5T341 427q-8 0-14.5-6.5T320 405q0-8 6.5-14.5T341 384q9 0 15.5 6.5T363 405"/>    </svg>
    
    <!-- 导入画布图标 -->
    <svg v-else-if="type === 'import'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<g fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C4.602 14 5.068 14 6 14h.675c.581 0 .872 0 1.104.134a1 1 0 0 1 .164.118c.2.178.292.453.476 1.005l.125.376c.22.66.33.99.592 1.178c.262.189.61.189 1.306.189h3.117c.695 0 1.043 0 1.305-.189s.372-.518.592-1.178l.125-.376c.184-.552.276-.827.476-1.005a1 1 0 0 1 .164-.118c.232-.134.523-.134 1.104-.134H18c.932 0 1.398 0 1.765-.152a2 2 0 0 0 1.083-1.083C21 12.398 21 11.932 21 11"/><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 9.5L12 7m0 0l3.5 2.5M12 7v6"/></g>
    </svg>
    
    <!-- Mermaid导入图标 -->
    <svg v-else-if="type === 'mermaid'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 5v14h18V5H3z" fill="none" stroke="currentColor" stroke-width="2" />
      <path d="M7 10l2 2 2-2M7 14l2-2 2 2" stroke="currentColor" stroke-width="1.5" />
      <path d="M14 10h3M14 14h3" stroke="currentColor" stroke-width="1.5" />
      <path d="M5 3v2M19 3v2M5 19v2M19 19v2" stroke="currentColor" stroke-width="1" />
    </svg>
    
    <!-- 帮助图标 -->
    <svg v-else-if="type === 'help'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
    
    <!-- 保存到API图标 -->
    <svg v-else-if="type === 'saveToAPI'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <!-- 软盘形状 -->
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <!-- 中间的矩形 -->
      <rect x="7" y="3" width="10" height="7"></rect>
      <!-- 底部的矩形 -->
      <rect x="7" y="13" width="10" height="5"></rect>
      <!-- 添加云端标识 -->
      <path d="M3 15 L3 19"></path>
      <path d="M21 15 L21 19"></path>
    </svg>
    
    <!-- 起止节点图标 -->
    <svg v-else-if="type === 'startEnd'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="6" ry="6"></rect>
    </svg>
    
    <!-- 条件节点图标（菱形） -->
    <svg v-else-if="type === 'condition'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2L22 12L12 22L2 12L12 2"></path>
    </svg>
    
    <!-- 圆形图标节点 -->
    <svg v-else-if="type === 'circle'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
    
    <!-- 粗体图标 -->
    <svg v-else-if="type === 'bold'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor" stroke-width="0">
    <path d="M596.088471 890.277647c37.345882 0 70.354824-6.204235 98.966588-18.552471a219.557647 219.557647 0 0 0 71.981176-48.670117c19.395765-20.118588 34.032941-43.188706 43.91153-69.270588 9.878588-26.142118 14.817882-53.007059 14.817882-80.474353 0-46.622118-12.348235-86.136471-37.044706-118.543059-24.696471-32.527059-60.355765-53.609412-106.917647-63.548235V489.110588c36.020706-14.095059 63.668706-35.779765 83.124706-65.054117 19.395765-29.334588 29.093647-64.090353 29.093647-104.32753 0-38.068706-8.673882-70.174118-25.901176-96.316235a196.909176 196.909176 0 0 0-63.006118-61.379765 129.325176 129.325176 0 0 0-40.779294-15.841882 424.056471 424.056471 0 0 0-51.320471-7.951059 722.823529 722.823529 0 0 0-55.597176-3.192471c-18.672941-0.361412-36.141176-0.542118-52.404706-0.542117h-274.070588V890.277647h365.146353zM532.48 459.474824H331.474824V219.196235H532.48c21.925647 0 42.526118 1.204706 61.921882 3.734589 19.456 2.409412 36.562824 7.890824 51.380706 16.384 14.817882 8.432941 26.443294 20.48 34.936471 35.96047 8.432941 15.540706 12.649412 36.743529 12.649412 63.548235 0 40.237176-12.468706 70.354824-37.526589 90.473412-25.057882 20.118588-66.198588 30.177882-123.361882 30.177883z m50.838588 346.112H331.474824v-261.421177h229.677176c21.142588 0 41.622588 1.927529 61.44 5.782588 19.696941 3.915294 37.165176 10.601412 52.344471 20.118589 15.179294 9.577412 27.346824 22.407529 36.502588 38.671058 9.155765 16.263529 13.793882 36.683294 13.793882 61.379765 0 42.345412-12.528941 75.474824-37.586823 99.508706-25.057882 23.973647-59.813647 35.960471-104.267294 35.960471z" fill="#444444" p-id="3062"></path>    </svg>
    
    <!-- 斜体图标 -->
    <svg v-else-if="type === 'italic'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor" stroke-width="0">
      <path d="M418.133333 930.133333c-4.266667 0-4.266667 0 0 0H217.6c-17.066667 0-34.133333-12.8-34.133333-34.133333s12.8-34.133333 34.133333-34.133333h170.666667l174.933333-704H409.6c-17.066667 0-29.866667-12.8-29.866667-29.866667s12.8-34.133333 34.133334-34.133333h392.533333c17.066667 0 34.133333 12.8 34.133333 34.133333s-12.8 34.133333-34.133333 34.133333h-170.666667l-174.933333 704h157.866667c17.066667 0 34.133333 12.8 34.133333 34.133334s-12.8 34.133333-34.133333 34.133333H418.133333v-4.266667z" p-id="3462"></path>
    </svg>
    
    <!-- 下划线图标 -->
    <svg v-else-if="type === 'underline'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor" stroke-width="0">
      <path d="M512 811.296a312 312 0 0 0 312-312V89.6h-112v409.696a200 200 0 1 1-400 0V89.6h-112v409.696a312 312 0 0 0 312 312zM864 885.792H160a32 32 0 0 0 0 64h704a32 32 0 0 0 0-64z" p-id="7244"></path>
    </svg>
    
    <!-- 文本左对齐图标 -->
    <svg v-else-if="type === 'textAlignLeft'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-width="0">
      <path d="M3 5h18v2H3V5zm0 6h12v2H3v-2zm0 6h18v2H3v-2z"/>
    </svg>
    
    <!-- 文本居中对齐图标 -->
    <svg v-else-if="type === 'textAlignCenter'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-width="0">
      <path d="M3 5h18v2H3V5zm3 6h12v2H6v-2zm-3 6h18v2H3v-2z"/>
    </svg>
    
    <!-- 文本右对齐图标 -->
    <svg v-else-if="type === 'textAlignRight'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke-width="0">
      <path d="M3 5h18v2H3V5zm6 6h12v2H9v-2zm-6 6h18v2H3v-2z"/>
    </svg>
    
    <!-- 默认图标 -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, defineProps } from 'vue'

// 定义图标类型
type IconType = 
  // 工具栏图标
  | 'bold' | 'italic' | 'underline' | 'fontSize' | 'fontColor'
  // 文本对齐图标
  | 'textAlignLeft' | 'textAlignCenter' | 'textAlignRight'
  // 连线样式图标
  | 'lineWidth' | 'lineColor' | 'lineStyle' | 'arrowStyle'
  | 'lineStyleSolid' | 'lineStyleDashed' | 'lineStyleDotted' // 添加线型样式图标
  // 对齐图标
  | 'alignLeft' | 'alignRight' | 'alignTop' | 'alignBottom' | 'alignHCenter' | 'alignVCenter'
  // 分布图标
  | 'distributeHorizontal' | 'distributeVertical' | 'distributeH' | 'distributeV'
  // 画布工具图标
  | 'clear' | 'export' | 'save' | 'help'
  // 分隔线
  | 'separator' | 'divider'
  // 左侧栏控件图标
  | 'textLabel' | 'roundedRect' | 'line'
  // 新增节点类型
  | 'inputNode' | 'topBottomNode' | 'leftRightNode' | 'outputNode'
  | 'import' // 添加导入图标类型
  | 'saveToAPI' // 添加保存到API的图标类型
  | 'startEnd' | 'condition' | 'circle' // 添加新的图标类型
  | 'layerTop' | 'layerBottom' | 'layerUp' | 'layerDown' // 添加图层排列图标类型
  | 'mermaid' // 添加Mermaid导入图标类型

interface Props {
  type: IconType
  active?: boolean
}

const { type } = defineProps<Props>()
</script>

<style scoped>
.toolbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

svg {
  color: #555;
}
</style>

<script lang="ts">
export default defineComponent({
  name: 'ToolbarIcon'
})
</script> 