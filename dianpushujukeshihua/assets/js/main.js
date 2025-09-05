// 店铺数据可视化主程序
// 全局变量
let csvData = null;
let charts = {};
let currentChartType = 'line';

// DOM元素
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const analyzeBtn = document.getElementById('analyzeBtn');
const barChartBtn = document.getElementById('barChartBtn');
const areaChartBtn = document.getElementById('areaChartBtn');
const lineChartBtn = document.getElementById('lineChartBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const statsArea = document.getElementById('statsArea');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeCharts();
});

// 初始化事件监听器
function initializeEventListeners() {
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 按钮事件
    analyzeBtn.addEventListener('click', analyzeData);
    barChartBtn.addEventListener('click', () => switchChartType('bar'));
    areaChartBtn.addEventListener('click', () => switchChartType('area'));
    lineChartBtn.addEventListener('click', () => switchChartType('line'));
    exportBtn.addEventListener('click', exportCharts);
    resetBtn.addEventListener('click', resetAll);
    
    // 窗口大小改变
    window.addEventListener('resize', resizeCharts);
}

// 初始化图表
function initializeCharts() {
    const chartIds = ['incomeChart', 'revenueChart', 'exposureChart', 'visitorsChart', 'conversionChart', 'ordersChart'];
    
    chartIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            charts[id] = echarts.init(element);
        }
    });
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        
        if (file.name.toLowerCase().endsWith('.csv')) {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                complete: function(results) {
                    csvData = results.data;
                    layui.layer.msg('CSV文件加载成功', {icon: 1});
                    analyzeBtn.disabled = false;
                },
                error: function(error) {
                    layui.layer.msg('文件解析失败: ' + error.message, {icon: 2});
                }
            });
        } else {
            layui.layer.msg('请选择CSV文件', {icon: 2});
            fileInput.value = '';
        }
    }
}

// 分析数据
function analyzeData() {
    if (!csvData || csvData.length === 0) {
        layui.layer.msg('没有数据可分析', {icon: 2});
        return;
    }
    
    try {
        // 处理数据
        const processedData = processCSVData(csvData);
        
        // 更新统计信息
        updateStatistics(processedData);
        
        // 渲染图表
        renderCharts(processedData);
        
        layui.layer.msg('数据分析完成', {icon: 1});
    } catch (error) {
        layui.layer.msg('数据分析失败: ' + error.message, {icon: 2});
        console.error('分析错误:', error);
    }
}

// 处理CSV数据
function processCSVData(data) {
    const processed = {
        dates: [],
        income: [],
        revenue: [],
        exposure: [],
        visitors: [],
        conversion: [],
        orders: [],
        stats: {
            totalDays: 0,
            totalIncome: 0,
            totalRevenue: 0,
            avgExposure: 0,
            avgVisitors: 0,
            avgConversion: 0,
            totalOrders: 0
        }
    };
    
    // 过滤有效数据
    const validData = data.filter(row => row.日期 && row.日期.trim() !== '');
    
    validData.forEach(row => {
        // 解析日期
        const date = row.日期 || '';
        if (date) {
            processed.dates.push(date);
        }
        
        // 解析各项数据
        processed.income.push(parseFloat(row.收入 || 0));
        processed.revenue.push(parseFloat(row.营业额 || 0));
        processed.exposure.push(parseInt(row.曝光人数 || 0));
        processed.visitors.push(parseInt(row.入店人数 || 0));
        processed.conversion.push(parseFloat(row.转化率 || 0));
        processed.orders.push(parseInt(row.下单人数 || 0));
    });
    
    // 计算统计数据
    processed.stats.totalDays = validData.length;
    processed.stats.totalIncome = processed.income.reduce((sum, val) => sum + val, 0);
    processed.stats.totalRevenue = processed.revenue.reduce((sum, val) => sum + val, 0);
    processed.stats.avgExposure = processed.exposure.reduce((sum, val) => sum + val, 0) / validData.length || 0;
    processed.stats.avgVisitors = processed.visitors.reduce((sum, val) => sum + val, 0) / validData.length || 0;
    processed.stats.avgConversion = processed.conversion.reduce((sum, val) => sum + val, 0) / validData.length || 0;
    processed.stats.totalOrders = processed.orders.reduce((sum, val) => sum + val, 0);
    
    return processed;
}

