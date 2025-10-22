# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

呈尚策划数据统计系统是一个专业的Excel/CSV数据分析工具集，提供现代化的Web界面和强大的数据处理能力。系统包含**六个核心功能模块**：

- **🍔 饿了么门店ID统计专业版** (`eleme-pro/`) - 专为饿了么平台设计的代运营结算统计系统（⭐推荐）
- **🍱 美团门店ID统计专业版** (`mendianid-pro/`) - 专为美团平台设计的门店ID数据分析平台（⭐推荐）
- **💜 饿了么固定费用统计** (`daiyunying-pro/`) - 饿了么固定费用结算统计系统（⭐新增）
- **🍜 饿了么服务商统计** (`eleme-fuwushang/`) - 专为饿了么平台设计的代运营账单多维度分析系统
- **🔧 美团服务商统计** (`fuwushangtongji/`) - 专为美团平台设计的服务商结算数据多维度分析
- **📊 店铺数据可视化** (`dianpushujukeshihua/`) - CSV数据的多维度趋势分析

**已废弃模块**（仅保留兼容性）：
- ~~绩效统计模块 (`jixiaotongji/`)~~ - 已被平台专属模块替代
- ~~门店ID统计基础版 (`mendianidtongji/`)~~ - 已被专业版替代

## 常用开发命令

### 本地开发服务器
**重要**：由于项目使用ES6模块，必须通过HTTP服务器运行，直接打开HTML文件会导致CORS错误。

```bash
# Python方案（推荐）
python -m http.server 8000

# Node.js方案
npx serve .

# PHP方案
php -S localhost:8000
```

### 访问地址
- 主页面: `http://localhost:8000/`
- 饿了么门店ID统计专业版: `http://localhost:8000/eleme-pro/` （⭐推荐）
- 美团门店ID统计专业版: `http://localhost:8000/mendianid-pro/` （⭐推荐）
- 饿了么固定费用统计: `http://localhost:8000/daiyunying-pro/` （⭐新增）
- 饿了么服务商统计: `http://localhost:8000/eleme-fuwushang/`
- 美团服务商统计: `http://localhost:8000/fuwushangtongji/`
- 店铺数据可视化: `http://localhost:8000/dianpushujukeshihua/`

### 键盘快捷键（主页面）
- 按键 **1**: 饿了么门店ID统计专业版
- 按键 **2**: 美团门店ID统计专业版
- 按键 **3**: 美团服务商统计
- 按键 **4**: 饿了么服务商统计
- 按键 **5**: 饿了么固定费用统计

## 技术架构

### 前端技术栈
- **UI框架**: Layui 2.9.0 (通过CDN加载)
- **图标库**: Font Awesome 6.4.0 (专业版模块使用)
- **图表库**: ECharts 5.4.3 (服务商统计和数据可视化模块)
- **Excel处理**: XLSX.js 0.18.5
- **模块系统**: ES6 Modules
- **样式**: CSS3 原生样式 + 渐变效果 + 毛玻璃特效（专业版）

### 核心模块架构说明

#### 🍔 饿了么门店ID统计专业版 (`eleme-pro/`)
**设计理念**: 专为饿了么平台账单格式优化，支持9位门店ID批量统计

**文件结构**:
```
eleme-pro/
├── index.html              # 饿了么主题页面
└── assets/
    ├── js/main.js         # 核心业务逻辑
    └── css/styles.css     # 饿了么蓝色主题样式
```

**数据流程**:
```
拖拽上传饿了么账单Excel → 智能解析 → 门店ID批量匹配 → 代运营结算金额统计 → 绩效计算 → 专业报告导出
```

**核心功能函数**:
- `readExcelFile()` - 智能Excel文件解析（支持饿了么特殊格式）
- `analyzeData()` - 基于门店ID的精确数据分析
- `calculatePerformance()` - 动态绩效金额计算
- `updateStatistics()` - 实时统计卡片更新

