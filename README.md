# 苹果应用价格对比网站

一个现代化的Web应用，用于比较全球苹果商店应用的订阅价格，支持实时汇率转换。

## 功能特性

- 🔍 **智能搜索**: 搜索任何苹果商店应用
- 💰 **价格对比**: 比较不同国家的应用价格
- 💱 **实时汇率**: 自动转换为统一货币进行比较
- 📊 **可视化表格**: 直观显示价格差异和节省金额
- 🔄 **实时更新**: 汇率和价格数据自动更新
- 📱 **响应式设计**: 支持桌面和移动端

## 技术栈

- **前端**: Next.js 14 + TypeScript
- **样式**: Tailwind CSS + Shadcn/ui
- **数据库**: SQLite + Prisma ORM
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **部署**: Vercel

## 部署到 Vercel

### 准备工作

1. 确保您有 [Vercel](https://vercel.com) 账号
2. 将项目推送到 GitHub 仓库

### 部署步骤

1. **连接 GitHub 仓库**
   - 登录 Vercel 控制台
   - 点击 "New Project"
   - 选择您的 GitHub 仓库

2. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   DATABASE_URL=file:./dev.db
   ```

3. **部署**
   - Vercel 会自动检测 Next.js 项目
   - 点击 "Deploy" 开始部署
   - 等待构建完成

### 自动任务配置

项目已配置 Vercel Cron Jobs，每6小时自动更新汇率数据：
- 路径: `/api/update?type=quick`
- 频率: 每6小时执行一次

### 手动更新数据

部署完成后，您可以通过以下API端点手动更新数据：

```bash
# 更新汇率
curl -X POST "https://your-app.vercel.app/api/update" \
  -H "Content-Type: application/json" \
  -d '{"type":"exchange-rates"}'

# 更新热门应用价格
curl -X POST "https://your-app.vercel.app/api/update" \
  -H "Content-Type: application/json" \
  -d '{"type":"popular-apps"}'

# 完整更新
curl -X POST "https://your-app.vercel.app/api/update" \
  -H "Content-Type: application/json" \
  -d '{"type":"full"}'
```

## 本地开发

### 安装依赖
```bash
npm install
```

### 初始化数据库
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 启动开发服务器
```bash
npm run dev
```

### 更新汇率数据
```bash
curl -X POST "http://localhost:3000/api/update" \
  -H "Content-Type: application/json" \
  -d '{"type":"exchange-rates"}'
```

## API 端点

### 搜索应用
```
GET /api/search?term={搜索词}&limit={结果数量}
```

### 获取应用价格
```
GET /api/prices?bundleId={应用包名}&refresh={是否刷新}
```

### 汇率转换
```
GET /api/exchange-rates?action=convert&from={源货币}&to={目标货币}
```

### 数据更新
```
POST /api/update
Body: {"type": "exchange-rates|popular-apps|full"}
```

## 项目结构

```
src/
├── app/
│   ├── api/           # API 路由
│   ├── globals.css    # 全局样式
│   └── page.tsx       # 主页面
├── components/        # React 组件
├── services/          # 业务逻辑服务
├── types/             # TypeScript 类型定义
└── generated/         # Prisma 生成的客户端
```

## 数据库结构

- **App**: 应用信息
- **Country**: 国家和货币信息  
- **Price**: 价格数据
- **ExchangeRate**: 汇率数据

## 注意事项

1. **数据来源**: 使用 iTunes Search API 获取应用信息
2. **汇率API**: 使用免费的 exchangerate-api.com
3. **速率限制**: 已添加适当的请求延迟避免被限制
4. **缓存策略**: 实现了智能数据刷新机制

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
