const fs = require('fs');
fs.readFile('src/components/FlowEditor.vue', 'utf8', (err, data) => { if(err) throw err; const pattern = /\/\/ 在setup的末尾添加以下代码[\\s\\S]*?defineExpose\\({[\\s\\S]*?exportImage[\\s\\S]*?}\\)/g;
const replacement = '// 用于存储LeftSidebar组件实例的ref\nconst leftSidebarRef = ref(null);\n\n// 暴露导出图片方法\nconst exportImage = async (options = {}) => {\n  if (leftSidebarRef.value && \n      leftSidebarRef.value.canvasTools && \n      typeof leftSidebarRef.value.canvasTools.exportImage === \
function\) {\n    return leftSidebarRef.value.canvasTools.exportImage(options);\n  } else {\n    console.error(\画布工具导出功能不可用\);\n    return Promise.reject(new Error(\导出功能不可用\));\n  }\n};\n\n// 暴露组件方法\ndefineExpose({\n  exportImage\n});';
const fixedContent = data.replace(pattern, replacement); fs.writeFile('src/components/FlowEditor.vue', fixedContent, 'utf8', (err) => { if(err) throw err; console.log('成功修复FlowEditor.vue文件'); }); });
