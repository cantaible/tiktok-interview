# 阿里云 DashScope API 快速配置指南

## ✅ 已完成的修改

1. ✅ 安装了 `openai` 包
2. ✅ 重写了 `lib/llm/bailian-client.ts` 使用 DashScope 的 OpenAI 兼容 API
3. ✅ 更新了环境变量配置（`.env.local.example`）
4. ✅ 创建了 `.env.local` 模板文件

## 🚀 如何配置

### 第一步：获取 API Key

1. 访问阿里云控制台：https://dashscope.console.aliyun.com/
2. 登录你的阿里云账号
3. 在控制台中创建 API-KEY
4. 复制生成的 API Key（格式类似：`sk-xxxxxx`）

### 第二步：配置环境变量

编辑项目根目录的 `.env.local` 文件：

```bash
# 阿里云 DashScope API 配置
DASHSCOPE_API_KEY=sk-your-actual-api-key-here

# 可选：指定模型（默认为 qwen-plus）
# DASHSCOPE_MODEL=qwen-plus
```

**替换 `sk-your-actual-api-key-here` 为你实际的 API Key**

### 第三步：选择模型（可选）

你可以通过设置 `DASHSCOPE_MODEL` 环境变量来选择不同的模型：

- `qwen-turbo` - 最快速，成本最低
- `qwen-plus` - **默认选项**，平衡性能和成本
- `qwen-max` - 最强性能
- `qwen-max-longcontext` - 支持长文本

如果不设置，默认使用 `qwen-plus`。

### 第四步：重启开发服务器

```bash
# 如果服务器正在运行，按 Ctrl+C 停止
npm run dev
```

## ✨ 新实现的功能

### 1. 真实的 AI 摘要生成

现在会调用通义千问模型生成高质量的新闻摘要（不再是简单截断文本）：

```typescript
// 生成 100 字以内的精炼摘要
const summary = await generateSummary(title, content);
```

### 2. 智能标签提取

使用 AI 从新闻内容中提取 3-5 个关键标签：

```typescript
// 例如：["人工智能", "机器学习", "深度学习"]
const tags = await generateTags(title, content);
```

### 3. 优雅降级

- 如果未配置 API Key，系统会跳过 LLM 增强，仍可正常运行
- API 调用失败时自动返回 null，不会导致整个流程中断

## 🧪 测试配置

### 1. 启动服务器

```bash
npm run dev
```

### 2. 查看控制台日志

**✅ 配置成功：**
```
✅ DashScope API 已配置，使用模型: qwen-plus
```

**❌ 未配置：**
```
⚠️  DASHSCOPE_API_KEY not configured. LLM enrichment will be disabled.
```

### 3. 测试抓取新闻

1. 打开浏览器：http://localhost:3000
2. 点击 **"Fetch News"** 按钮
3. 观察控制台日志，应该看到：
   ```
   🔍 Scraping 9 sources...
   🤖 Enriching 119 articles with LLM...
   ✅ Enriched 119 articles
   ```

### 4. 检查生成的内容

查看新闻卡片，检查：
- ✅ 摘要是 AI 生成的精炼总结（而不是简单截断）
- ✅ 标签是语义相关的关键词（不是随机分词）

## 📊 API 调用说明

### 摘要生成

- **Prompt**：要求生成 100 字以内的简洁摘要
- **Temperature**：0.3（较低，保证稳定性）
- **Max Tokens**：200

### 标签提取

- **Prompt**：要求提取 3-5 个关键标签
- **Temperature**：0.3
- **Max Tokens**：100

### 批量处理

- 每批处理 5 篇文章
- 批次间有 1 秒延迟（避免触发限流）

## 🔧 代码对比

### 旧实现（Mock）

```typescript
// 简单截断前 97 个字符
const summary = text.substring(0, 97) + "...";

// 从标题简单分词
const tags = title.split(/[\s,，、]+/).filter(...);
```

### 新实现（真实 AI）

```typescript
// 调用通义千问生成摘要
const completion = await openai.chat.completions.create({
  model: "qwen-plus",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.3,
  max_tokens: 200,
});

const summary = completion.choices[0]?.message?.content?.trim();
```

## 📚 参考文档

- [阿里云 DashScope 文档](https://help.aliyun.com/zh/model-studio/dashscope-api-reference/)
- [通义千问模型介绍](https://help.aliyun.com/zh/model-studio/getting-started/models)
- [OpenAI 兼容接口](https://help.aliyun.com/zh/model-studio/developer-reference/compatibility-of-openai-with-dashscope/)

## ❓ 常见问题

### Q1: 显示 "DASHSCOPE_API_KEY not configured"

**解决方案：**
1. 确保 `.env.local` 文件在项目根目录
2. 确保文件名正确（不是 `.env.local.txt`）
3. 确保 API Key 已正确填写
4. 重启开发服务器

### Q2: API 调用失败

**可能原因：**
1. API Key 无效或过期
2. 账户余额不足
3. 网络连接问题
4. 触发了限流（降低批量大小）

**查看错误日志：**
```
console.error("LLM summary generation failed:", error);
```

### Q3: 生成内容质量不佳

**调整建议：**
1. 修改 prompt 提示词（`lib/llm/bailian-client.ts`）
2. 调整 temperature（0.1-0.5 之间）
3. 增加 max_tokens（允许更长输出）
4. 切换到更强的模型（如 qwen-max）

## 🎉 完成！

现在你的应用已配置好真实的 AI 功能。享受由通义千问驱动的智能新闻摘要和标签提取吧！
