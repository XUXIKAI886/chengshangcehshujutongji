# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

呈尚策划数据统计系统是一个基于Web的Excel/CSV数据分析工具集，包含四个核心模块：
- **绩效统计模块** (`jixiaotongji/`) - 店铺绩效数据分析和统计
- **门店ID统计专业版** (`mendianid-pro/`) - 现代化门店ID数据分析平台（⭐推荐使用）
- **门店ID统计基础版** (`mendianidtongji/`) - 基础版门店ID数据统计
- **店铺数据可视化模块** (`dianpushujukeshihua/`) - CSV数据的多维度趋势分析
- **服务商统计模块** (`fuwushangtongji/`) - 服务商结算数据多维度分析

## 常用开发命令

### 本地开发服务器
由于项目使用ES6模块，需要通过HTTP服务器运行：

```bash
# Python方案
python -m http.server 8000

# Node.js方案  
npx serve .

# PHP方案
php -S localhost:8000
```

### 访问地址
- 主页面: `http://localhost:8000/`
- 绩效统计模块: `http://localhost:8000/jixiaotongji/`
- 门店ID统计专业版: `http://localhost:8000/mendianid-pro/` （⭐推荐）
- 门店ID统计基础版: `http://localhost:8000/mendianidtongji/`
- 店铺数据可视化: `http://localhost:8000/dianpushujukeshihua/`
- 服务商统计模块: `http://localhost:8000/fuwushangtongji/`

### 键盘快捷键（主页面）
- 按键 **1**: 跳转到绩效统计模块
- 按键 **2**: 跳转到门店ID统计专业版
- 按键 **3**: 跳转到服务商统计模块

## 技术架构

### 前端技术栈
- **UI框架**: Layui 2.9.0 (通过CDN加载)
- **图标库**: Font Awesome 6.4.0 (专业版模块使用)
- **图表库**: ECharts 5.4.3 (服务商统计和数据可视化模块)
- **Excel处理**: XLSX.js 0.18.5
- **模块系统**: ES6 Modules
- **样式**: CSS3 原生样式 + 渐变效果 + 毛玻璃特效（专业版）

### 核心模块架构

#### 绩效统计模块 (`jixiaotongji/`)
- **main.js**: 主业务逻辑，包含Excel文件处理、数据分析、结果展示和导出功能
- **数据流程**: 文件上传 → Excel解析 → 店铺数据筛选 → 金额统计 → 绩效计算 → 结果导出
- **核心功能**:
  - `readExcelFile()` - Excel文件读取和解析
  - `analyzeData()` - 店铺数据分析和汇总
  - `calculatePerformance()` - 绩效金额计算

#### 门店ID统计专业版 (`mendianid-pro/`) ⭐推荐
- **main.js**: 现代化核心业务逻辑，集成拖拽上传和实时统计
- **数据流程**: 拖拽上传 → 智能Excel解析 → 门店ID精确匹配 → 实时统计更新 → 专业报告导出
- **核心功能**:
  - `readExcelFile()` - 智能Excel文件解析（支持特殊格式检测）
  - `analyzeData()` - 基于门店ID的精确数据分析
  - `calculatePerformance()` - 动态绩效金额计算
  - `updateStatistics()` - 实时统计卡片更新
- **专业版特性**:
  - 🎨 现代化UI设计（渐变背景、毛玻璃效果、响应式布局）
  - 🚀 拖拽上传支持（文件验证和格式检测）
  - 📊 实时统计卡片（查询门店总数、找到数据门店、总结算天数、汇总金额）
  - 💡 Font Awesome专业图标库
  - 🔍 智能Excel格式检测（自动识别标题行和数据行）
  - 📋 专业报告导出（包含汇总统计和绩效计算）

#### 门店ID统计基础版 (`mendianidtongji/`)
- **main.js**: 基础版业务逻辑，简化的门店ID统计功能
- **数据流程**: 文件上传 → Excel解析 → 门店ID精确匹配 → 金额统计 → 绩效计算 → 结果导出
- **核心特性**:
  - 门店ID精确匹配，避免商家名称变更问题
  - 数据匹配状态显示（匹配成功/未找到数据）
  - 支持多门店ID批量查询

