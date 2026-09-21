---
title: "Research Draft on Cognitive Neuroscience"
date: 2026-04-07
draft: false
tags: ["Research"]
categories: ["Technology"]
---

> **计算驱动的超低场 MRI：EMI 抑制、低场图像重建、域适配与脑影像分析。**

## Canonical sources

| Rank | 来源 | 用途 |
|---|---|---|
| 1 | [BISPLab 官网](https://www4.hku.hk/bisplab/) | 团队使命、研究版图、成果 |
| 1 | [ULF MRI 研究页](https://www4.hku.hk/bisplab/research-area1.html) | 技术路线、0.05–0.055 T 项目 |
| 1 | [人员页](https://www4.hku.hk/bisplab/people.html) | PI、Co-PI 和团队能力结构 |
| 1 | [招聘页](https://www4.hku.hk/bisplab/join.html) | 团队实际重视的技能 |
| 1–2 | [BISPLab 论文清单](https://www4.hku.hk/bisplab/publications.html) | 论文方向与时间线 |
| 1 | [Nature Communications 2021](https://doi.org/10.1038/s41467-021-27317-1) | 0.055 T、无屏蔽脑 MRI 原始论文 |
| 1 | [Science Advances 2023](https://doi.org/10.1126/sciadv.adi9327) | 0.055 T 快速 3D 脑 MRI 原始论文 |
| 1 | [Science 2024](https://doi.org/10.1126/science.adm7168) | 0.05 T 全身 MRI 原始论文 |
| 3 | [你的个人主页](https://shuolv-fp.github.io/) | 个人经历、技能和自述研究方向 |

## Findings ledger

| 编号 | 发现 | 证据 | 回答 |
|---|---|---|---|
| F1 | BISPLab 有两条主线：计算驱动的 ULF MRI，以及光遗传学结合高场 fMRI 的神经科学研究 | [研究主页](https://www4.hku.hk/bisplab/)、[研究区 2](https://www4.hku.hk/bisplab/research-area2.html) | Q1 |
| F2 | ULF 主线聚焦约 0.05 T 的永磁体、梯度线圈、RF 线圈和低场 MRI 工程 | [ULF 研究页](https://www4.hku.hk/bisplab/research-area1.html) | Q1/Q2 |
| F3 | 核心计算任务包括快速 3D MRI、超分辨率、深度学习重建和无监督域适配 | [ULF 研究页](https://www4.hku.hk/bisplab/research-area1.html)、[Science Advances 2023](https://doi.org/10.1126/sciadv.adi9327) | Q1/Q2 |
| F4 | 无 RF 屏蔽 MRI 依靠多线圈主动 EMI 感知、信号预测和消除，而不是单纯图像去噪 | [Nature Communications 2021](https://doi.org/10.1038/s41467-021-27317-1)、[ULF 研究页](https://www4.hku.hk/bisplab/research-area1.html) | Q1/Q2 |
| F5 | 团队已扩展到全身 MRI、DWI、bSSFP、磁化传递成像和 MRA | [论文清单](https://www4.hku.hk/bisplab/publications.html) | Q1 |
| F6 | 代表性硬件平台是 0.055 T 永磁脑 MRI 和 0.05 T 全身 MRI；共振频率约为 2.1–2.3 MHz | [Nature Communications 2021](https://doi.org/10.1038/s41467-021-27317-1)、[Science 2024](https://doi.org/10.1126/science.adm7168) | Q1/Q2 |
| F7 | PI Ed X. Wu 的公开简介覆盖 MRI 物理、数据采集、重建算法、ULF 工程、高场 fMRI 和神经回路研究 | [人员页](https://www4.hku.hk/bisplab/people.html) | Q1 |
| F8 | 团队成员能力横跨 MRI 物理/工程、信号处理、AI 重建、神经影像和动物光遗传学 | [人员页](https://www4.hku.hk/bisplab/people.html) | Q2 |
| F9 | 招聘信息明确重视 Python/C++/MATLAB、PyTorch/TensorFlow、Git、Linux、信号处理、脉冲序列、图像重建和电磁/机械系统 | [招聘页](https://www4.hku.hk/bisplab/join.html) | Q2 |
| F10 | 你目前具备数据科学、Python/C++、PyTorch、fMRIPrep/Nilearn/FSL、复杂脑网络和 fMRI 研究经验 | [个人主页](https://shuolv-fp.github.io/) | Q3 |
| F11 | 你的研究已经涉及 CPCA、脑时空动力学、个体化功能分区、规范化建模和机器学习验证 | [个人主页](https://shuolv-fp.github.io/) | Q3 |
| F12 | 你的 AI-agent、测试时扩展、评测和科研流程工程能力可迁移到可复现重建、模型评测和医学影像工作流 | [个人主页](https://shuolv-fp.github.io/) | Q3/Q4 |

## Scope filter

没有丢弃核心证据。需要限定的是：BISPLab 的“AI 驱动 MRI”不是一般计算机视觉任务，而是受 MRI 物理、采样过程、k-space 一致性和临床风险约束的逆问题。

官网使用了“诊断质量”“普惠医疗”等愿景式表述，但这不等同于已经完成大规模临床等效性验证。因此，学习计划应把“可复现的图像形成”和“临床可用性”分开。

## Object filter

需要把两个研究对象区分开：

1. **ULF MRI for healthcare**：重点是硬件、EMI、序列、重建、临床协议和部署。
2. **Optogenetic fMRI for neuroscience**：重点是高场动物 MRI、光遗传学、电生理、神经回路和因果机制。

你的现有神经科学背景与第二条主线天然接近，但你当前明确想进入 ULF-MRI，因此第一阶段应优先选择计算驱动的 ULF MRI，而不是直接从动物光遗传学切入。

## Conclusions

### 1. BISPLab 的真正研究链条是端到端 MRI 系统

BISPLab 的 ULF 路线可以概括为：

> 磁体与线圈 → 脉冲序列与采集 → EMI 感知/消除 → k-space 重建 → 深度学习图像形成 → 临床协议 → 自动分析与部署。

这意味着，单独掌握 PyTorch 或医学图像分割并不足够。你需要理解数据在“物理世界”中是如何产生的，再研究神经网络如何介入。依据：F2–F6。

### 2. 你最有竞争力的入口是“计算 ULF MRI”，不是纯硬件

你的优势集中在：

- 脑影像数据分析；
- 时空动态与复杂网络；
- Python、PyTorch、科学计算；
- 机器学习模型评估；
- 研究代码和科研流程；
- 将复杂任务拆成可验证模块。

这些能力适合：

- ULF MRI 重建；
- EMI 信号预测与抑制；
- 低场到高场的域适配；
- 不确定性评估；
- 低场图像上的脑区、病灶或网络分析。

### 3. 你的核心缺口不是“更多 AI”，而是 MRI 原理与原始数据能力

最需要补齐的能力依次是：

1. MRI 信号方程、Bloch 方程、T1/T2、弛豫与 SNR；
2. k-space、Fourier 成像、采样轨迹和复数信号；
3. 多线圈成像、并行成像、压缩感知和数据一致性；
4. GRE、FSE、EPI、bSSFP、DWI、MT、MRA 等序列；
5. 低场 MRI 的 EMI、漂移、噪声和频率选择性；
6. 脉冲序列仿真、采集参数设计和基础硬件测试；
7. 医学图像重建中的幻觉、偏差、域外泛化和临床验证。

### 4. 你应优先形成一个“物理约束的计算研究作品”

最推荐的第一个方向是：

> **EMI-aware self-supervised reconstruction for shielding-free ultra-low-field MRI**

具体可以研究：

- 用模拟或公开低场 k-space 数据构造非平稳 EMI；
- 比较频域滤波、正交投影、传统估计和深度学习预测；
- 加入 data consistency，避免网络凭空生成结构；
- 用合成病灶、外部扫描数据和任务指标检查幻觉；
- 输出噪声功率、重建质量、结构保真度和下游任务性能，而不仅是 PSNR/SSIM。

这个方向同时连接了你的 AI、信号处理和脑影像背景，也直接贴合 BISPLab 的核心工作。

## 学习蓝图

### 0–3 周：建立 MRI 物理和 k-space 基础

目标不是读完所有 MRI 教材，而是能够自己解释并实现一个最小 MRI 成像系统。

学习内容：

- 线性代数、复数信号、傅里叶变换；
- Bloch 方程和旋转坐标系；
- T1/T2、T2*、翻转角、TR/TE；
- k-space 与图像的关系；
- 采样不足、噪声、卷积和点扩散函数；
- 低场下的信号、噪声和 EMI 问题。

必须完成的作品：

1. 用 Python 实现 Bloch simulation；
2. 从 Shepp–Logan phantom 生成 k-space 并反演图像；
3. 模拟欠采样、噪声、部分 Fourier 和运动伪影；
4. 写一篇 5–8 页技术笔记，解释“为什么低场 MRI 不是简单的低分辨率 MRI”。

验收标准：

- 能从采样矩阵推导图像伪影；
- 能区分图像域去噪和 k-space 重建；
- 能解释为什么一个视觉上更锐利的图像不一定更可信。

### 3–9 周：进入医学图像重建

学习内容：

- SENSE、GRAPPA 和并行成像；
- compressed sensing；
- conjugate gradient、TV regularization；
- complex-valued CNN；
- unrolled networks；
- self-supervised reconstruction；
- uncertainty estimation；
- MRI 中的 data consistency。

建议项目：

> **从多线圈 k-space 到可解释的低场 MRI 重建基线**

你需要实现至少三类方法：

1. 传统 Fourier/插值基线；
2. 压缩感知或变分优化基线；
3. 一个带 data consistency 的深度展开网络。

不要一开始训练大型模型。先确保每个模型都能解释：

- 使用了什么物理假设；
- 使用了什么采样假设；
- 在什么条件下失败；
- 是否会产生不存在的结构。

输出：

- 一个干净的 GitHub repository；
- 一份复现实验报告；
- 一张模型、采样、数据一致性和评估指标的关系图。

### 9–18 周：专攻 ULF-specific 问题

这一阶段开始进入 BISPLab 的真正技术语境。

重点一：EMI elimination

- 多传感线圈与主接收线圈的关系；
- 非平稳噪声和窄带干扰；
- 信号预测、投影、频域抑制；
- 训练后逐次扫描适配；
- 传统方法与深度学习方法的公平比较。

重点二：低场图像形成

- 低场 3D FSE、GRE、bSSFP；
- partial Fourier；
- 单次采集与多次 NEX 的权衡；
- 低分辨率采集到高分辨率重建；
- 低场域与高场域之间的 domain shift。

重点三：任务驱动评估

不要只问“图像看起来是否清晰”，还要问：

- 解剖结构是否保持？
- 小病灶是否被制造或消失？
- 下游分割、分类、配准是否稳定？
- 模型在不同患者、扫描协议和 EMI 条件下是否泛化？

建议形成一个明确的硕士后期项目：

> **Uncertainty-calibrated deep reconstruction for 0.05–0.055 T brain MRI**

可加入：

- 结构保真度损失；
- k-space data consistency；
- uncertainty map；
- lesion-preservation benchmark；
- high-field reference 只作为参考，不作为“真实图像生成器”。

### 18–36 周：形成博士申请级研究方向

此时再选择主线：

| 方向 | 与你的匹配度 | 需要补充 |
|---|---:|---|
| ULF AI 重建与 EMI 抑制 | 很高 | MRI 物理、原始数据、实验验证 |
| 低场 MRI 临床脑影像分析 | 高 | 临床协议、病灶任务、医学统计 |
| MRI 硬件与电磁系统 | 中等 | 电磁仿真、RF/梯度、CAD、仪器测试 |
| 光遗传学高场 fMRI | 中高 | 动物实验、光遗传学、电生理 |
| 低场 fMRI 脑网络动力学 | 高但风险较高 | 低场功能信号、时间序列 SNR、实验协议 |

对你来说，最稳妥的博士叙事是：

> 我有脑时空动力学和计算神经影像基础，现在希望把这些能力延伸到 MRI 的物理数据生成和计算图像形成，研究低场条件下的 EMI 抑制、物理一致性重建和面向临床任务的不确定性建模。

这比“我想把大模型应用到 MRI”更接近 BISPLab 的实际研究语言。

## 推荐的四个项目阶梯

### 项目 A：MRI 物理模拟器

输入：采样轨迹、TR、TE、翻转角、T1/T2。  
输出：模拟 k-space、重建图像和伪影。  
验收：能复现欠采样、噪声和弛豫变化。

### 项目 B：低场 k-space 重建基线

输入：多线圈、欠采样或低信噪比 k-space。  
输出：Fourier、压缩感知、深度展开三类重建。  
验收：公开数据、固定划分、可复现实验和失败案例。

### 项目 C：EMI 感知与消除

输入：MRI 接收线圈和辅助 EMI sensing coils。  
输出：传统投影、滤波、CNN 预测三类 EMI 消除结果。  
验收：在不同干扰频率、幅度和非平稳条件下保持结构真实性。

### 项目 D：面向脑影像任务的 ULF 重建

输入：低场脑 MRI。  
输出：重建图像、病灶/脑区任务、uncertainty map。  
验收：重建质量与下游任务不能互相掩盖；必须报告模型失败和不确定区域。

## 每周投入建议

如果你每周能稳定投入 12–15 小时：

- 4 小时：MRI 物理和教材；
- 4 小时：实现和复现实验；
- 3 小时：阅读 BISPLab 和低场 MRI 论文；
- 2 小时：整理实验记录、失败案例和研究笔记；
- 1–2 小时：补充硬件、序列或医学统计知识。

你的 AI-agent 能力可以用来自动化实验管理、超参数记录、评测和文献整理，但不要让 agent 替代你理解 MRI 信号模型。

## 需要重点阅读的顺序

1. BISPLab 的 [ULF 研究页](https://www4.hku.hk/bisplab/research-area1.html)；
2. [A low-cost and shielding-free ultra-low-field brain MRI scanner](https://doi.org/10.1038/s41467-021-27317-1)；
3. [Deep learning enabled fast 3D brain MRI at 0.055 tesla](https://doi.org/10.1126/sciadv.adi9327)；
4. [Whole-body magnetic resonance imaging at 0.05 Tesla](https://doi.org/10.1126/science.adm7168)；
5. BISPLab 论文清单中的 EMI、M4Raw、bSSFP、MT 和 MRA 论文；
6. 再系统学习 MRI 重建、并行成像和脉冲序列。

## Risks / Unanswered

- BISPLab 官网展示的是团队公开版图，具体博士项目、仪器开放程度、导师当前招生名额和数据权限仍需单独确认。
- 你的个人主页属于个人自述来源；我没有把主页中的论文状态、奖项和未来日期信息当作独立验证的外部事实。
- ULF MRI 的临床价值不能仅由图像视觉质量判断，需要病灶检测、重复性、跨设备泛化和临床读片研究。
- 你目前在高层计算神经影像方面较强，但还没有公开显示出 MRI 原始 k-space、脉冲序列或硬件实验经历。这是最可能影响申请竞争力的短板。
- 如果未来目标是 BISPLab 的硬件方向，需要额外补充电磁仿真、RF/梯度线圈、3D CAD 和仪器测试；如果目标是 AI 方向，则优先完成项目 B/C/D。

**证据审查结果：主要研究方向和代表性成果由团队官网与原始论文支持；你的优势和短板由个人主页与招聘要求进行映射；学习时长、项目顺序和优先级属于基于证据的规划建议，不是外部事实。**