// 更新统计信息
function updateStatistics(data) {
    const stats = data.stats;
    
    // 更新天数徽章
    const badge = document.querySelector('.layui-badge');
    if (badge) {
        badge.textContent = `共${stats.totalDays}天`;
    }
    
    // 创建统计卡片
    const statsHTML = `
        <div class="stats-item">
            <div class="stats-item-label">总收入</div>
            <div class="stats-item-value">¥${stats.totalIncome.toFixed(2)}</div>
            <div class="stats-details">
                <div class="stats-detail-item">
                    <div>平均日收入</div>
                    <div class="stats-detail-value">¥${(stats.totalIncome / stats.totalDays).toFixed(2)}</div>
                </div>
            </div>
        </div>
        <div class="stats-item">
            <div class="stats-item-label">总营业额</div>
            <div class="stats-item-value">¥${stats.totalRevenue.toFixed(2)}</div>
            <div class="stats-details">
                <div class="stats-detail-item">
                    <div>平均日营业额</div>
                    <div class="stats-detail-value">¥${(stats.totalRevenue / stats.totalDays).toFixed(2)}</div>
                </div>
            </div>
        </div>
        <div class="stats-item">
            <div class="stats-item-label">平均曝光人数</div>
            <div class="stats-item-value">${Math.round(stats.avgExposure)}</div>
            <div class="stats-details">
                <div class="stats-detail-item">
                    <div>总曝光</div>
                    <div class="stats-detail-value">${Math.round(stats.avgExposure * stats.totalDays)}</div>
                </div>
            </div>
        </div>
        <div class="stats-item">
            <div class="stats-item-label">平均入店人数</div>
            <div class="stats-item-value">${Math.round(stats.avgVisitors)}</div>
            <div class="stats-details">
                <div class="stats-detail-item">
                    <div>总入店</div>
                    <div class="stats-detail-value">${Math.round(stats.avgVisitors * stats.totalDays)}</div>
                </div>
            </div>
        </div>
        <div class="stats-item">
            <div class="stats-item-label">平均转化率</div>
            <div class="stats-item-value">${stats.avgConversion.toFixed(2)}%</div>
            <div class="stats-details">
                <div class="stats-detail-item">
                    <div>最高转化率</div>
                    <div class="stats-detail-value">${Math.max(...data.conversion).toFixed(2)}%</div>
                </div>
            </div>
        </div>
        <div class="stats-item">
            <div class="stats-item-label">总下单人数</div>
            <div class="stats-item-value">${stats.totalOrders}</div>
            <div class="stats-details">
                <div class="stats-detail-item">
                    <div>平均日下单</div>
                    <div class="stats-detail-value">${Math.round(stats.totalOrders / stats.totalDays)}</div>
                </div>
            </div>
        </div>
    `;
    
    statsArea.innerHTML = statsHTML;
}

// 渲染图表
function renderCharts(data) {
    const chartConfigs = [
        { id: 'incomeChart', title: '收入趋势', data: data.income, color: '#1890ff', unit: '元' },
        { id: 'revenueChart', title: '营业额趋势', data: data.revenue, color: '#52c41a', unit: '元' },
        { id: 'exposureChart', title: '曝光人数趋势', data: data.exposure, color: '#faad14', unit: '人' },
        { id: 'visitorsChart', title: '入店人数趋势', data: data.visitors, color: '#722ed1', unit: '人' },
        { id: 'conversionChart', title: '转化率趋势', data: data.conversion, color: '#f5222d', unit: '%' },
        { id: 'ordersChart', title: '下单人数趋势', data: data.orders, color: '#13c2c2', unit: '人' }
    ];
    
    chartConfigs.forEach(config => {
        if (charts[config.id]) {
            const option = createChartOption(config, data.dates);
            charts[config.id].setOption(option);
        }
    });
}

// 创建图表配置
function createChartOption(config, dates) {
    const option = {
        title: {
            text: config.title,
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const param = params[0];
                return `${param.name}<br/>${config.title}: ${param.value}${config.unit}`;
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: `{value}${config.unit}`
            }
        },
        series: [{
            name: config.title,
            type: currentChartType,
            data: config.data,
            smooth: true,
            itemStyle: {
                color: config.color
            },
            areaStyle: currentChartType === 'area' ? {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: config.color
                    }, {
                        offset: 1, color: config.color + '20'
                    }]
                }
            } : undefined
        }]
    };
    
    return option;
}

// 切换图表类型
function switchChartType(type) {
    currentChartType = type;
    
    // 更新按钮状态
    document.querySelectorAll('.layui-btn-primary').forEach(btn => {
        btn.classList.remove('layui-btn-normal');
    });
    
    if (type === 'bar') {
        barChartBtn.classList.add('layui-btn-normal');
    } else if (type === 'area') {
        areaChartBtn.classList.add('layui-btn-normal');
    } else {
        lineChartBtn.classList.add('layui-btn-normal');
    }
    
    // 重新渲染图表
    if (csvData) {
        analyzeData();
    }
}

// 导出图表
function exportCharts() {
    if (!csvData) {
        layui.layer.msg('没有数据可导出', {icon: 2});
        return;
    }
    
    // 使用html2canvas导出图表
    const chartElements = document.querySelectorAll('.chart-area');
    let exportCount = 0;
    
    chartElements.forEach((element, index) => {
        html2canvas(element).then(canvas => {
            const link = document.createElement('a');
            link.download = `图表_${index + 1}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            exportCount++;
            if (exportCount === chartElements.length) {
                layui.layer.msg('图表导出完成', {icon: 1});
            }
        });
    });
}

// 重置所有数据
function resetAll() {
    csvData = null;
    fileInput.value = '';
    fileName.textContent = '';
    analyzeBtn.disabled = true;
    
    // 清空图表
    Object.values(charts).forEach(chart => {
        chart.clear();
    });
    
    // 清空统计
    statsArea.innerHTML = '';
    
    // 重置天数徽章
    const badge = document.querySelector('.layui-badge');
    if (badge) {
        badge.textContent = '共0天';
    }
    
    layui.layer.msg('已重置所有数据', {icon: 1});
}

// 调整图表大小
function resizeCharts() {
    Object.values(charts).forEach(chart => {
        chart.resize();
    });
}
