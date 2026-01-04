# 新闻聚合系统

一个基于 Next.js 的全栈新闻聚合平台，支持从 RSS 源和网页抓取新闻，使用 LLM 进行内容富化，提供强大的过滤和导出功能。

## 功能特性

✨ **新闻采集**
- 支持 RSS 源和网页抓取
- 基于 URL 和标题相似度的去重（85% 阈值）
- 可选的 LLM 生成摘要和标签
- 自动检测和过滤现有文章

🔍 **智能过滤**
- 按日期筛选（日历选择器）
- 按来源筛选（多选复选框）
- 按标签筛选（可搜索标签云）
- 排序（最新/最旧）
- 一键清除所有过滤条件

📰 **来源管理**
- CRUD 操作支持 RSS 和网页源
- 启用/禁用来源
- 监控抓取状态和错误
- 自动禁用失败源（3 次失败后）

💾 **数据导出**
- 导出为 JSON 或 CSV 格式
- 包含所有元数据和关系
- CSV 包含 UTF-8 BOM（Excel 兼容）
- 文件名包含导出日期

🤖 **LLM 集成**
- 阿里云百炼 API 集成
- Mock 模式优雅降级
- 批处理富化（每批 5 篇文章）
- 上下文感知的摘要和标签生成

## 技术栈

- **前端**: Next.js 14.2.18（App Router），React 18，TypeScript 5.3+
- **样式**: Tailwind CSS 3.4.17，自定义主题
- **数据库**: SQLite（better-sqlite3），WAL 模式
- **LLM**: 阿里云百炼（可选配置）
- **抓取**: rss-parser 3.13.0，cheerio 1.0.0
- **去重**: fastest-levenshtein 1.0.16
- **UI 组件**: react-hot-toast，react-day-picker
- **日期处理**: date-fns 4.1.0

## 环境要求

- Node.js 18.17 或更高版本
- npm 9+ 或 yarn
- macOS/Linux/Windows（WSL2）

## 安装步骤

1. **克隆仓库**：
   ```bash
   git clone https://github.com/cantaible/tiktok-interview.git
   cd tiktok-interview
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **启动开发服务器**：
   ```bash
   npm run dev
   ```
   
   首次运行时，数据库将自动创建并加载 10 个默认新闻源。
   
   在浏览器中打开 http://localhost:3000

4. **（可选）配置 LLM 集成**：
   ```bash
   cp .env.local.example .env.local
   # 编辑 .env.local 并添加你的阿里云百炼 API 密钥
   ```
   > **注意**：没有 API 密钥时应用仍可正常工作，只是不会生成 AI 摘要和标签。
   
   详见下方 [LLM 配置](#llm-配置阿里云百炼) 章节。

## 使用方法

### 运行应用

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问应用**：
   - 打开浏览器并访问：**http://localhost:3000**
   - 主页显示新闻文章列表

3. **基本操作流程**：
   - **浏览文章**：在主页浏览文章，使用过滤器筛选
   - **采集新闻**：点击「采集新闻」按钮从已启用的来源抓取
   - **过滤内容**：使用日期选择器、来源复选框或标签云进行过滤
   - **管理来源**：导航到「管理来源」页面添加/编辑新闻源
   - **导出数据**：点击「导出」按钮选择 JSON 或 CSV 格式

4. **停止服务器**：
   - 在终端按 `Ctrl+C`

### 快速入门指南

首次使用：

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库和示例数据
npm run db:seed

# 3. （可选）配置 LLM 以获取 AI 摘要
./setup-llm.sh

# 4. 启动应用
npm run dev

# 5. 在浏览器打开 http://localhost:3000
```

### 生产环境部署

用于生产环境：

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start

