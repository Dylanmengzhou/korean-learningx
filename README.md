# 延世韩语学习平台

[![Next.js](https://img.shields.io/badge/Next.js-13.5+-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-brightgreen?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-blue?logo=tailwind-css)](https://tailwindcss.com/)

基于《延世韩国语》教材的智能化韩语学习平台，提供单词记忆、听写测试、学习进度跟踪等核心功能。

## ✨ 核心功能

### 📚 单词学习系统
- 延世教材1-6册完整词库
- 智能听写测试（中韩互译）
- 实时答题状态跟踪（认识/不认识/模糊）
- 学习进度自动保存
- 错题本自动生成

### 👤 用户系统
- 邮箱注册/登录
- 个人资料管理
- VIP会员专属内容
- 学习数据云端同步
- 密码找回与重置

### 📊 数据可视化
- 学习进度饼状图
- 按册数掌握程度分析
- 实时数据统计看板
- 历史学习趋势图表

### 🎯 VIP特权
- 无限制访问所有教材内容
- 详细学习数据分析
- 专属学习计划定制
- 优先体验新功能

## 🛠️ 技术栈

**前端框架**
Next.js 13+ (App Router) | React 18 | TypeScript

**样式设计**
Tailwind CSS | Shadcn/ui | Framer Motion

**数据管理**
Prisma | PostgreSQL | NextAuth

**可视化**
Recharts | Nivo

**工具链**
Zod 表单验证 | bcrypt 加密 | react-hot-toast

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 14+
- PNPM

### 安装步骤
克隆仓库
git clone https://github.com/your-repo/yonsei-korean-platform.git
安装依赖
pnpm install
配置环境变量
cp .env.example .env
数据库迁移
pnpm prisma migrate dev
启动开发服务器
pnpm dev

## 📖 使用指南

1. **单词测试**
   - 选择教材册数 → 选择单元 → 开始听写
   - 支持中韩互译模式切换
   - 实时保存答题状态

2. **个人中心**
   - 修改昵称/邮箱
   - 查看学习统计
   - 管理会员订阅

3. **数据看板**
   - 查看各册掌握程度
   - 分析学习趋势
   - 导出学习报告

## 🤝 贡献指南

欢迎提交PR或issue！请确保：
1. 代码符合ESLint规范
2. 提交信息遵循Conventional Commits
3. 新功能需附带单元测试

## 📄 许可证

MIT License © 2024 [Your Name]