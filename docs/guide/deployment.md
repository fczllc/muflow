# 部署指南

## 环境要求

1. Node.js 版本：
   - 推荐：v16.x 或更高版本
   - 最低：v14.x

2. 包管理器：
   - npm v7+
   - yarn v1.22+
   - pnpm v6+

3. 浏览器支持：
   - Chrome >= 88
   - Firefox >= 87
   - Safari >= 14
   - Edge >= 88

## 构建步骤

1. 安装依赖：

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

2. 构建生产版本：

```bash
# 使用 npm
npm run build

# 使用 yarn
yarn build

# 使用 pnpm
pnpm build
```

3. 构建输出：
   - 构建后的文件位于 `dist` 目录
   - 包含压缩后的 JS、CSS 文件
   - 生成 sourcemap 文件（可选）

## 部署配置

1. 基本配置：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: 'src/components/FlowEditor.vue',
      name: 'FlowEditor',
      fileName: (format) => `flow-editor.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

2. 环境变量配置：

```env
# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_ASSETS_URL=https://assets.example.com
VITE_BUILD_MODE=production
```

3. Docker 部署：

```dockerfile
# Dockerfile
FROM node:16-alpine as builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

## 性能优化

1. 代码分割：
   - 使用动态导入
   - 配置合适的分块策略
   - 预加载关键模块

2. 缓存策略：
   - 配置合理的缓存时间
   - 使用内容哈希
   - 分离第三方依赖

3. 资源优化：
   - 压缩静态资源
   - 使用 CDN 加速
   - 启用 Brotli/Gzip 压缩

## 监控和日志

1. 性能监控：
   - 使用 Performance API
   - 收集关键指标
   - 设置性能预警

2. 错误跟踪：
   - 全局错误处理
   - 收集用户环境信息
   - 记录错误堆栈

3. 用户行为分析：
   - 记录操作日志
   - 统计功能使用
   - 分析性能瓶颈

## 安全配置

1. XSS 防护：
   - 过滤用户输入
   - 设置 CSP 策略
   - 使用 HttpOnly Cookie

2. CSRF 防护：
   - 验证请求来源
   - 使用 CSRF Token
   - 设置 SameSite Cookie

3. 其他安全措施：
   - 启用 HTTPS
   - 设置安全响应头
   - 限制文件上传大小

## 常见问题

1. 构建失败：
   - 检查 Node.js 版本
   - 清理依赖缓存
   - 查看构建日志

2. 性能问题：
   - 检查资源加载
   - 优化渲染性能
   - 分析内存使用

3. 兼容性问题：
   - 检查浏览器版本
   - 添加 polyfill
   - 测试不同设备 