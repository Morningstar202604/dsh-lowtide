<div align="center">

# dsh-lowtide

**你有空时把任务交给它，你忙完回来，事情已经做完了。**

闲时规划 · 人工裁定 · 自动执行 · 回来验收

[English](./README.md) | **简体中文**

</div>

---

![hero](./assets/screenshots/hero.png)

<p align="center"><i>三条任务排队候审、头部实时价格状态、到达闲时窗口自动开跑</i></p>

## 它解决什么问题

每个重度使用 AI Agent 的人，都卡在同一个矛盾上：**你最忙的时候，恰恰是任务最多的时候。**

- 上午十点，你正在开会，突然想到「那个脚本的重构该做了」——现在你没法做，晚上你大概率忘了。
- 晚上你终于有空，一口气给 Agent 下了五个任务——然后你盯着它跑了两个小时，本该休息的时间全耗在「看它干活」上。
- 你想让 Agent 全自动跑，又不敢：没人看着，它改错文件、花超预算怎么办？

**lowtide 把「下任务」和「跑任务」这两件事在时间上彻底拆开：**

> 你有空的时候，只管把任务写清楚、投进队列、审一遍放行；
> 然后你去开会、去睡觉、去过你的生活；
> 到了你设定的闲时窗口，它自动批量执行；
> 你忙完回来，任务已经跑完了，一份执行报告在等你验收。

这不是一个「更便宜的 Agent」，而是一种新的工作节奏：**你的时间用来做决策，机器的时间用来做执行。**

## 三个核心价值

### ① 闲时规划，忙时收获（这是它存在的理由）

lowtide 的核心是一个**跨时间的任务委托管道**：投递 → 裁定 → 排队 → 定时执行 → 报告验收。你在任何碎片时间投递任务，它在你指定的时间窗口内无人值守地完成，次日晨报式的执行报告把「做了什么、结果如何、花了多少」一次讲清。半自动化的意义就在这里——**你不需要在场，但一切尽在掌握。**

### ② 半自动化，但信任不打折

自动化的是执行，不是决策。每一条任务都必须经过你的**人工裁定**（✓ 批准 / ⏸ 顺延 / ✕ 放弃）才会进入执行队列——机器永远无法自己把任务推过这道关。执行前有预检五关（工作区、git 快照、文件指纹、窗口、预算），执行中跑在沙箱权限档里，执行后有复核策略和晨报验收。**你可以放心地不在场。**

### ③ 顺手把账单减半

