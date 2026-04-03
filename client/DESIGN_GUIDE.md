# 任务中心设计规范文档

## 1. 色彩方案

### 主色调
- **主背景**: 深蓝渐变 `from-slate-900 via-blue-900 to-slate-900`
- **男生模块主色**: 蓝色系 `from-blue-500 to-cyan-400`
- **女生模块主色**: 粉色系 `from-pink-500 to-rose-400`

### 辅助色
- **卡片背景**: `rgba(255, 255, 255, 0.08)` 带毛玻璃效果
- **卡片悬停**: `rgba(255, 255, 255, 0.12)`
- **边框色**: `rgba(255, 255, 255, 0.1)`
- **文字主色**: `#FFFFFF`
- **文字次色**: `rgba(255, 255, 255, 0.7)`
- **文字辅助**: `rgba(255, 255, 255, 0.5)`

### 强调色
- **成功/完成**: `#10B981` (绿色)
- **进行中**: `#3B82F6` (蓝色)
- **警告/困难**: `#F59E0B` (橙色)
- **错误**: `#EF4444` (红色)

## 2. 字体规范

### 字体族
- **主字体**: system-ui, -apple-system, sans-serif
- **标题字体**: 使用系统默认无衬线字体

### 字号层级
- **页面标题**: 2.5rem (40px), font-weight: 700
- **模块标题**: 1.75rem (28px), font-weight: 600
- **卡片标题**: 1.25rem (20px), font-weight: 600
- **正文**: 1rem (16px), font-weight: 400
- **辅助文字**: 0.875rem (14px), font-weight: 400
- **标签**: 0.75rem (12px), font-weight: 500

## 3. 间距系统

### 页面间距
- **页面内边距**: py-24 (96px), px-4 (16px) / sm:px-6 (24px) / lg:px-8 (32px)
- **最大宽度**: max-w-6xl (1152px)

### 组件间距
- **模块间距**: mb-16 (64px)
- **卡片内边距**: p-6 (24px)
- **卡片间距**: gap-6 (24px)
- **元素间距**: space-y-4 (16px)

## 4. 圆角规范

- **页面卡片**: rounded-3xl (24px)
- **模块卡片**: rounded-2xl (16px)
- **按钮**: rounded-full (全圆角) 或 rounded-xl (12px)
- **标签/徽章**: rounded-full (全圆角)
- **图标容器**: rounded-2xl (16px)

## 5. 阴影系统

- **卡片默认**: `shadow-lg shadow-black/20`
- **卡片悬停**: `shadow-xl shadow-black/30`
- **按钮悬停**: `shadow-lg shadow-current/30`

## 6. 动画规范

### 过渡时间
- **快速**: duration-150 (150ms)
- **正常**: duration-300 (300ms)
- **慢速**: duration-500 (500ms)

### 缓动函数
- **默认**: ease-out
- **弹性**: cubic-bezier(0.34, 1.56, 0.64, 1)
- **平滑**: cubic-bezier(0.4, 0, 0.2, 1)

### 动画效果
- **悬停上浮**: `hover:-translate-y-1`
- **缩放效果**: `hover:scale-105`
- **透明度变化**: `hover:opacity-90`

## 7. 毛玻璃效果

```css
backdrop-blur-xl
bg-white/10
border border-white/20
```

## 8. 响应式断点

- **移动端**: < 640px
- **平板**: 640px - 1024px
- **桌面**: > 1024px

## 9. 图标规范

- **尺寸**: 20px (默认), 24px (大), 16px (小)
- **颜色**: 跟随文字颜色或品牌色
- **库**: react-icons/fi

## 10. 按钮样式

### 主要按钮
- 背景: 渐变 `from-blue-500 to-cyan-400`
- 文字: 白色
- 圆角: rounded-full
- 阴影: shadow-lg shadow-blue-500/30
- 悬停: hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5

### 次要按钮
- 背景: transparent
- 边框: border-2 border-white/30
- 文字: 白色
- 悬停: hover:bg-white/10 hover:border-white/50

### 进入专版按钮
- 背景: transparent
- 边框: border-2 border-rose-500
- 文字: rose-500
- 悬停: hover:bg-rose-500 hover:text-white