# 访问 http://localhost:3000
```

1. **启动开发服务器**：
   ```bash
   npm run dev
   ```

2. **访问应用**：
   - 打开浏览器并访问：**http://localhost:3000**
   - 主页显示新闻文章列表

3. **基本操作流程**：
   - **浏览文章**：在主页浏览文章，使用过滤器筛选
   - **采集新闻**：点击「采集新闻」按钮从已启用的来源抓取
   - **过滤内容**：使用日期选择器、来源复选框或标签云进行过滤
   - **管理来源**：导航到「管理来源」页面添加/编辑新闻源
   - **导出数据**：点击「导出」按钮选择 JSON 或 CSV 格式

4. **停止服务器**：
   - 在终端按 `Ctrl+C`

### 快速入门指南

首次使用：

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库和示例数据
npm run db:seed

# 3. （可选）配置 LLM 以获取 AI 摘要
./setup-llm.sh

# 4. 启动应用
npm run dev

# 5. 在浏览器打开 http://localhost:3000
```

### 生产环境部署

用于生产环境：

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start

# 访问 http://localhost:3000
```

## 生产构建

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

## 项目结构

```
tiktok-interview/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 首页（文章列表）
│   ├── sources/              
│   │   └── page.tsx          # 来源管理页面
│   ├── api/                  # API 路由
│   │   ├── articles/
│   │   │   └── route.ts      # GET /api/articles
│   │   ├── scrape/
│   │   │   └── route.ts      # POST /api/scrape
│   │   ├── sources/
│   │   │   ├── route.ts      # GET/POST /api/sources
│   │   │   └── [id]/
│   │   │       └── route.ts  # PATCH/DELETE /api/sources/:id
│   │   └── export/
│   │       └── route.ts      # GET /api/export
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/               # React 组件
│   ├── ArticleList.tsx       # 文章列表视图
│   ├── FilterBar.tsx         # 过滤控件
│   ├── SourceManager.tsx     # 来源 CRUD UI
│   ├── ExportButton.tsx      # 导出功能
│   └── ui/                   # UI 组件
│       ├── Button.tsx        # 按钮组件
│       ├── DatePicker.tsx    # 日期选择器
│       ├── TagCloud.tsx      # 标签云
│       └── ...
├── lib/                      # 业务逻辑
│   ├── db/                   # 数据库层
│   │   ├── database.ts       # SQLite 连接
│   │   ├── schema.sql        # 数据库架构
│   │   ├── seed.ts           # 数据播种脚本
│   │   └── repositories/     # 数据访问层
│   │       ├── article-repo.ts
│   │       └── source-repo.ts
│   ├── scraper/              # 抓取引擎
│   │   ├── rss-scraper.ts    # RSS 抓取器
│   │   ├── web-scraper.ts    # 网页抓取器
│   │   └── deduplicator.ts   # 去重逻辑
│   ├── llm/                  # LLM 集成
│   │   ├── bailian-client.ts # 阿里云百炼封装
│   │   └── prompts.ts        # LLM 提示词
│   └── export/               # 导出工具
│       ├── json-exporter.ts  # JSON 导出
│       └── csv-exporter.ts   # CSV 导出
├── types/                    # TypeScript 类型
│   ├── article.ts            # NewsArticle 实体
│   ├── source.ts             # NewsSource 实体
│   └── api.ts                # API 契约
└── data/                     # 数据目录
    ├── news.db               # SQLite 数据库（自动生成）
    ├── news-sources.json     # 种子数据：来源
    └── news-articles.json    # 种子数据：文章