#### 店铺数据可视化模块 (`dianpushujukeshihua/`)
- **main.js**: 数据可视化核心逻辑，基于ECharts的趋势分析引擎
- **数据流程**: CSV上传 → 数据解析 → 指标计算 → 多图表渲染 → 趋势分析展示
- **核心功能**:
  - `handleFileSelect()` - CSV文件读取和解析
  - `analyzeData()` - 6种核心指标计算
  - `initializeCharts()` - ECharts图表初始化
  - `renderCharts()` - 多维度图表渲染
  - `switchChartType()` - 图表类型切换（折线图/柱状图/面积图）
- **核心特性**:
  - 📊 6种核心指标可视化（曝光量、点击量、花费金额、点击率、平均点击花费、转化率）
  - 🎨 交互式ECharts图表（支持缩放、数据点提示）
  - 🔄 图表类型切换（折线图、柱状图、面积图）
  - 📁 CSV格式数据导入
  - 📱 响应式设计，自动适配屏幕尺寸

#### 服务商统计模块 (`fuwushangtongji/`)
采用模块化架构设计：
- **main.js**: 程序入口，事件绑定和模块协调
- **dataProcessor.js**: 数据处理核心类，负责Excel解析和多维度数据分析
- **chartRenderer.js**: 图表渲染类，基于ECharts实现数据可视化  
- **utils.js**: 工具函数集合，包含表格创建、数据导出、错误处理等

### 数据处理模式

#### Excel数据格式要求（绩效统计、门店ID统计模块）
标准字段结构：
- 日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明

**注意**：门店ID统计专业版支持特殊Excel格式，可自动识别第一行为标题行（如"代运营账单"）

#### CSV数据格式要求（店铺数据可视化模块）
标准字段结构：
- 日期、曝光量、点击量、花费、点击率、平均点击花费、转化数

#### 数据处理流程
1. **文件读取**: 使用FileReader API + XLSX.js（Excel）或原生解析（CSV）
2. **格式检测**: 智能识别Excel特殊格式（专业版）
3. **数据清洗**: 数据类型转换、空值处理、金额格式化、去重处理
4. **分析计算**: 分组统计、汇总计算、排序处理、趋势分析
5. **结果展示**: 动态表格生成、图表渲染、实时统计卡片更新
6. **数据导出**: Excel文件生成、图表图片保存

## 开发约定

### 代码规范
- 使用ES6+语法特性
- 采用模块化设计模式
- 函数命名使用驼峰命名法
- 类名使用帕斯卡命名法
- 常量使用大写下划线命名

### 错误处理策略
- 所有异步操作必须使用try-catch包装
- 提供用户友好的错误提示信息
- 在控制台输出详细的错误日志用于调试

### 性能优化原则
- 大文件处理使用流式读取
- 图表渲染实现防抖处理
- DOM操作进行批量更新
- 避免频繁的数据重新计算

### CDN依赖管理
项目依赖以下CDN资源：
```html
<!-- Layui UI框架 -->
<link rel="stylesheet" href="https://unpkg.com/layui@2.9.0/dist/css/layui.css">
<script src="https://unpkg.com/layui@2.9.0/dist/layui.js"></script>

<!-- Font Awesome图标库（门店ID统计专业版） -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Excel处理库 -->
<script src="https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- ECharts图表库（服务商统计和数据可视化模块） -->
<script src="https://unpkg.com/echarts@5.4.3/dist/echarts.min.js"></script>
```

**注意**：项目需要通过HTTP服务器运行以支持ES6模块和CORS策略

## 关键业务逻辑

### 绩效统计核心算法
- **店铺数据筛选**：基于商家名称的模糊匹配（包含关系）
- **结算天数计算**：通过结算周期去重统计
- **绩效计算公式**：绩效金额 = 总金额 × (绩效百分比 / 100)

### 门店ID统计核心算法
- **精确匹配策略**：基于门店ID（8位数字）进行精确匹配，避免商家名称变更问题
- **智能格式检测**：自动识别Excel特殊格式（如首行为"代运营账单"标题）
- **数据聚合**：按门店ID汇总结算金额和结算天数
- **匹配状态标识**：区分"匹配成功"和"未找到数据"（表示当月无抽点收入）

