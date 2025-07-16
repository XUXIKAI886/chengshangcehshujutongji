/* global layui, XLSX */

// 全局变量
let currentData = null;
let totalAmount = 0;

// DOM 元素
const fileInput = document.getElementById('fileInput');
const shopNames = document.getElementById('shopNames');
const performancePercent = document.getElementById('performancePercent');
const analyzeBtn = document.getElementById('analyzeBtn');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const resultTable = document.getElementById('resultTable');
const performanceResult = document.getElementById('performanceResult');

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 初始化layui模块
    layui.use(['table', 'layer'], function() {
        analyzeBtn.addEventListener('click', startAnalysis);
        exportBtn.addEventListener('click', exportData);
        resetBtn.addEventListener('click', resetAll);
        performancePercent.addEventListener('input', calculatePerformance);
        
        // 监听文件选择
        fileInput.addEventListener('change', function() {
            analyzeBtn.disabled = !this.files.length;
        });
    });
});

// 开始分析
async function startAnalysis() {
    try {
        // 检查文件输入
        const file = fileInput.files[0];
        if (!file) {
            layui.layer.msg('请选择Excel文件！');
            return;
        }

        // 检查店铺名称输入
        const shops = shopNames.value.trim().split('\n').filter(shop => shop.trim());
        if (shops.length === 0) {
            layui.layer.msg('请输入至少一个店铺名称！');
            return;
        }

        // 读取并解析Excel文件
        const data = await readExcelFile(file);
        if (!data) return;

        // 分析数据
        analyzeData(data, shops);

    } catch (error) {
        console.error('分析过程中发生错误:', error);
        layui.layer.msg('分析过程中发生错误: ' + error.message);
    }
}

// 读取Excel文件
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 获取第一个工作表
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // 转换为JSON数据,跳过第一行
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                    range: 1,  // 从第二行开始
                    header: ["日期", "商家名称", "门店ID", "结算周期", "费用类型", "结算金额(元)", "扣费说明"]
                });
                
                resolve(jsonData);
            } catch (error) {
                reject(new Error('Excel文件解析失败: ' + error.message));
            }
        };
        
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsArrayBuffer(file);
    });
}

// 分析数据
function analyzeData(data, shops) {
    try {
        // 清空现有结果
        resultTable.innerHTML = '';
        totalAmount = 0;
        currentData = [];

        // 创建表格结构
        const table = document.createElement('table');
        table.className = 'layui-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>店铺名称</th>
                    <th>结算总天数</th>
                    <th>汇总金额</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        // 分析每个店铺的数据
        shops.forEach(shopName => {
            shopName = shopName.trim();
            if (!shopName) return;

            // 筛选该店铺的数据
            const shopData = data.filter(row => 
                row['商家名称'] && row['商家名称'].includes(shopName)
            );

            // 计算结算天数和总金额
            const settlementDays = new Set(shopData.map(row => row['结算周期'])).size;
            const amount = shopData.reduce((sum, row) => sum + (parseFloat(row['结算金额(元)']) || 0), 0);
            
            // 添加到总金额
            totalAmount += amount;

            // 保存数据
            currentData.push({
                shopName,
                settlementDays,
                amount
            });

            // 创建表格行
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shopName}</td>
                <td>${settlementDays}</td>
                <td>${formatCurrency(amount)}</td>
            `;
            tbody.appendChild(row);
        });

        // 添加总计行
        const totalRow = document.createElement('tr');
        totalRow.className = 'layui-bg-gray';
        totalRow.innerHTML = `
            <td><strong>总计</strong></td>
            <td></td>
            <td><strong>${formatCurrency(totalAmount)}</strong></td>
        `;
        tbody.appendChild(totalRow);

        // 添加表格到结果区域
        resultTable.appendChild(table);

        // 启用导出按钮
        exportBtn.disabled = false;

        // 计算绩效金额
        calculatePerformance();

    } catch (error) {
        console.error('数据分析失败:', error);
        layui.layer.msg('数据分析失败: ' + error.message);
    }
}

// 计算绩效金额
function calculatePerformance() {
    const percent = parseFloat(performancePercent.value) || 0;
    const performance = totalAmount * (percent / 100);
    
    // 更新绩效结果显示
    performanceResult.innerHTML = `
        <div class="info-item">
            <div class="info-label">绩效金额 (${percent}%)</div>
            <div class="info-value">${formatCurrency(performance)}</div>
        </div>
    `;
}

// 导出数据
function exportData() {
    try {
        if (!currentData || currentData.length === 0) {
            layui.layer.msg('没有可导出的数据！');
            return;
        }

        // 创建工作簿
        const wb = XLSX.utils.book_new();
        
        // 准备数据
        const exportData = currentData.map(item => ({
            '店铺名称': item.shopName,
            '结算总天数': item.settlementDays,
            '汇总金额': item.amount
        }));
        
        // 添加总计行
        exportData.push({
            '店铺名称': '总计',
            '结算总天数': '',
            '汇总金额': totalAmount
        });

        // 创建工作表
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // 设置列宽
        ws['!cols'] = [
            { wch: 40 },  // 店铺名称列
            { wch: 15 },  // 结算总天数列
            { wch: 20 }   // 汇总金额列
        ];

        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '分析结果');

        // 生成文件名
        const fileName = `店铺分析结果_${formatDate(new Date())}.xlsx`;
        
        // 导出文件
        XLSX.writeFile(wb, fileName);

    } catch (error) {
        console.error('导出失败:', error);
        layui.layer.msg('导出失败: ' + error.message);
    }
}

// 重置所有数据
function resetAll() {
    layui.layer.confirm('确定要重置所有数据吗？', {
        btn: ['确定', '取消']
    }, function() {
        fileInput.value = '';
        shopNames.value = '';
        performancePercent.value = '';
        resultTable.innerHTML = '';
        performanceResult.innerHTML = '0.00';
        currentData = null;
        totalAmount = 0;
        layui.layer.closeAll();
    });
}

// 工具函数：格式化货币
function formatCurrency(value) {
    return new Intl.NumberFormat('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

// 工具函数：格式化日期
function formatDate(date) {
    return date.toISOString().split('T')[0].replace(/-/g, '');
} 