# 交付物C：开发复盘报告（Process Documentation）

## 1. 概述

本次开发以 **Spec-Driven Development** 为主线推进：先将需求、边界与验收标准固化为可执行的 Spec，再让 AI 在约束内生成实现。整体流程参考 spec-kit 的"Detailed Process"，按 **constitution → specify → clarification （可选） → plan → tasks → analysis （可选） → implement** 的顺序闭环迭代，并在过程中通过"改 Spec"的方式完成关键纠偏，仅仅在不需要改动spec.md的情况下，使用vibe coding进行UI微调或者小bug修复。

## 2. 工具与模型

### 开发工具
- **开发环境**: Visual Studio Code
- **AI 工具**: GitHub Copilot
- **AI 模型**: Claude Sonnet 4.5


## 3. 开发流程复盘：我如何定义 Prompt/Spec 引导 AI

### 建立基础规格

我没有直接让 AI 从零开始写代码，而是先提供模板化参考材料（官方文档、官方视频、第三方教程），设计spec-kit的prompt，以求AI 在统一语境下先总结项目需求。随后将草案收敛为 spec-kit 体系下的规格文档，实际证明，对于已经成熟的技术，在constitution和specify阶段，合理表达正确的项目需求，就是项目的what和why上面，就足够引导spec-kit生成正确的业务代码，但对于较新的技术，比如阿里云的百炼平台调用，需要额外提供使用实例，即how的部分，才能正确实现功能。

### 第一轮迭代：快速原型

第一轮迭代中，在constitution和specify步骤，我让spec-kit严格遵守这个项目的需求文档，逐步执行constitution，specify，plan，tasks，implement，我按规格推动实现，快速得到可运行的雏形。


## 4. 关键修正（Crucial Fixes）：通过修改 Spec 修正 AI 生成错误，这里是对第二轮迭代的具体说明
但在雏形验证中，我发现部分实现"表面完成但不满足要求"，因此需要增加数个新功能，开启新一轮迭代
### 修正案例 1：版本迭代功能更新的大修改，一次性增加多个新功能

**问题现象**：
第一轮迭代的雏形验证中，主要问题集中在：
- **数据源问题**：被 AI 用虚构或 mock 替代导致不可验证
- **日期筛选逻辑**：缺失或语义不清
- **UI 一致性**：需要进一步美化和一致性收敛

**根因分析**：这些问题并非单纯编码失误，而是**规格表达不够刚性、验收口径不够具体，prompt提示有歧义*，导致 AI 在空白处选择了最低成本的补全方式。

**修正方式**：
因此第二轮迭代我新开示例分支，以更严格的"澄清—计划—任务—实现"链路推进：

1. **specify**: 通过澄清将歧义点前置收敛，把关键语义写成不可误解的规则
2. **clarify**: 新增加了可选的步骤，让spec-kit自动帮我检查specification出现的可能遗漏，并予以补充，减少ai“偷工减料”的可能性
3. **Plan**: 
4. **Tasks**: 
5. **Analyze**: 增加了可选步骤分析，及优化spec.md 和 task.md
5. **Implement**: 

**修正结果**：新的功能得到补充，app被成功完善

### 修正案例 2：对第二轮002-ui-ux-improvements的小修改，优化fetch news按钮

**问题现象**：点击fetch news的时候，没有进度条，会让用户觉得网页没有响应

**根因分析**：spec里没有声明清楚，导致AI没有按照更加合理的功能设计，而是默认的设计。

**修正方式**：
- 在 **specify** 阶段明确加载处理方式，增加进度条和batch加载，增强用户可感知性

**修正结果**：问题解决，toast按照要求的方式正确显示，新增的specification体现在： **FR-015**: System MUST display scraping progress indicator during fetch operation **FR-016**: System MUST provide global "Refresh AI Content" button in header/toolbar to regenerate summaries and tags for ALL currently displayed articles using batch processing (5 articles per batch), showing progress bar with article count (e.g., "15/47 articles") and cancel button

## 5. 总结

本次实践的核心结论是：**在 spec-kit 的流程下，开发者的核心价值更像架构师而非码农**。这时，开发者可以更加注重顶层设计，而不是具体的功能实现。我认为Specification-Driven Development (SDD) 是一个很有潜力的编程范式，就像我研究中经常用到的design science research方法论类似，两种方法论都是以问题为导向、迭代改进、强调可评估性的系统化方法，旨在通过创造人工制品（Artifacts）来解决实际问题。SDD是一套从实践中抽象出可复用的知识，尽管其目前还有一些限制，我相信这个范式本身也会有一个螺旋上升的过程，引领下一代编开发。

### 5.1 关键发现
- ✅ **当规格足够清晰且验收前置时**：AI 的产出会显著更稳定、更贴合需求
- ❌ **当规格模糊时**：AI 容易用"最省事的方式"补洞，导致表面完成但不可验证

### 5.2 项目反思
尽管我很欣喜通过这个项目了解到了最新AI编程的范式，但仍存在一些疑惑，我尝试阅读SDD的方法论或者用AI尝试辅助阅读，但仍没有得到满意的解释。
- 首先，SDD还不够灵活，单纯使用SDD实现一些小的功能的时候，流程会过度冗余，这样一是会影响开发效率，二是会消耗额外的token数量，增加项目成本。当前的SDD范式缺乏详细的指导，什么时候应该使用SDD范式修改spec进行功能迭代，什么时候应该简化流程，使用vibe coding或者手动处理。当前我的实践方式是，描述我期待的改动，并询问此改动是否应在spec.md中提及。
- 其次，SDD仍存在幻觉问题。在我实现额外功能，用阿里云百炼LLM实现AI增强功能时，没有反应，后经查证发现是api没有被以正确的形式被调用。LLM出现了幻觉问题。
- task完成后没有自动打钩。可能是第一阶段的implementation耗费了很长时间，所以中途GitHub Copilot提示我长时间未结束，是否继续，我点了继续，功能得以正常执行，但对于实现的功能，specs/001-news-harvester-mvp/tasks.md没有被正确的打勾

### 5.3 后续改进方向
针对以上问题，我可以使用如下办法进行改善，以探索出基于SDD开发的最佳实践
- 针对SDD不灵活的问题，尝试开发一个agent，以决策树的方式自动判定此次修改应该属于轻量的vibe coding，还是SDD的部分迭代，还是SDD的整体完整迭代。
- 尝试不同方法让LLM在处理不了解的内容时，不要瞎编，应该主动向我提出要澄清或者进一步的资料
- 尝试不同的AI Agent，比如Claude code，或者CodeX，来看一下是AI Agent的问题，还是当前SDD自身的局限。

