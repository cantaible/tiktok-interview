# 🚀 启用真实 LLM API 配置指南

## 第一步：创建环境变量文件

在项目根目录创建 `.env.local` 文件：

```bash
cd /Users/dongzhiming/Documents/Codes/tiktok-interview
touch .env.local
```

## 第二步：添加你的 API 凭证

编辑 `.env.local` 文件，添加以下内容：

```bash
# 阿里云百炼 API 配置
ALIYUN_BAILIAN_API_KEY=你的API_KEY
ALIYUN_BAILIAN_WORKSPACE_ID=你的WORKSPACE_ID
```

**示例**：
```bash
ALIYUN_BAILIAN_API_KEY=sk-abc123def456...
ALIYUN_BAILIAN_WORKSPACE_ID=ws-xyz789...
```

> ⚠️ **注意**：请替换为你实际的凭证，不要使用示例值

## 第三步：修改 LLM 客户端使用真实 API

当前代码使用的是 Mock 实现。要启用真实 API，需要修改 `lib/llm/bailian-client.ts`。

### 方案 A：快速测试（简单方式）

目前代码已经可以检测环境变量，但 `isConfigured()` 方法需要同时有 API Key 和 Workspace ID。

**检查你的凭证是否完整**：
- API Key：`ALIYUN_BAILIAN_API_KEY`
- Workspace ID：`ALIYUN_BAILIAN_WORKSPACE_ID`

配置后重启服务器，如果看到以下日志说明配置成功：
```
🤖 Enriching 119 articles with LLM...
```

### 方案 B：完整实现（生产方式）

如果你想使用完整的阿里云百炼 SDK，需要修改代码。

#### 1. 安装 SDK（如果还没安装）

```bash
npm install @alicloud/bailian20231229
```

#### 2. 修改 `lib/llm/bailian-client.ts`

找到 `generateSummary` 方法，将 Mock 实现替换为真实 API 调用：

```typescript
// 当前 Mock 实现（第 45 行左右）
const text = content || title;
const summary = text.substring(0, 97) + "...";
return summary;
```

替换为：

```typescript
import BailianClient20231229 from "@alicloud/bailian20231229";

// 在 generateSummary 方法中
const client = new BailianClient20231229({
  endpoint: "https://bailian.cn-beijing.aliyuncs.com",
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
});

const response = await client.callModel({
  workspaceId: this.workspaceId,
  prompt: generateSummaryPrompt(title, content),
  model: "qwen-max",
});

return response.data.output;
```

同样修改 `generateTags` 方法。

## 第四步：重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

## 第五步：测试 LLM 功能

1. 打开浏览器访问 http://localhost:3000
2. 点击 "Fetch News Now" 按钮
3. 观察控制台日志

### 成功配置的日志：
```
🔍 Scraping 9 sources...
🆕 New articles: 119
🤖 Enriching 119 articles with LLM...  ← 看到这个说明配置成功
✅ Enriched 119 articles
✅ Saved 119 new articles
```

### 未配置或失败的日志：
```
⚠️  ALIYUN_BAILIAN_API_KEY not configured. LLM enrichment will be disabled.
ℹ️  LLM not configured, skipping enrichment  ← Mock 模式
```

## 验证 LLM 结果

### 查看生成的摘要和标签

1. 在主页查看新闻卡片
2. 检查是否有摘要显示（灰色文字）
3. 检查是否有标签（彩色 Badge）

### Mock vs 真实 LLM 对比

**Mock 模式**：
- 摘要：文本前 97 字符 + "..."
- 标签：从标题分词提取

**真实 LLM**：
- 摘要：语义理解后生成的精炼总结
- 标签：基于内容提取的主题标签

## 常见问题

### Q1: 配置后仍显示 "LLM not configured"

**检查清单**：
- [ ] `.env.local` 文件在项目根目录
- [ ] 文件名正确（不是 `.env.local.txt`）
- [ ] API Key 和 Workspace ID 都已填写
- [ ] 已重启开发服务器
- [ ] 环境变量格式正确（无空格、无引号）

**验证环境变量**：
```bash
# 在项目根目录运行
cat .env.local
```

### Q2: API 调用失败

**可能原因**：
1. API Key 或 Workspace ID 错误
2. 网络连接问题
3. API 配额用尽
4. SDK 未正确配置

**调试方法**：
```typescript
// 在 lib/llm/bailian-client.ts 中添加日志
console.log('API Key:', this.apiKey?.substring(0, 10) + '...');
console.log('Workspace ID:', this.workspaceId);
console.log('Is Configured:', this.isConfigured());
```

### Q3: 只想在某些情况下使用 LLM

修改前端调用：

```typescript
// 始终启用（默认）
fetch("/api/scrape", {
  method: "POST",
  body: JSON.stringify({ enrichWithLLM: true })
});

// 手动控制
const useLLM = confirm("是否使用 LLM 增强？");
fetch("/api/scrape", {
  method: "POST",
  body: JSON.stringify({ enrichWithLLM: useLLM })
});
```

## 性能和成本

### Mock 模式
- ✅ 免费
- ✅ 无延迟
- ⚠️ 质量一般

### 真实 LLM
- 💰 按 Token 计费
- ⏱️ 2-5 秒/批次
- 🌟 高质量结果

### 估算成本

假设抓取 100 篇文章：
- 每篇文章 ~500 字符输入
- 每篇输出 ~150 字符（摘要 + 标签）
- 总计：约 65,000 tokens
- 成本：根据阿里云百炼定价（通常 ¥0.01-0.1/千 tokens）

## 快速命令汇总

```bash
# 1. 创建环境变量文件
cd /Users/dongzhiming/Documents/Codes/tiktok-interview
cat > .env.local << EOF
ALIYUN_BAILIAN_API_KEY=你的API_KEY
ALIYUN_BAILIAN_WORKSPACE_ID=你的WORKSPACE_ID
EOF

# 2. 验证文件内容
cat .env.local

# 3. 重启服务器
npm run dev

# 4. 测试（在浏览器中）
# 访问 http://localhost:3000
# 点击 "Fetch News Now"
```

## 下一步

配置成功后，你可以：

1. **优化 Prompt**：编辑 `lib/llm/prompts.ts` 调整生成效果
2. **调整超时**：修改 `BailianClient` 构造函数的 `timeout` 参数
3. **监控使用量**：在阿里云控制台查看 API 调用统计
4. **A/B 测试**：对比 Mock 和真实 LLM 的效果

---

**需要帮助？**

- 📚 查看 `LLM_FEATURE_GUIDE.md` 获取详细文档
- 🔍 查看代码注释了解实现细节
- 💬 检查控制台日志排查问题
