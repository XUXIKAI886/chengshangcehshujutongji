# 呈尚策划数据统计系统

## 项目简介

呈尚策划数据统计系统是一个专业的Excel数据分析工具集，包含三个核心功能模块：
- **绩效统计模块**：针对店铺绩效数据进行分析和统计
- **门店ID统计模块**：基于门店ID进行精准数据分析和统计
- **服务商统计模块**：对服务商结算数据进行多维度分析

## 功能特性

### 绩效统计模块 (`jixiaotongji`)
- 📊 Excel文件导入和解析
- 🏪 多店铺数据批量分析
- 💰 自动计算结算金额和绩效
- 📈 可配置绩效百分比
- 📋 结果数据导出为Excel
- 🔄 一键重置功能

### 门店ID统计模块 (`mendianidtongji`)
- 🏪 门店ID精确匹配查询
- 📊 多门店ID批量分析
- 💰 自动计算结算金额和绩效
- ✅ 数据匹配状态显示
- 📋 结果数据导出为Excel
- 🎯 避免商家名称变更问题

### 服务商统计模块 (`fuwushangtongji`)
- 📁 Excel数据文件处理
- 📊 每日店铺数量和结算额统计
- 🏬 店铺结算总额和天数分析
- 📈 ECharts可视化图表
- 💾 多格式数据导出
- 🖼️ 图表保存为图片

## 技术架构

### 前端技术栈
- **UI框架**: Layui 2.9.0
- **图表库**: ECharts
- **Excel处理**: XLSX.js
- **模块化**: ES6 Modules
- **样式**: CSS3 + Flexbox/Grid

### 项目结构
```
呈尚策划数据统计系统/
├── jixiaotongji/                 # 绩效统计模块
│   ├── index.html               # 主页面
│   ├── assets/
│   │   ├── js/
│   │   │   └── main.js         # 核心业务逻辑
│   │   └── css/
│   │       └── styles.css      # 样式文件
├── mendianidtongji/             # 门店ID统计模块
│   ├── index.html              # 主页面
│   ├── assets/
│   │   ├── js/
│   │   │   └── main.js         # 核心业务逻辑
│   │   └── css/
│   │       └── styles.css      # 样式文件
├── fuwushangtongji/             # 服务商统计模块
│   ├── index.html              # 主页面
│   ├── main.js                 # 主程序入口
│   ├── dataProcessor.js        # 数据处理器
│   ├── chartRenderer.js        # 图表渲染器
│   ├── utils.js                # 工具函数
│   └── styles.css              # 样式文件
└── README.md                   # 项目文档
```

### 核心模块说明

#### 绩效统计模块架构
- **main.js**: 主业务逻辑，包含文件处理、数据分析、结果展示
- **功能流程**: 文件上传 → 数据解析 → 店铺筛选 → 金额统计 → 绩效计算 → 结果导出

#### 门店ID统计模块架构
- **main.js**: 主业务逻辑，基于门店ID精确匹配的数据分析
- **功能流程**: 文件上传 → 数据解析 → 门店ID匹配 → 金额统计 → 绩效计算 → 结果导出
- **核心特性**: 精确匹配门店ID，避免商家名称变更导致的数据匹配问题

#### 服务商统计模块架构
- **main.js**: 程序入口和事件绑定
- **dataProcessor.js**: 数据处理核心类，负责Excel解析和数据分析
- **chartRenderer.js**: 图表渲染类，基于ECharts实现数据可视化
- **utils.js**: 工具函数集合，包含表格创建、数据导出等

## 安装指南

### 环境要求
- 现代浏览器（Chrome 80+, Firefox 75+, Safari 13+）
- 支持ES6模块的环境
- 网络连接（用于加载CDN资源）

### 部署步骤

1. **克隆项目**
```bash
git clone [项目地址]
cd 呈尚策划数据统计系统
```

2. **启动本地服务器**
```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

3. **访问应用**
- 绩效统计: `http://localhost:8000/jixiaotongji/`
- 门店ID统计: `http://localhost:8000/mendianidtongji/`
- 服务商统计: `http://localhost:8000/fuwushangtongji/`

## 使用说明

### 绩效统计模块使用流程

1. **数据准备**
   - 准备包含以下字段的Excel文件：
     - 日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明

2. **操作步骤**
   ```
   选择Excel文件 → 输入店铺名称 → 设置绩效百分比 → 开始分析 → 查看结果 → 导出数据
   ```

