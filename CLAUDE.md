# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

呈尚策划数据统计系统是一个基于Web的Excel数据分析工具集，包含三个核心模块：
- **绩效统计模块** (`jixiaotongji/`) - 店铺绩效数据分析和统计
- **门店ID统计模块** (`mendianidtongji/`) - 基于门店ID的精准数据分析和统计
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
- 绩效统计模块: `http://localhost:8000/jixiaotongji/`
- 门店ID统计模块: `http://localhost:8000/mendianidtongji/`
- 服务商统计模块: `http://localhost:8000/fuwushangtongji/`

## 技术架构

### 前端技术栈
- **UI框架**: Layui 2.9.0 (通过CDN加载)
- **图表库**: ECharts (仅服务商统计模块)
- **Excel处理**: XLSX.js
- **模块系统**: ES6 Modules
- **样式**: CSS3 原生样式

### 核心模块架构

#### 绩效统计模块 (`jixiaotongji/`)
- **main.js**: 主业务逻辑，包含Excel文件处理、数据分析、结果展示和导出功能
- **数据流程**: 文件上传 → Excel解析 → 店铺数据筛选 → 金额统计 → 绩效计算 → 结果导出
- **核心功能**:
  - `readExcelFile()` - Excel文件读取和解析
  - `analyzeData()` - 店铺数据分析和汇总
  - `calculatePerformance()` - 绩效金额计算

#### 门店ID统计模块 (`mendianidtongji/`)
- **main.js**: 主业务逻辑，基于门店ID精确匹配的数据分析系统
- **数据流程**: 文件上传 → Excel解析 → 门店ID精确匹配 → 金额统计 → 绩效计算 → 结果导出
- **核心功能**:
  - `readExcelFile()` - Excel文件读取和解析
  - `analyzeData()` - 基于门店ID的精确数据分析
  - `calculatePerformance()` - 绩效金额计算
- **核心特性**:
  - 门店ID精确匹配，避免商家名称变更问题
  - 数据匹配状态显示（匹配成功/未找到数据）
  - 支持多门店ID批量查询

#### 服务商统计模块 (`fuwushangtongji/`)
采用模块化架构设计：
- **main.js**: 程序入口，事件绑定和模块协调
- **dataProcessor.js**: 数据处理核心类，负责Excel解析和多维度数据分析
- **chartRenderer.js**: 图表渲染类，基于ECharts实现数据可视化  
- **utils.js**: 工具函数集合，包含表格创建、数据导出、错误处理等

### 数据处理模式

#### Excel数据格式要求
标准字段结构：
- 日期、商家名称、门店ID、结算周期、费用类型、结算金额(元)、扣费说明

#### 数据处理流程
1. **文件读取**: 使用FileReader API + XLSX.js解析
2. **数据清洗**: 数据类型转换、空值处理、金额格式化
3. **分析计算**: 分组统计、汇总计算、排序处理
4. **结果展示**: 动态表格生成、图表渲染
5. **数据导出**: Excel文件生成、图表图片保存

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
<link rel="stylesheet" href="https://cdn.staticfile.org/layui/2.9.0/css/layui.css">
<script src="https://cdn.staticfile.org/layui/2.9.0/layui.js"></script>

<!-- Excel处理库 -->
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

<!-- ECharts图表库（服务商统计模块） -->
<script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
```

## 关键业务逻辑

### 绩效统计核心算法
- 店铺数据筛选：基于商家名称的模糊匹配
- 结算天数计算：通过结算周期去重统计
- 绩效计算：总金额 × 绩效百分比

### 服务商统计分析维度
- **每日汇总分析**：按结算周期统计店铺数量和结算总额
- **店铺汇总分析**：按商家名称统计总结算金额和结算天数
- **数据可视化**：时间序列图表展示趋势变化

### 数据导出功能
- 支持Excel格式导出（.xlsx）
- 图表保存为PNG格式图片
- 自动生成时间戳文件名

## 调试和排错

### 常见问题处理
- Excel文件解析失败：检查文件格式和字段结构
- 数据分析结果为空：确认数据完整性和店铺名称匹配
- 图表显示异常：检查ECharts库加载状态
- 导出功能异常：确认浏览器下载权限设置

### 开发调试技巧
- 使用浏览器开发者工具查看网络请求状态
- 检查控制台错误日志定位问题
- 验证Excel数据结构和字段映射关系