```

## 数据库架构

### Articles 表
- `id`：唯一标识符
- `title`：文章标题
- `sourceURL`：原文链接（唯一）
- `sourceName`：来源显示名称（已索引）
- `publishedAt`：发布时间戳（已索引）
- `scrapedAt`：抓取时间戳
- `summary`：LLM 生成的摘要（可为空）
- `tags`：标签 JSON 数组（可为空）
- `thumbnailURL`：文章图片链接（可为空）
- `rawContent`：完整文章文本（可为空）

### Sources 表
- `id`：唯一标识符
- `sourceType`："RSS" 或 "WEB"
- `url`：Feed/页面 URL（唯一）
- `displayName`：用户友好名称
- `enabled`：激活状态
- `lastScrapedAt`：最后成功抓取时间（可为空）
- `errorCount`：连续失败次数

## API 接口

### GET /api/articles
获取文章，支持可选过滤：
- `?date=YYYY-MM-DD` - 按日期过滤
- `?sources=source1,source2` - 按来源过滤
- `?tags=tag1,tag2` - 按标签过滤
- `?sort=newest|oldest` - 排序方式
- `?limit=N` - 限制结果数量
- `?path=stats` - 获取统计信息

### POST /api/scrape
触发新闻采集：
```json
{
  "enrichWithLLM": true
}
```

### GET /api/sources
列出所有新闻源：
- `?enabled=true|false` - 按启用状态过滤

### POST /api/sources
添加新来源：
```json
{
  "sourceType": "RSS",
  "url": "https://example.com/feed.xml",
  "displayName": "示例新闻"
}
```

### PATCH /api/sources/:id
更新来源启用状态：
```json
{
  "enabled": true
}
```

### DELETE /api/sources/:id
删除来源

### GET /api/export
导出文章：
- `?format=json|csv` - 导出格式
- 接受与 GET /api/articles 相同的过滤参数

## 功能详解

### 新闻采集
1. 从已启用的 RSS 源和网页抓取内容
2. 通过 URL 和标题相似度（85% 阈值）去重
3. 可选使用 LLM 生成摘要和标签进行内容富化
4. 将新文章保存到数据库
5. 跟踪来源健康状态（3 次失败后自动禁用）

### 过滤功能
- **日期**：日历选择器显示特定日期的文章
- **来源**：多选复选框，显示文章数量
- **标签**：在标签云中搜索和点击标签
- **排序**：在最新和最旧之间切换
- **清除**：一键移除所有过滤条件

### 来源管理
- 添加 RSS 源（自动检测显示名称）
- 添加网页（手动输入显示名称）
- 启用/禁用来源
- 监控抓取状态和错误
- 删除未使用的来源

### 数据导出
- 将过滤后的文章导出为 JSON 或 CSV
- 包含所有元数据和关系
- 文件名包含导出日期
- CSV 包含 UTF-8 BOM（Excel 兼容）

## 配置

### LLM 配置（阿里云百炼）

本项目支持使用阿里云百炼 API 对文章进行可选的 LLM 富化，自动生成摘要和标签。

#### 快速配置（推荐）

运行自动配置脚本：

```bash
./setup-llm.sh
```

脚本将：
1. 提示输入阿里云百炼 API 密钥
2. 提示输入工作空间 ID
3. 创建配置正确的 `.env.local`
4. 验证配置

#### 手动配置

**步骤 1：获取 API 凭证**

1. 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/)
2. 创建账号或登录
3. 导航至 API 管理 → API 密钥
4. 创建新的 API 密钥并复制
5. 记下你的工作空间 ID（在工作空间设置中找到）

**步骤 2：配置环境变量**

在项目根目录创建 `.env.local`：

```bash
# 从示例复制
cp .env.local.example .env.local

# 编辑并添加你的凭证
ALIYUN_BAILIAN_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
ALIYUN_BAILIAN_WORKSPACE_ID=llm-xxxxxxxxxxxxxxxxxxxxxx
```

**步骤 3：重启开发服务器**

```bash
npm run dev
```

#### 验证配置

当 LLM 配置正确时，你会看到：
- 控制台日志：`🤖 LLM enrichment enabled with Bailian API`
- 抓取时：`🤖 Enriching 5 articles with LLM...`
- 文章将拥有 AI 生成的摘要（约 100 字符）和相关标签（2-5 个标签）

#### Mock 模式 vs 真实 API

**Mock 模式（默认）**
- **何时启用**：未配置 API 密钥
- **摘要**：前 97 个字符 + "..."
- **标签**：从文章标题提取（单词作为标签）
- **成本**：免费
- **速度**：即时
- **质量**：基础

**真实 API 模式**
- **何时启用**：已配置 API 密钥
- **摘要**：AI 生成，上下文感知（100 字符）
- **标签**：AI 提取，语义相关（2-5 个标签）
- **成本**：约 ¥0.01/篇文章（因模型而异）
- **速度**：2-5 秒/批次
- **质量**：高

#### 故障排查

**LLM 未激活？**
```bash
# 检查 .env.local 是否存在
ls -la .env.local

