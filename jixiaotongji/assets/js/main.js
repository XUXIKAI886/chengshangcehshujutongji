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
            const hasFile = this.files.length > 0;
            analyzeBtn.disabled = !hasFile;
            
            if (hasFile) {
                const file = this.files[0];
                const fileName = file.name;
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                const isXls = fileName.toLowerCase().endsWith('.xls');
                const isXlsx = fileName.toLowerCase().endsWith('.xlsx');
                
                if (isXls || isXlsx) {
                    const formatType = isXls ? 'XLS' : 'XLSX';
                    layui.layer.msg(`已选择${formatType}文件: ${fileName} (${fileSize}MB)`, {icon: 1, time: 2000});
                } else {
                    layui.layer.msg('请选择Excel文件格式（.xls 或 .xlsx）', {icon: 2});
                    this.value = '';
                    analyzeBtn.disabled = true;
                }
            }
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

        // 检查文件格式
        const fileName = file.name.toLowerCase();
        const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        if (!isValidFormat) {
            layui.layer.msg('请选择有效的Excel文件格式（.xlsx 或 .xls）！');
            return;
        }

        // 检查文件大小（限制为10MB）
        if (file.size > 10 * 1024 * 1024) {
            layui.layer.msg('文件大小不能超过10MB！');
            return;
        }

        // 检查店铺名称输入
        const shops = shopNames.value.trim().split('\n').filter(shop => shop.trim());
        if (shops.length === 0) {
            layui.layer.msg('请输入至少一个店铺名称！');
            return;
        }

        // 显示加载提示
        const loadingIndex = layui.layer.load(1, {
            shade: [0.1, '#000']
        });

        try {
            // 读取并解析Excel文件
            const data = await readExcelFile(file);
            if (!data) return;

            // 分析数据
            analyzeData(data, shops);
            
            layui.layer.msg('分析完成！', {icon: 1});
        } finally {
            layui.layer.close(loadingIndex);
        }

    } catch (error) {
        console.error('分析过程中发生错误:', error);
        layui.layer.msg('分析过程中发生错误: ' + error.message, {icon: 2});
    }
}

// 读取Excel文件
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        // 检查XLSX库是否已加载
        if (typeof XLSX === 'undefined') {
            reject(new Error('Excel处理库未加载，请刷新页面重试'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                
                // 使用更宽松的选项来支持xls和xlsx格式
                const workbook = XLSX.read(data, { 
                    type: 'array',
                    cellDates: true,
                    cellNF: false,
                    cellText: false
                });
                
                // 检查工作簿是否有效
                if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                    throw new Error('Excel文件格式不正确或文件为空');
                }
                
                // 获取第一个工作表
                const firstSheetName = workbook.SheetNames[0];
                const firstSheet = workbook.Sheets[firstSheetName];
                
                if (!firstSheet) {
                    throw new Error('无法读取Excel工作表');
                }
                
                // 先获取原始数据以检查内容
                const rawData = XLSX.utils.sheet_to_json(firstSheet, { 
                    header: 1,  // 使用数组格式
                    defval: ''
                });
                
                if (!rawData || rawData.length < 2) {
                    throw new Error('Excel文件内容为空或只有标题行');
                }
                
                // 转换为JSON数据,跳过第一行（标题行）
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
                    range: 1,  // 从第二行开始
                    header: ["日期", "商家名称", "门店ID", "结算周期", "费用类型", "结算金额(元)", "扣费说明"],
                    defval: ''
                });
                
                if (!jsonData || jsonData.length === 0) {
                    throw new Error('Excel文件中没有有效的数据行');
                }
                
                console.log(`成功读取Excel文件，共${jsonData.length}行数据`);
                resolve(jsonData);
                
            } catch (error) {
                console.error('Excel解析错误:', error);
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