### 门店ID统计模块使用流程

1. **数据准备**
   - 准备包含以下字段的Excel文件：
     - 日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明

2. **操作步骤**
   ```
   选择Excel文件 → 输入门店ID → 设置绩效百分比 → 开始分析 → 查看结果 → 导出数据
   ```

3. **核心优势**
   - **精确匹配**: 基于门店ID进行精确匹配，避免商家名称变更导致的数据丢失
   - **状态显示**: 清晰显示每个门店ID的匹配状态（匹配成功/未找到数据）
   - **批量处理**: 支持多个门店ID同时查询分析

3. **输入格式**
   - 店铺名称：每行一个，支持模糊匹配
   - 绩效百分比：数字格式，如：15（表示15%）

### 服务商统计模块使用流程

1. **数据导入**
   - 上传Excel格式的结算数据文件

2. **分析操作**
   ```
   文件上传 → 店铺数和结算额分析 → 店铺结算统计分析 → 生成图表 → 导出结果
   ```

3. **功能说明**
   - **分析1**: 统计每天的店铺数量和结算总额
   - **分析2**: 统计每个店铺的结算总额和结算天数
   - **图表**: 生成可视化图表展示数据趋势

## API文档

### 绩效统计模块核心函数

#### `readExcelFile(file)`
读取并解析Excel文件
- **参数**: `file` - File对象
- **返回**: Promise<Array> - 解析后的数据数组
- **异常**: 文件格式错误、解析失败

#### `analyzeData(data, shops)`
分析店铺数据
- **参数**: 
  - `data` - Excel数据数组
  - `shops` - 店铺名称数组
- **功能**: 计算各店铺结算天数和金额汇总

#### `calculatePerformance()`
计算绩效金额
- **功能**: 根据总金额和绩效百分比计算绩效

### 服务商统计模块核心类

#### `DataProcessor`
数据处理器类
```javascript
// 处理Excel文件
async processExcelFile(file)

// 分析每日汇总
analyzeDailySummary()

// 分析店铺汇总  
analyzeStoreSummary()

// 获取图表数据
getChartData()
```

#### `ChartRenderer`
图表渲染器类
```javascript
// 渲染图表
render(data)

// 获取当前图表实例
getCurrentChart()

// 调整图表大小
resize()
```

## 配置说明

### CDN资源配置
```html
<!-- Layui框架 -->
<link rel="stylesheet" href="https://cdn.staticfile.org/layui/2.9.0/css/layui.css">
<script src="https://cdn.staticfile.org/layui/2.9.0/layui.js"></script>

<!-- Excel处理库 -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- 图表库（仅服务商统计模块） -->
<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
```

### 样式主题配置
- 主色调：`#1890ff`（蓝色系）
- 成功色：`#52c41a`（绿色）
- 背景色：`#f8f9fa`（浅灰）
- 卡片阴影：`0 2px 12px 0 rgba(0,0,0,0.1)`

## 开发指南

### 代码规范
- 使用ES6+语法
- 采用模块化开发
- 函数命名使用驼峰命名法
- 类名使用帕斯卡命名法
- 常量使用大写下划线命名

### 错误处理
- 所有异步操作使用try-catch包装
- 用户友好的错误提示
- 详细的控制台错误日志

### 性能优化
- 大文件处理使用流式读取
- 图表渲染防抖处理
- DOM操作批量更新

## 常见问题

### Q: Excel文件上传失败？
A: 请检查文件格式是否为.xlsx或.xls，文件大小不超过10MB

### Q: 数据分析结果为空？
A: 请确认Excel文件包含必要的字段，且店铺名称输入正确

### Q: 图表显示异常？
A: 请检查网络连接，确保ECharts库正常加载

### Q: 导出功能不工作？
A: 请确保浏览器支持文件下载，检查是否被弹窗拦截

## 更新日志

### v1.0.0 (2025-01-XX)
- ✨ 初始版本发布
- 🎯 绩效统计模块完成
- 📊 服务商统计模块完成
- 🎨 UI界面优化
- 📱 响应式设计支持

## 许可证

本项目为开源项目，可自由使用和修改。

## 联系方式

- 开发团队：呈尚策划
- 技术支持：[联系方式]
- 项目地址：[项目仓库地址]

---

© 2025 呈尚策划 - 保留所有权利