**饿了么专属特性**:
- 支持饿了么周期账单Excel格式（9位门店ID）
- 自动识别字段：门店id、代运营结算金额、门店名称、账单日期
- 按账单日期去重计算结算天数
- 饿了么蓝色主题 (#0089ff)

#### 🍱 美团门店ID统计专业版 (`mendianid-pro/`)
**设计理念**: 专为美团平台账单格式优化，现代化UI设计

**文件结构**:
```
mendianid-pro/
├── index.html              # 美团主题页面
└── assets/
    ├── js/main.js         # 核心业务逻辑
    └── css/styles.css     # 美团黄色主题样式
```

**数据流程**:
```
拖拽上传美团账单 → 智能Excel解析 → 门店ID精确匹配 → 实时统计更新 → 专业报告导出
```

**核心功能函数**:
- `readExcelFile()` - 智能Excel文件解析（支持特殊格式检测）
- `analyzeData()` - 基于8位门店ID的精确数据分析
- `calculatePerformance()` - 动态绩效金额计算
- `updateStatistics()` - 实时统计卡片更新

**美团专属特性**:
- 完美适配美团代运营账单格式（8位门店ID）
- 智能Excel格式检测（自动识别标题行）
- 美团黄色主题 (#FFD100)
- 拖拽上传支持（文件验证和格式检测）
- 实时统计卡片（查询门店总数、找到数据门店、总结算天数、汇总金额）
- Font Awesome专业图标库

#### 💜 饿了么固定费用统计 (`daiyunying-pro/`)
**设计理念**: 饿了么固定费用结算统计，紫色主题UI

**文件结构**:
```
daiyunying-pro/
├── index.html              # 固定费用统计页面
└── assets/
    ├── js/main.js         # 核心业务逻辑
    └── css/styles.css     # 紫色主题样式
```

**核心特性**:
- 优雅紫色主题UI设计 (#9b59b6)
- 实时统计卡片和结算周期统计
- 智能识别特殊Excel格式
- 拖拽上传和批量数据处理
- 绩效计算和专业报告导出

#### 🍜 饿了么服务商统计 (`eleme-fuwushang/`)
**设计理念**: 采用模块化ES6架构，专为饿了么平台服务商账单设计

**文件结构**:
```
eleme-fuwushang/
├── index.html              # 饿了么服务商主题页面
├── main.js                 # 程序入口，事件绑定和模块协调
├── dataProcessor.js        # 数据处理核心类
├── chartRenderer.js        # 图表渲染类
└── utils.js                # 工具函数集合
```

**模块化架构**:
- **main.js**: 程序入口，负责事件绑定和模块协调
- **dataProcessor.js**: 数据处理核心类
  - `processExcelFile()` - 处理饿了么周期账单Excel
  - `analyzeDailySummary()` - 按账单日期统计门店数和结算额
  - `analyzeStoreSummary()` - 按门店名称+门店id统计金额和天数
  - `getChartData()` - 生成图表数据
- **chartRenderer.js**: 饿了么主题图表渲染器
  - 双图表展示：门店数量趋势、结算金额趋势
  - 饿了么品牌色：#0089ff（蓝色）、#00d170（绿色）
- **utils.js**: 工具函数（表格创建、Excel导出、图表保存）

**数据流程**:
```
上传饿了么账单 → Excel解析 → 按日期/门店统计 → ECharts图表渲染 → Excel/PNG导出
```

#### 🔧 美团服务商统计 (`fuwushangtongji/`)
**设计理念**: 采用模块化ES6架构，专为美团平台服务商账单设计

**文件结构**:
```
fuwushangtongji/
├── index.html              # 美团服务商主题页面
├── main.js                 # 程序入口
├── dataProcessor.js        # 数据处理核心类
├── chartRenderer.js        # 图表渲染类
├── utils.js                # 工具函数集合
└── styles.css              # 样式文件
```

**模块化架构**:
- **main.js**: 程序入口，事件绑定和模块协调
- **dataProcessor.js**: 数据处理核心类（ES6类语法）
  - `processExcelFile()` - 处理美团服务商结算Excel
  - `analyzeDailySummary()` - 按结算周期统计店铺数和结算额
  - `analyzeStoreSummary()` - 按商家名称统计金额和天数
  - `getChartData()` - 生成图表数据
- **chartRenderer.js**: 图表渲染类，基于ECharts实现数据可视化
- **utils.js**: 工具函数集合（表格创建、数据导出、错误处理）

**数据流程**:
```
上传美团结算Excel → Excel解析 → 按日期/店铺统计 → ECharts图表渲染 → Excel/PNG导出
```

#### 📊 店铺数据可视化模块 (`dianpushujukeshihua/`)
**设计理念**: CSV数据的多维度趋势分析引擎

**文件结构**:
```
dianpushujukeshihua/
├── index.html              # 可视化主页面
└── assets/
    └── js/main.js         # 数据可视化核心逻辑
```

**核心功能函数**:
- `handleFileSelect()` - CSV文件读取和解析
- `analyzeData()` - 6种核心指标计算
- `initializeCharts()` - ECharts图表初始化
- `renderCharts()` - 多维度图表渲染
- `switchChartType()` - 图表类型切换（折线图/柱状图/面积图）

**数据流程**:
```
CSV上传 → 数据解析 → 指标计算 → 多图表渲染 → 趋势分析展示
```

**可视化指标**:
- 📊 曝光量趋势
- 👆 点击量变化
- 💰 花费金额统计
- 🎯 点击率分析
- 💵 平均点击花费
- 🔄 转化率监控

### 数据处理模式

#### Excel数据格式要求

**饿了么平台格式**（9位门店ID）:
- 字段结构：合同编号、门店id、合同类型、代运营结算金额、代运营收入、技术服务费（抽佣）、结算类型、入账状态、代运营服务编号、门店名称、入账日期、账单日期、合同状态

**美团平台格式**（8位门店ID）:
- 字段结构：日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明

**注意事项**:
- 门店ID统计专业版支持特殊Excel格式，可自动识别第一行为标题行（如"代运营账单"）
- 饿了么使用9位门店ID，美团使用8位门店ID
- 服务商统计模块默认跳过第一行（标题行）

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
- **语法**: 使用ES6+语法特性
- **模块化**: 采用ES6 Modules（`import`/`export`）
- **命名规范**:
  - 函数命名：驼峰命名法 (camelCase)
  - 类名：帕斯卡命名法 (PascalCase)
  - 常量：大写下划线命名 (UPPER_SNAKE_CASE)

### 错误处理策略
- 所有异步操作必须使用try-catch包装
- 提供用户友好的错误提示信息（使用layui的layer.msg）
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

### 饿了么门店ID统计核心算法
- **精确匹配策略**：基于门店ID（9位数字）进行精确匹配
- **智能格式检测**：自动识别Excel特殊格式（如首行为标题）
- **数据聚合**：按门店ID汇总代运营结算金额和结算天数
- **绩效计算公式**：绩效金额 = 总金额 × (绩效百分比 / 100)
- **匹配状态标识**：区分"匹配成功"和"未找到数据"

### 美团门店ID统计核心算法
- **精确匹配策略**：基于门店ID（8位数字）进行精确匹配，避免商家名称变更问题
- **智能格式检测**：自动识别Excel特殊格式（如首行为"代运营账单"标题）
- **数据聚合**：按门店ID汇总结算金额和结算天数
- **绩效计算公式**：绩效金额 = 总金额 × (绩效百分比 / 100)
- **匹配状态标识**：区分"匹配成功"和"未找到数据"（表示当月无抽点收入）

### 店铺数据可视化核心算法
- **多指标计算**：曝光量、点击量、花费金额、点击率、平均点击花费、转化率
- **趋势分析**：时间序列数据的变化趋势可视化
- **图表类型**：支持折线图（默认）、柱状图、面积图三种展示方式
- **CSV解析**：自动解析CSV格式数据并提取字段

### 服务商统计分析维度
**饿了么服务商统计**:
- **按日期统计**：按账单日期统计门店数量和结算金额总和
- **按门店统计**：按门店名称+门店id统计总结算金额和结算天数
- **数据可视化**：饿了么主题双图表展示趋势变化

**美团服务商统计**:
- **每日汇总分析**：按结算周期统计店铺数量和结算总额
- **店铺汇总分析**：按商家名称统计总结算金额和结算天数
- **数据可视化**：美团主题双图表展示趋势变化

### 数据导出功能
- **Excel导出**：.xlsx格式，包含统计数据和绩效计算结果
- **图表导出**：PNG格式图片（服务商统计模块）
- **文件命名**：自动生成时间戳文件名（如：统计结果_20250107_143520.xlsx）
- **专业报告**（专业版）：包含汇总统计、详细数据和绩效计算

## 调试和排错

### 常见问题处理

**Excel文件解析失败**：
- 检查文件格式（必须为.xlsx或.xls）
- 确认字段结构完整
  - 饿了么：门店id、代运营结算金额、门店名称、账单日期
  - 美团：日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明
- 使用专业版时确认文件符合格式要求（支持特殊标题行）

**数据分析结果为空**：
- 确认Excel数据完整性（是否有数据行）
- 检查门店ID输入是否正确
  - 饿了么：门店ID必须为9位数字
  - 美团：门店ID必须为8位数字
- 检查门店ID格式（每行一个，不要有空格或其他字符）

**图表显示异常**：
- 检查ECharts库是否正常加载（查看Network面板）
- 确认数据格式符合图表要求
- 检查浏览器控制台是否有JavaScript错误
- 确保数据量足够（至少需要2条数据才能绘制趋势图）

**导出功能异常**：
- 确认浏览器支持文件下载（Chrome 80+, Firefox 75+, Safari 13+）
- 检查是否被浏览器弹窗拦截器拦截
- 确认XLSX.js库正常加载

**拖拽上传不工作**（专业版）：
- 确认浏览器支持Drag and Drop API
- 检查文件类型是否为Excel格式
- 查看控制台是否有拖拽事件错误

**CSV文件解析失败**（数据可视化模块）：
- 确认文件格式为CSV（逗号分隔）
- 检查字段结构（日期、曝光量、点击量、花费、点击率、平均点击花费、转化数）
- 确认数据编码为UTF-8

**ES6模块加载失败**：
- 确认已启动HTTP服务器（不能直接打开HTML文件）
- 检查浏览器控制台的CORS错误
- 确认浏览器支持ES6模块（现代浏览器均支持）

### 开发调试技巧
- 使用浏览器开发者工具（F12）查看网络请求状态
- 检查控制台错误日志定位问题（每个模块都有详细的日志输出）
- 验证Excel/CSV数据结构和字段映射关系
- 使用Network面板检查CDN资源加载状态
- 清除浏览器缓存后重新测试
- 确认本地服务器正常运行（ES6模块依赖HTTP协议）
- 使用`console.log`输出中间数据进行调试

### 项目文件结构
```
呈尚策划数据统计系统/
├── index.html                           # 主页面入口
├── favicon.svg                          # 网站图标
├── eleme-pro/                           # 饿了么门店ID统计专业版 ⭐
│   ├── index.html
│   └── assets/
│       ├── js/main.js                  # 饿了么核心业务逻辑
│       └── css/styles.css              # 饿了么蓝色主题
├── mendianid-pro/                       # 美团门店ID统计专业版 ⭐
│   ├── index.html
│   └── assets/
│       ├── js/main.js                  # 美团核心业务逻辑
│       └── css/styles.css              # 美团黄色主题
├── daiyunying-pro/                      # 饿了么固定费用统计 ⭐
│   ├── index.html
│   └── assets/
│       ├── js/main.js                  # 固定费用核心逻辑
│       └── css/styles.css              # 紫色主题
├── eleme-fuwushang/                     # 饿了么服务商统计模块
│   ├── index.html
│   ├── main.js                         # 程序入口
│   ├── dataProcessor.js                # 数据处理器
│   ├── chartRenderer.js                # 图表渲染器
│   └── utils.js                        # 工具函数
├── fuwushangtongji/                     # 美团服务商统计模块
│   ├── index.html
│   ├── main.js                         # 程序入口
│   ├── dataProcessor.js                # 数据处理器
│   ├── chartRenderer.js                # 图表渲染器
│   ├── utils.js                        # 工具函数
│   └── styles.css
├── dianpushujukeshihua/                 # 店铺数据可视化模块
│   ├── index.html
│   └── assets/
│       └── js/main.js
├── jixiaotongji/                        # 旧版绩效统计（已废弃）
│   ├── index.html
│   └── assets/
│       ├── js/main.js
│       └── css/styles.css
├── mendianidtongji/                     # 旧版门店ID统计（已废弃）
│   ├── index.html
│   └── assets/
│       └── js/main.js
├── README.md                            # 项目文档
└── CLAUDE.md                            # 开发指南（本文件）
```

### 模块选择建议
- **饿了么门店ID统计专业版**：⭐推荐，适用于饿了么平台代运营结算统计，支持9位门店ID批量统计
- **美团门店ID统计专业版**：⭐推荐，适用于美团平台门店ID统计，支持8位门店ID精确匹配
- **饿了么固定费用统计**：⭐新增，适用于饿了么固定费用结算统计
- **饿了么服务商统计**：适用于饿了么平台服务商账单的多维度分析和图表可视化
- **美团服务商统计**：适用于美团平台服务商结算数据的多维度分析和图表可视化
- **店铺数据可视化**：适用于CSV格式的多维度趋势分析和图表展示

## 关键技术细节

### ES6模块化架构
服务商统计模块（`eleme-fuwushang/`、`fuwushangtongji/`）采用ES6模块化架构：

```javascript
// 导入模块
import { DataProcessor } from './dataProcessor.js';
import { ChartRenderer } from './chartRenderer.js';
import { utils } from './utils.js';

// 导出类
export class DataProcessor {
    // 类定义
}

// 导出工具函数
export const utils = {
    // 工具函数
};
```

**注意事项**：
- 必须通过HTTP服务器运行
- HTML中script标签需添加 `type="module"` 属性
- 导入路径必须包含文件扩展名（.js）

### Excel文件处理流程
```javascript
// 1. 读取文件
const reader = new FileReader();
reader.onload = (e) => {
    // 2. 解析Excel
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // 3. 获取工作表
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 4. 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,      // 不保留原始格式
        defval: '',      // 空值默认为空字符串
        range: 1         // 从第二行开始读取（跳过标题）
    });
};
reader.readAsArrayBuffer(file);
```

### 图表渲染最佳实践
```javascript
// 1. 初始化图表
const chart = echarts.init(document.getElementById('chartContainer'));

// 2. 配置选项
const option = {
    title: { text: '图表标题' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'value' },
    series: [{
        type: 'line',
        data: yAxisData
    }]
};

// 3. 渲染图表
chart.setOption(option);

// 4. 响应式调整
window.addEventListener('resize', () => {
    chart.resize();
});
```

### 数据导出最佳实践
```javascript
// Excel导出
const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
XLSX.writeFile(workbook, `统计结果_${timestamp}.xlsx`);

// 图表PNG导出
const imageUrl = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,  // 高清图片
    backgroundColor: '#fff'
});
// 创建下载链接
const link = document.createElement('a');
link.href = imageUrl;
link.download = `图表_${timestamp}.png`;
link.click();
```
