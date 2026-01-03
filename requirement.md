一、产品背景（Product Background）

业务痛点（Pain Points）

在科技/商业信息快速变化的环境下，用户需要高频获取多源新闻，但常见问题包括：

信息分散在多个站点与RSS源，手动订阅与整理成本高。

缺乏结构化筛选与去重，信息噪声大、重复多。

不能快速形成可读的摘要与要点，阅读效率低。

价值主张（Value Proposition）

构建一个"Local News Harvester"（MVP），在无需部署服务器的前提下，实现本地运行的新闻抓取、清洗、去重与展示。该产品将把分散的网页/RSS信息转化为结构化新闻卡片，并提供基础的摘要与标签能力，使用户能更高效完成"Collect→Filter→Read→Export"的闭环。

二、产品功能描述（Functional Requirements）

本MVP需包含以下核心模块，确保端到端（End-to-End）流程跑通：

1） 数据源配置与输入（Input Layer）

功能：允许用户添加新闻源，至少支持两类：

1） RSS/Atom链接（推荐）

2） 普通网页URL（抓取列表页或频道页）

支持中/英内容源混合

2） 本地抓取与处理（Processing Layer）

抓取：

可手动触发"立即抓取"

清洗与结构化：

对每条新闻抽取：标题、来源、发布时间、链接、摘要（可由LLM生成）、封面图（如可获取）

去重：

至少实现"URL去重+标题相似度去重"其中一种或两种组合

轻量AI能力（加分项，非必须，若使用则必须调用LLM API）

对每条新闻生成一句话摘要（1-sentence summary）

为新闻自动打2-5个标签（tags）

注： AI能力必须通过阿里云百炼调用（详见约束）


3) 结构化展示与交互  (Presentation Layer)

新闻列表： 卡片式布局  (Cards)，包含标题、来源、时间、摘要、标签

筛选与排序：

按时间排序  (并支持选择日期跳转到当日新闻)
按来源筛选  (如"机器之心"、"量子位")
按标签/关键词筛选  (如"OpenAI"、"NVIDIA")


4) 本地存储与导出  (Local Persistence & Export)

本地数据库/文件持久化  (任选其一即可)：
SQLite (推荐) 或 IndexedDB 或本地JSON文件

导出：

导出为JSON或CSV  (至少一种)
导出内容包含： 标题、链接、来源、时间、摘要、标签


三、 产品开发方法限制 (Development Constraints)

候选人必须严格遵循以下开发范式与技术栈约束，我们将评估过程而非仅仅是结果：

1. 核心范式： Spec-Driven Development (规格驱动开发)

原则： 禁止直接编写业务代码。必须先产出自然语言的技术规格文档  (Spec)，再由AI基于Spec生成
代码。

参考标准：

GitHub Spec Kit:  https://github.com/github/spec-kit
或使用Kiro  (kiro.dev)  编写.kiro文件

考核点： 我们不仅运行你的代码，更会审查你的 spec.md 或 .kiro 文件。考察你是否能将模糊的业务
需求转化为 AI 可理解的精确技术指令。


2. 开发工具： AI-Native Tooling

必须使用Cursor  (Composer Mode)、  Claude Code  (CLI)、  Windsurf或类似AI辅助编程工具完
成。

评估重点是你与AI辅助编程的熟悉度，和通过修改Spec纠错的能力。
3. 模型接入： 阿里云百炼（Aliyun Bailian）

API 要求： 后端 LLM 能力必须接入阿里云百炼平台（https://bailian.console.aliyun.com/）。
建议模型： 推荐申请并使用 DeepSeek-V3、 DeepSeek-R1 或 Qwen-Max (通义千问) 的免费/试用
API 额度。

技术要求： 需妥善处理 API Key 的安全性（如使用 .env 环境变量），严禁硬编码Key 到代码库中。

四、交付文档要求（Deliverables）

请将以下内容打包提交（GitHub Repo或压缩包），并包含README.md作为总索引：
交付物A： 技术规格说明书（The Spec）
文件： spec.md或.kiro
必须包含：
Data Models（Schema： NewsItem、 Source、 Tag、 UserState等）
抓取与去重策略说明
API Interface定义（本地函数/路由也算接口）
UI组件层级描述（页面/组件树）

交付物B： 源代码（Source Code）
代码库： 完整的前后端代码（推荐栈： Next.js/React + FastAPI/Python 或 纯前端Serverless 方案）
可运行性： 需包含 requirements.txt 或 package.json，确保面试官能通过简单指令（如npm run
dev）启动项目。必须能在本地运行，不依赖自建后端服务器对外提供服务。允许的形态包括：
纯前端（浏览器内抓RSS/公开 API）+本地存储
Next.js本地运行（仅本机，不需要部署到云端）
桌面端本地App（可选）

交付物C： 开发复盘报告（Process Documentation）
列出使用的工具（Cursor等）与模型（DeepSeek-V3等）
开发流程复盘：
描述你是如何定义 Prompt/Spec 来引导 AI 的？
关键修正（Crucial Fixes）： 列出 1-2 个 AI 生成错误、但你通过修改 Spec 成功修正的案例。（此部分
体现你作为“架构师”而非“码农”思考能力）
交付物D: 运行证据 (Proof of Work)

截图/录屏至少3张：

Spec编写界面截图

AI工具生成代码过程截图

App运行成功并展示抓取结果的界面截图