DeepSeek 自 2026 年 8 月起实行峰谷分时定价：工作日高峰全价，其余时段（含周末全天）约**半价**，部分模型峰谷价差最高达 **1100%**（[公告](https://finance.eastmoney.com/a/202608133840616378.html) · [报道](https://www.dzwww.com/news/ssnews/202608/t20260817_18025522.htm) · [周末新规](https://www.ithome.com/0/993/095.htm)）。lowtide 的闲时执行天然落在低价区间——**省钱不是它的目的，是这套时间模型的自然红利**。账目按官方价目实时核算，显示价格 = 实际计费价格，逐位可核对。

## 它是怎么工作的

```
① 投递              ② 裁定              ③ 执行                 ④ 验收
你有空时：           队列面板按工作区      到达闲时窗口：          你忙完回来：
拦截卡一键投递        分组展示，逐条        30 秒调度 tick        打开执行报告——
或手动填工单     →   ✓批准 ⏸顺延  →    预检五关 → 沙箱执行 →  结果 + diff + 实花
（四种策略可选）      ✕放弃 / 全部放行     每窗口只跑一批          + 省了多少钱
```

任务生命周期：`pending-review → queued → preflight → running → done / failed / stale / timeout`，另有 `deferred`（顺延）与 `dropped`（软删，可恢复）。

## 界面亮点

### ① 新建工单弹窗 —— 四种执行策略，一张工单全搞定

![new-task-modal](./assets/screenshots/new-task-modal.png)

单次 / 迭代 / 采样 / 复核四种执行策略一字排开，每种策略下方都有场景化引导语，轮数、优先级、运行模式（L1/L2/L3 自治档）随任务单独覆盖。任务统一在「标准开发」沙箱权限档下执行，落地即待审——**没有任何任务能绕过你的裁定直接进入队列**。

### ② 高级设置 —— 旗舰级任务控制面板

![advanced-options](./assets/screenshots/advanced-options.png)

模型、推理等级（Follow global / Off / Low / High / Max）、0–9 十级优先级、新会话或续接前序、锁定文件清单——全部集中在一张独立小窗里。**锁定文件会在执行前做 sha256 校验，文件被改动过任务立即标记 stale，绝不盲跑。**

### ③ 全模型支持 —— 你的 Harness 接了什么，就能用什么

![model-picker](./assets/screenshots/model-picker.png)

批量执行默认使用官方 `deepseek-v4-flash`，但你可以为每个任务指定**本机 Harness 已接入的任意模型**——官方 Flash / Pro、自定义 provider，按来源分组、即点即用。非官方模型没有公开价目，记账会如实标注「价格未知」，你也可以在设置页手动补价目，账面一分不差。

### ④ 峰谷窗口编辑器 —— 你的节奏，看得见

![window-editor](./assets/screenshots/window-editor.png)

忙时 / 闲时窗口多段自定义、支持跨零点、支持按星期几生效，底部 **24 小时价格带实时预览**：红色高峰、绿色低谷，当前时刻一目了然。「一键采用官方忙时」自动把北京时间换算到你的本地时区——非东八区用户同样开箱即用。

### ⑤ 设置页 —— 官方定价说明内置，配置全部图形化

![settings](./assets/screenshots/settings.png)

闲时运行窗口、每批任务上限、单任务时长上限、跨工作区并发度、日预算、报告历史上限、自治三档、价目表覆盖……所有配置项都在设置页里图形化完成，附带官方定价规则的完整人性化解读（含周末全天低谷新规）。

### ⑥ 还有三个界面，藏在日常动线里

- **价格状态胶囊**（会话头部）：状态点 + 闲时/忙时/执行中，有待办时显示开跑倒计时，队列数徽标，悬停看价格明细，**点击直接编辑窗口**。
- **忙时拦截卡**：高峰时段在输入框打字即弹出——「现在就跑（忙时价）」还是「投递闲时队列」，实时价差对比摆在你面前；草稿完整保留，可对本条消息免打扰。
- **执行报告（晨报）**：结论先行——本次已省 ¥X；异常置顶、采样候选并列待你挑选、历史报告留存、一键复制 Markdown 分享。

## 执行策略详解

| 策略 | 行为 | 适用场景 | 费用 |
|---|---|---|---|
| **单次 Single** | 一次完成，等价于普通 harness 任务 | 简单明确的活，一遍就够 | 1× |
| **迭代 Iterative** | 同一会话连续 2–5 轮，每轮以你的「迭代眼光」审查并改进上一轮；相邻两轮 bigram 相似度 > 0.9 判定收敛，**提前结束不多花一分钱** | 需要打磨的产出：分析、写作、代码 | 约 N× |
| **采样 Sampling** | 2–5 个互不可见的独立会话各跑一遍同一指令，产出 N 份完整候选并列展示（含每份花费）；次日由**你**挑选——机器不合成、不择优 | 标题、方案、候选设计：你想要「几个选项」而不是「一个答案」 | 约 N× |
| **复核 Review** | 执行完毕后开一个独立会话，按你的「审查关注点」挑剔复核，产出结构化审查意见，在任务详情与晨报中可折叠查看 | 重要交付物：交出去之前让另一双眼睛再过一遍 | 约 2× |

## 自治三档（可逐任务覆盖）

| 档位 | 语义 | 适合谁 |
|---|---|---|
| **L1 per-task** | 每条任务都需你逐个 ✓ 批准才执行 | 初次信任、高风险仓库 |
| **L2 batch**（默认） | 任务落入待审，批次窗口前 T-30 分钟弹出确认门，一次全部放行；**不放行不执行（fail-safe）** | 日常大多数用户 |
| **L3 full-auto** | 投递即入队，闲时零确认直接在沙箱内执行（切换有二次确认） | 常开服务器、完全托管场景 |

## 架构：一套为「无人值守」而生的工程设计

lowtide 不是一个脚本，而是一套完整的工程体系：

- **基于 Cordis 微内核插件体系**：宿主半（Node.js 服务）与浏览器半（React 客户端）双面构建、同一份产物，**桌面端与网页端行为完全一致**——dsh 桌面版的 GUI 本身就是 Web 渲染，一套代码，两端通吃。
- **平台无关核心层 `lowtide-core`**：窗口模型、官方价目表、用量计费、队列汇总、每日账本、批次窗口计算——全部是不依赖任何 dsh API 的纯函数，独立包、独立测试，逻辑可移植到任何宿主。
- **双通道实时同步**：SSE 增量推送 + 4 秒轮询兜底，队列状态、倒计时、执行进度实时上屏。
- **原子写入 + 损坏自愈**：任务、报告、账本、配置全部持久化在状态文件，原子保存，文件损坏自动回退备份——清空已完成任务也不会丢账。
- **预检五道关卡**：工作区存在性、git HEAD 快照、锁定文件 sha256、窗口适配性、日预算——任何一道不过，任务标记 `stale` 或自动顺延，**绝不盲跑**。
- **fail-closed 权限围栏**：`lt-readonly / lt-standard / lt-trusted` 三档沙箱预设（approval=never），闲时无人值守执行零打断，风险关进笼子；路由层叠加同源 + loopback 信任围栏。
- **人工裁定海关**：`pending-review` 是人与机器之间唯一的关卡。机器永远不能自己把任务推过这道关——采样模式「选哪份」也是人的事，机器不合成、不择优。

## Quick Start

前置：Node `^22.19 || >=24`，pnpm `11.7`。所有依赖（含 `@deepseek-ai/*`）均在公共 npm registry，无需私有源。

**第一步：安装 DeepSeek Harness（dsh）**——二选一：

- **桌面版**：从 DeepSeek 官方渠道安装 dsh Desktop（自带完整运行时 + Web UI）；
- **命令行版**：`npm install -g @deepseek-ai/dsh`。

并在 dsh 模型设置里配置一个可用模型（如 DeepSeek 官方 API Key）——插件本身不携带、不存储任何模型凭据。

**第二步：获取源码，构建安装**：

```powershell
git clone https://github.com/KelaoHu/dsh-lowtide
cd dsh-lowtide
pnpm install

# 构建平台无关核心层（先于插件构建与测试）
pnpm --filter lowtide-core bundle
# 构建插件：宿主半 + 浏览器半，一次出双面产物
pnpm --filter dsh-lowtide bundle

# 装入 dsh profile——桌面端与网页端通用同一份构建产物
npx @deepseek-ai/dsh@0.1.0-rc.7 plugin --profile desktop add ./packages/dsh   # 桌面端
npx @deepseek-ai/dsh@0.1.0-rc.7 plugin --profile web add ./packages/dsh       # 网页端

# 启动开发实例（3080 端口）
pnpm --filter dsh-lowtide dev
```

> `cordis.patch.yml` 是 bundle 层补丁：插入插件行并注入三个 `lt-*` 权限预设；`cordis.dev.yml` 是刻意为空的开发 overlay（避免重复插入）。

## 使用说明（操作手册级）

### 投递任务的三种方式

1. **拦截卡投递**（最顺手）：高峰时段在输入框正常打字，拦截卡弹出，点「投递到闲时队列」——你正在写的草稿原样变成工单。
2. **手动工单**（最完整）：点输入区旁的「New」，填写提示词、策略、轮数、优先级，高级设置里选模型 / 推理等级 / 会话模式 / 锁定文件。
3. **API 投递**（最极客）：`POST /ds-lowtide/tasks`，可接入任何自动化系统。

### 裁定与管理队列

- 队列面板按工作区分组：**待执行 / 已结束 / 已放弃**三栏。
- 行内操作：✓ 批准、⏸ 顺延（下个窗口再说）、✕ 放弃（软删，随时可恢复）。
- 批量操作：「全部放行」一键批准所有待裁定任务；「一键清空已完成」保持面板清爽（账目不受影响）。
- 「Run now」：不等窗口，立即手动开跑一批（调试/演示用）。

### 会话续接（Continue previous）

高级设置里可将任务设为「续接前序」：从指定工作区的某个历史会话继续执行，继承上下文——适合「昨天那个任务没聊完，今晚接着干」的场景。锁定文件清单内的文件会在执行前做 sha256 校验，被改动即标记 stale。

### 时间语义（重要）

| 时间 | 判定时区 | 说明 |
|---|---|---|
| 官方忙时段（默认） | **北京时间** | 计费正确性要求：DeepSeek 按北京时间收费，插件账目与官方严格一致；周末全天闲时 |
| 自定义忙时/闲时窗口 | **你的本地时间** | 支持跨零点、按星期；设置页 24h 价格带实时预览 |
| 闲时运行窗口（批处理） | **你的本地时间** | 窗口结束停止启动新任务，不打断运行中任务 |

### 每日账本

`ledger[YYYY-MM-DD] = { yuan, savedYuan }`：实花与节省按日累计，**显示价格 = 实际计费价格，同一个公式，逐位可核对**。

## 配置项全表

`GET /ds-lowtide/config` 返回；`PUT` 部分更新（未列字段直接拒绝）：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `autonomy` | `'l1'\|'l2'\|'l3'` | `l2` | 自治三档；工单弹窗可逐任务覆盖 |
| `batch.window` | `"HH:MM-HH:MM"` | `19:00-23:30` | 闲时运行窗口（本地时区） |
| `batch.tz` | IANA 时区 | 系统时区 | 运行窗口时区（留空=本地） |
| `batch.gateLeadMin` | 分钟 | `30` | 批次确认门提前量 |
| `batch.maxTasksPerNight` | 数字 | `10` | 每批任务上限 |
| `batch.maxDurationMin` | 分钟 | `240` | 单任务最长时长（超时取消并重试一次） |
| `batch.maxConcurrency` | 数字 | `3` | 最大并发 1–8（同工作区串行，跨工作区并行） |
| `batch.paused` | 布尔 | `false` | 暂停自动批处理 |
| `budgetDailyYuan` | ¥ | `0` | 日预算（0=不限） |
| `windows[]` | 数组 | `[]` | 自定义忙时/闲时窗口；空=官方忙时（北京时间） |
| `windows[].level` | `peak\|off\|custom` | — | 忙时 / 闲时 / 自定义（闲时价×倍率） |
| `windows[].start/end` | `"HH:MM"` | — | 本地钟点边界，支持跨零点 |
| `windows[].days` | `1..7` 数组 | 每天 | ISO 星期（1=周一 … 7=周日） |
| `windows[].tz` | IANA 时区 | 系统时区 | 该窗口时区 |
| `windows[].multiplier` | 数字 | `1` | custom 窗口的闲时价倍率 |
| `prices[model].{peak,off}.{input,inputCached,output}` | ¥/1M | 官方 | 价目表覆盖 |

## HTTP API

前缀 `/ds-lowtide/`，同源 + loopback 信任围栏（`sec-fetch-site` 跨站拒绝）：

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/state` | 聚合状态（level/价格/倒计时/队列/最新报告） |
| GET | `/events` | SSE 增量推送（客户端降级 4s 轮询） |
| GET/PUT | `/config` | 读/写配置 |
| POST | `/tasks` | 投递工单（strategy/rounds/reasoning/strategyHint/priority/files） |
| POST | `/tasks/:id/approve \| defer \| drop \| cancel \| retry \| restore \| delete \| choose-candidate` | 裁定与管理 |
| POST | `/tasks/approve-all` | 全部放行 |
| POST | `/estimate` | 测算：峰价（当前模型）vs 谷价（批量模型） |
| POST | `/batch/run-now` | 立即开跑（测试/手动） |
| POST | `/dismiss` | 今日不再拦截 |
| GET | `/health` | 心跳 |

## 权限档

`cordis.patch.yml` 注入（闲时无人值守 = 沙箱 + 零审批）：

| preset | sandbox | approval |
|---|---|---|
| `lt-readonly` | read-only | never |
| `lt-standard` | workspace-write | never |
| `lt-trusted` | danger-full-access | never |

投递 UI 已移除权限档选择（任务统一按 `lt-standard` 标准开发执行）；其余两档为 API/后端预留，直接调 `POST /tasks` 传 `permissionPreset` 仍可用。预检通过才运行，绝不盲跑。

## 数据与状态

- 任务、报告、账本、配置全部持久化在状态文件 `$DSH_HOME/lowtide.json`（原子写入，损坏自动回退备份）；若进程暴露 `DSH_PROFILE`，按 profile 隔离到 `$DSH_HOME/profiles/<profile>/lowtide.json`。**同一时刻只应有一个实例写同一文件**。
- 账本按日记录；执行报告保留历史（清空已完成任务不丢账）。
- 每窗口只跑一批（跨零点安全）；空队列不产生空报告。
- 顺延恢复：窗口开始时 preflight-deferred 任务自动重新入队（≥3 次标失败）；用户手动顺延的回到待裁定。

## 测试：168 项单测 + 10 个端到端 spec

```powershell
pnpm --filter lowtide-core test    # 核心层纯函数 44 测试
pnpm --filter dsh-lowtide test     # 插件单测 124 测试
pnpm --filter dsh-lowtide exec playwright test   # e2e（需 dsh web 在 3080 运行）
```

10 个 Playwright e2e spec 串行执行，覆盖：双面加载冒烟、CSS 变量宿主主题可解析性、六界面明暗截图、工单弹窗叠层、设置页换算与色带、窗口编辑器保存回读、跨工作区并发与同工作区串行（真实 LLM 执行）、投递→裁定→执行→报告全闭环（真实 API）、迭代收敛 / 采样择优 / 复核意见全流程。

仓库内置 GitHub Actions CI：每次 push / PR 自动在 ubuntu + windows × node 22 / 24 四矩阵上跑 install → build → typecheck → 全部单测。

## 安全说明

- 路由带 Host/Origin 信任围栏（loopback + 同源）；**不要将 3080 直接暴露公网**，远程部署请走 SSH 隧道或鉴权反代。
- Windows 端沙箱为「缓解级」（partial），Linux/macOS 为完整强制；无人值守场景建议叠加任务级文件白名单与预算兜底。
- L3 全自动模式：投递即入队、闲时无需确认直接在沙箱内执行——切换前有二次确认。
- 状态文件包含完整任务提示词与路径，请注意备份安全。
- 漏洞报告请走 [SECURITY.md](./SECURITY.md) 的私密渠道。

## 常见问题

**Q: 闲时窗口到了却没跑？**
检查：① 任务是否已 ✓ 批准；② 「暂停闲时批处理」是否勾选；③ 批次确认门是否未放行；④ 预算是否用尽；⑤ 预检是否失败（任务变 `stale`，详情页有原因）。

**Q: 采样任务为什么没有自动选出最好的那份？**
设计如此：机器不替你做审美判断。次日报告里并列展示候选与花费，你点「选这份」。

**Q: 我在国外，忙时跟我的作息对不上？**
官方价目按北京时间收费。设置页会展示官方时段在你本地的形态；想贴合自己作息就自定义窗口，或点「一键采用官方忙时（换算到我的时区）」。

**Q: 估算和实际花费对不上？**
估算按输入 token 上界粗略计算（不含输出），实花以真实 usage 核算（含输出与缓存命中）；执行报告里两者都可查。

**Q: 任务被标成 stale？**
预检失败：工作区消失、git 快照变化、锁定文件被改动、预算不足或窗口放不下。点详情看 `lastError`，修正后 `retry`。

**Q: 桌面版和 Web 版同时开会不会冲突？**
状态文件同一时刻只允许一个写入实例；请用 `DSH_PROFILE` 隔离，或只开一个。

## 已知限制与路线图

- 当前为发布候选状态（v0.1.1）：构建 + 168 项单测全绿；e2e 需真实 dsh web 实例运行。以源码方式安装。
- 批量执行默认 `deepseek-v4-flash`；非 DeepSeek 官方模型无公开价目 → 记账标注「价格未知」，可在设置页手动补价目。
- 批次窗口单任务最长 240 分钟，超时取消并重试一次。
- 路线图候选：多窗口多批次、任务依赖图、预算自动分摊、报告推送（邮件/Webhook）、价格波动提醒。

## 目录结构

```
dsh-lowtide/
├── README.md                  English
├── README.zh-CN.md            本文件
├── assets/screenshots/        README 界面截图
├── LICENSE                    MIT
├── CHANGELOG.md               版本记录（Keep a Changelog）
├── CONTRIBUTING.md            贡献指南
├── CODE_OF_CONDUCT.md         行为准则
├── SECURITY.md                安全策略与漏洞报告
├── .github/                   CI 工作流 + Issue/PR 模板
├── package.json               pnpm workspace 根
└── packages/
    ├── core/                  平台无关核心层（lowtide-core）
    │   ├── src/               windows / pricing / model / digest / ledger / scheduler
    │   └── test/              纯函数单测
    └── dsh/                   插件本体（dsh-lowtide）
        ├── src/               宿主半：routes / runner / scheduler / intake / store / state-machine
        ├── client/            浏览器半：components / hooks / i18n / store
        ├── test/              单测 + e2e（Playwright）
        ├── cordis.patch.yml   插件行 + lt-* 权限预设
        └── README.md          包级 README
```

## 写在最后

我把这个插件的内容完全开源给大家，希望能够实现大家生产力水平的提高。同时我也希望能够得到来自开源社区的反馈，能够让我学习到更多的内容，我们一起把这一款插件运营好。让我们在前往 AGI 的星辰大海上一起进步。

做了一点微小的贡献，谢谢大家。

## 许可与致谢

MIT License（见 [LICENSE](./LICENSE)）。

- 构建于 [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/dsh) · Cordis 插件体系
- [DeepSeek 调价公告（2026-08-13）](https://finance.eastmoney.com/a/202608133840616378.html) · [生效报道（2026-08-17）](https://www.dzwww.com/news/ssnews/202608/t20260817_18025522.htm) · [周末调价公告](https://www.ithome.com/0/993/095.htm)