### 店铺数据可视化核心算法
- **多指标计算**：曝光量、点击量、花费金额、点击率、平均点击花费、转化率
- **趋势分析**：时间序列数据的变化趋势可视化
- **图表类型**：支持折线图（默认）、柱状图、面积图三种展示方式
- **CSV解析**：自动解析CSV格式数据并提取字段

### 服务商统计分析维度
- **每日汇总分析**：按结算周期统计店铺数量和结算总额
- **店铺汇总分析**：按商家名称统计总结算金额和结算天数
- **数据可视化**：时间序列图表展示趋势变化

### 数据导出功能
- **Excel导出**：.xlsx格式，包含统计数据和绩效计算结果
- **图表导出**：PNG格式图片
- **文件命名**：自动生成时间戳文件名（如：统计结果_20250107_143520.xlsx）
- **专业报告**（专业版）：包含汇总统计、详细数据和绩效计算

## 调试和排错

### 常见问题处理
- **Excel文件解析失败**：
  - 检查文件格式（必须为.xlsx或.xls）
  - 确认字段结构完整（日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明）
  - 使用专业版时确认文件符合格式要求（支持特殊标题行）

- **数据分析结果为空**：
  - 确认Excel数据完整性（是否有数据行）
  - 检查店铺名称或门店ID输入是否正确
  - 绩效统计模块：店铺名称需要精确或包含关系
  - 门店ID统计模块：门店ID必须为8位数字

- **图表显示异常**：
  - 检查ECharts库是否正常加载（查看Network面板）
  - 确认数据格式符合图表要求
  - 检查浏览器控制台是否有JavaScript错误

- **导出功能异常**：
  - 确认浏览器支持文件下载（Chrome 80+, Firefox 75+, Safari 13+）
  - 检查是否被浏览器弹窗拦截器拦截
  - 确认XLSX.js库正常加载

- **拖拽上传不工作**（专业版）：
  - 确认浏览器支持Drag and Drop API
  - 检查文件类型是否为Excel格式
  - 查看控制台是否有拖拽事件错误

- **CSV文件解析失败**（数据可视化模块）：
  - 确认文件格式为CSV（逗号分隔）
  - 检查字段结构（日期、曝光量、点击量、花费、点击率、平均点击花费、转化数）
  - 确认数据编码为UTF-8

### 开发调试技巧
- 使用浏览器开发者工具（F12）查看网络请求状态
- 检查控制台错误日志定位问题（每个模块都有详细的日志输出）
- 验证Excel/CSV数据结构和字段映射关系
- 使用Network面板检查CDN资源加载状态
- 清除浏览器缓存后重新测试
- 确认本地服务器正常运行（ES6模块依赖HTTP协议）

### 项目文件结构
```
呈尚策划数据统计系统/
├── index.html                           # 主页面入口
├── favicon.svg                          # 网站图标
├── jixiaotongji/                        # 绩效统计模块
│   ├── index.html
│   └── assets/
│       ├── js/main.js                  # 核心业务逻辑
│       └── css/styles.css
├── mendianid-pro/                       # 门店ID统计专业版 ⭐
│   ├── index.html
│   └── assets/
│       ├── js/main.js                  # 专业版核心逻辑
│       └── css/styles.css
├── mendianidtongji/                     # 门店ID统计基础版
│   ├── index.html
│   └── assets/
│       └── js/main.js
├── dianpushujukeshihua/                 # 店铺数据可视化模块
│   ├── index.html
│   └── assets/
│       └── js/main.js
├── fuwushangtongji/                     # 服务商统计模块
│   ├── index.html
│   ├── main.js                         # 程序入口
│   ├── dataProcessor.js                # 数据处理器
│   ├── chartRenderer.js                # 图表渲染器
│   ├── utils.js                        # 工具函数
│   └── styles.css
├── README.md                            # 项目文档
└── CLAUDE.md                            # 开发指南（本文件）
```

### 模块选择建议
- **绩效统计**：适用于基于商家名称的模糊匹配统计
- **门店ID统计专业版**：⭐推荐，适用于需要精确门店ID统计、现代化UI和实时统计卡片的场景
- **门店ID统计基础版**：适用于简单的门店ID统计需求
- **店铺数据可视化**：适用于CSV格式的多维度趋势分析和图表展示
- **服务商统计**：适用于服务商结算数据的多维度分析和图表可视化