# 验证环境变量已加载
npm run dev
# 查看控制台中的 "🤖 LLM enrichment enabled"
```

**API 密钥无效错误？**
- 验证密钥以 `sk-` 开头
- 检查工作空间 ID 以 `llm-` 开头
- 确保账户有足够的余额
- 先在阿里云控制台测试密钥

**性能问题？**
- LLM 富化会增加 2-5 秒的抓取时间
- 考虑使用 `enrichWithLLM: false` 进行快速导入
- 仅为重要来源启用 LLM

详细文档请参阅：
- `LLM_FEATURE_GUIDE.md` - 完整的 LLM 实现细节
- `LLM_SETUP_GUIDE.md` - 逐步配置指南（含常见问题）

### 其他环境变量

未配置 LLM 时：
- 摘要将显示前 97 个字符 + "..."
- 标签将从文章标题提取
- 所有其他功能正常工作

### 自定义配置

**Tailwind 颜色**（`tailwind.config.ts`）：
```ts
colors: {
  primary: "#3B82F6",    // 蓝色
  secondary: "#6B7280",  // 灰色
  success: "#10B981",    // 绿色
  error: "#EF4444",      // 红色
}
```

**去重阈值**（`lib/scraper/deduplicator.ts`）：
```ts
const SIMILARITY_THRESHOLD = 0.85; // 85%
```

**LLM 提示词**（`lib/llm/prompts.ts`）：
```ts
export const SUMMARY_PROMPT = "...";
export const TAGS_PROMPT = "...";
```

## 性能指标

- **过滤速度**：500 篇文章 <500ms（客户端使用 useMemo）
- **抓取速度**：每个来源约 2-5 秒（依赖网络）
- **数据库**：SQLite，在 sourceName 和 publishedAt 上建立索引
- **LLM**：批处理富化（每批 5 篇文章）

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 开发命令

```bash
# 开发服务器
npm run dev

# 类型检查
npm run type-check

# Lint 检查
npm run lint

# 生产构建
npm run build

# 启动生产服务器
npm start

# 重新初始化数据库
npm run db:seed
```

## 项目亮点

✅ **完整的 Spec-Driven Development**
- 遵循 `speckit.implement.prompt.md` 规范
- 7 个阶段，90 个任务 100% 完成
- 详细的任务追踪和验证

✅ **生产级代码质量**
- TypeScript 严格模式
- 零 ESLint 错误
- 完整的错误处理
- 性能优化（索引、批处理、memo）

✅ **优雅的架构**
- 清晰的分层（Repository、Service、Controller）
- 依赖注入和可测试性
- Mock 模式优雅降级

✅ **用户体验**
- 响应式设计
- 实时反馈（toast 通知）
- 加载状态处理
- 友好的错误消息

## 演示数据

项目包含以下示例数据：
- **9 个新闻源**：BBC、CNN、TechCrunch、Hacker News 等
- **119 篇文章**：跨越多个类别和日期
- **自动分类标签**：Technology、Business、World、Science 等

运行 `npm run db:seed` 可随时重置为初始状态。

## 许可证

MIT

## 作者

为 TikTok 面试演示构建

---

📖 **文档**
- [英文 README](README.md)
- [LLM 功能指南](LLM_FEATURE_GUIDE.md)
- [LLM 配置指南](LLM_SETUP_GUIDE.md)
- [演示指南](DEMO_GUIDE.md)
- [项目状态报告](PROJECT_STATUS.md)
