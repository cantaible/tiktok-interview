# 截图说明（Screenshots）

本目录用于存放项目运行证据截图，满足交付物 D 的要求。

## 需要的截图

请按以下顺序添加截图文件：

### 1. spec-writing.png
- **内容**: Spec 编写界面截图
- **要求**: 显示在 VSCode 中编写规格文档的界面
- **建议**: 打开 `specs/002-ui-ux-improvements/spec.md` 文件的截图

### 2. ai-code-generation.png
- **内容**: AI 工具生成代码过程截图
- **要求**: 显示 GitHub Copilot 或 AI 助手生成代码的过程
- **建议**: 包含 Copilot 的建议窗口或代码补全界面

### 3. app-running.png
- **内容**: App 运行成功界面截图
- **要求**: 显示应用主界面，包含新闻列表
- **建议**: 访问 http://localhost:3000 后的主页面

### 4. news-fetching.png
- **内容**: 新闻抓取结果展示
- **要求**: 显示点击 "Fetch News" 后成功抓取的新闻卡片
- **建议**: 包含多条新闻，展示标题、来源、时间、摘要等信息

### 5. filtering-export.png
- **内容**: 筛选与导出功能
- **要求**: 显示日期筛选、来源筛选或标签筛选的界面
- **建议**: 展示筛选控件和筛选后的结果

## 截图要求

- ✅ 格式：PNG 或 JPG
- ✅ 命名：严格按照上述文件名
- ✅ 尺寸：建议至少 1200px 宽度，保证清晰度
- ✅ 内容：真实运行结果，不要使用 mock 数据

## 如何截图

### macOS
```bash
# 全屏截图
Cmd + Shift + 3

# 区域截图
Cmd + Shift + 4

# 窗口截图
Cmd + Shift + 4 + Space
```

### Windows
```bash
# 全屏截图
Win + PrtScn

# 区域截图
Win + Shift + S
```

## 截图后

将截图文件重命名并放入本目录，文件名必须与上述列表一致。

README.md 中已经配置好图片引用路径，截图放入后会自动显示。
