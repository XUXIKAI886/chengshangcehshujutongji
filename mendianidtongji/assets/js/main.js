/* global layui, XLSX */

console.log('main.js文件开始执行...');

// 全局变量
let currentData = null;
let totalAmount = 0;

// 通用消息显示函数
function showMessage(message, type = 'info') {
    if (typeof layui !== 'undefined' && layui.layer) {
        const iconMap = {
            'success': 1,
            'error': 2,
            'warning': 3,
            'info': 0
        };
        layui.layer.msg(message, {icon: iconMap[type] || 0, time: 2000});
    } else {
        // 备用方案：使用原生alert
        const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : type === 'warning' ? '⚠️ ' : 'ℹ️ ';
        alert(prefix + message);
    }
}

// DOM 元素 - 在DOM加载完成后获取
let fileInput, storeIds, performancePercent, analyzeBtn, exportBtn, resetBtn, resultTable, performanceResult;

// 获取DOM元素
function getDOMElements() {
    fileInput = document.getElementById('fileInput');
    storeIds = document.getElementById('storeIds');
    performancePercent = document.getElementById('performancePercent');
    analyzeBtn = document.getElementById('analyzeBtn');
    exportBtn = document.getElementById('exportBtn');
    resetBtn = document.getElementById('resetBtn');
    resultTable = document.getElementById('resultTable');
    performanceResult = document.getElementById('performanceResult');

    console.log('DOM元素获取结果:', {
        fileInput: !!fileInput,
        storeIds: !!storeIds,
        performancePercent: !!performancePercent,
        analyzeBtn: !!analyzeBtn,
        exportBtn: !!exportBtn,
        resetBtn: !!resetBtn,
        resultTable: !!resultTable,
        performanceResult: !!performanceResult
    });
}

// 事件监听
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化...');

    // 首先获取DOM元素
    getDOMElements();

    // 检查关键元素是否存在
    if (!fileInput || !analyzeBtn) {
        console.error('关键DOM元素未找到', {
            fileInput: !!fileInput,
            analyzeBtn: !!analyzeBtn
        });
        return;
    }

    console.log('DOM元素获取成功');

    // 立即初始化事件监听器，不等待Layui
    initializeEventListeners();

    // 尝试初始化layui模块（异步）
    if (typeof layui !== 'undefined') {
        layui.use(['table', 'layer'], function() {
            console.log('Layui模块加载成功');
        });
    } else {
        console.warn('Layui未加载，使用基础功能');
    }
});

// 初始化事件监听器
function initializeEventListeners() {
    console.log('开始初始化事件监听器...');

    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', startAnalysis);
        console.log('分析按钮事件已绑定');
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
        console.log('导出按钮事件已绑定');
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetAll);
        console.log('重置按钮事件已绑定');
    }

    if (performancePercent) {
        performancePercent.addEventListener('input', calculatePerformance);
        console.log('绩效百分比输入事件已绑定');
    }

    // 监听文件选择
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            console.log('文件选择事件触发，文件数量:', this.files.length);

            const hasFile = this.files.length > 0;
            const fileNameSpan = document.getElementById('fileName');

            if (hasFile) {
                const file = this.files[0];
                const fileName = file.name;
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                const isXls = fileName.toLowerCase().endsWith('.xls');
                const isXlsx = fileName.toLowerCase().endsWith('.xlsx');

                console.log('选择的文件:', fileName, '大小:', fileSize + 'MB');

                if (isXls || isXlsx) {
                    const formatType = isXls ? 'XLS' : 'XLSX';
                    if (fileNameSpan) {
                        fileNameSpan.textContent = `✅ ${fileName} (${fileSize}MB)`;
                        fileNameSpan.style.color = '#52c41a';
                    }
                    analyzeBtn.disabled = false;
                    showMessage(`已选择${formatType}文件: ${fileName} (${fileSize}MB)`, 'success');
                } else {
                    if (fileNameSpan) {
                        fileNameSpan.textContent = '❌ 请选择Excel文件格式（.xls 或 .xlsx）';
                        fileNameSpan.style.color = '#ff4d4f';
                    }
                    showMessage('请选择Excel文件格式（.xls 或 .xlsx）', 'error');
                    this.value = '';
                    analyzeBtn.disabled = true;
                }
            } else {
                if (fileNameSpan) {
                    fileNameSpan.textContent = '';
                }
                analyzeBtn.disabled = true;
            }
        });
        console.log('文件输入事件已绑定');
    } else {
        console.error('文件输入元素未找到');
    }

    console.log('事件监听器初始化完成');
}

// 开始分析
function startAnalysis() {
    const file = fileInput.files[0];
    const storeIdList = storeIds.value.trim().split('\n').filter(id => id.trim());
    
    if (!file) {
        showMessage('请选择Excel文件', 'error');
        return;
    }

    if (storeIdList.length === 0) {
        showMessage('请输入至少一个门店ID', 'error');
        return;
    }

    showMessage('正在分析数据...', 'info');

    readExcelFile(file)
        .then(data => {
            analyzeData(data, storeIdList);
            exportBtn.disabled = false;
        })
        .catch(error => {
            showMessage('文件读取失败: ' + error.message, 'error');
        });
}

// 读取Excel文件
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    reject(new Error('Excel文件为空'));
                    return;
                }

                console.log('Excel数据字段名:', Object.keys(jsonData[0]));
                console.log('前3行数据预览:', jsonData.slice(0, 3));

                // 显示数据预览
                showDataPreview(jsonData.slice(0, 5));

                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 显示数据预览
function showDataPreview(data) {
    const previewTable = document.getElementById('previewTable');
    
    if (data.length === 0) {
        previewTable.innerHTML = '<p>暂无数据</p>';
        return;
    }
    
    const headers = Object.keys(data[0]);
    let tableHTML = '<table class="layui-table"><thead><tr>';
    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';
    
    data.forEach(row => {
        tableHTML += '<tr>';
        headers.forEach(header => {
            tableHTML += `<td>${row[header] || ''}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    previewTable.innerHTML = tableHTML;
}

// 分析数据
function analyzeData(data, storeIdList) {
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
                    <th>门店ID</th>
                    <th>商家名称</th>
                    <th>结算总天数</th>
                    <th>汇总金额</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        // 分析每个门店ID的数据
        storeIdList.forEach(storeId => {
            storeId = storeId.trim();
            if (!storeId) return;

            // 筛选该门店ID的数据 - 精确匹配门店ID
            // 支持多种可能的字段名称，并处理数字格式的门店ID
            const storeData = data.filter(row => {
                const storeIdValue = row['门店ID'] || row['门店id'] || row['店铺ID'] || row['店铺id'] || row['storeId'] || row['StoreID'];
                if (!storeIdValue) return false;

                // 将门店ID转换为字符串进行比较（处理数字格式）
                const rowStoreId = String(storeIdValue).trim();
                const inputStoreId = String(storeId).trim();

                return rowStoreId === inputStoreId;
            });

            console.log(`门店ID ${storeId} 匹配到 ${storeData.length} 条记录`);

            if (storeData.length === 0) {
                // 如果没有找到精确匹配，添加一行显示未找到
                const row = document.createElement('tr');
                row.style.backgroundColor = '#fff2f0';
                row.innerHTML = `
                    <td>${storeId}</td>
                    <td style="color: #ff4d4f;">未找到数据</td>
                    <td>0</td>
                    <td>¥0.00</td>
                `;
                tbody.appendChild(row);
                
                // 保存数据
                currentData.push({
                    storeId,
                    storeName: '未找到数据',
                    settlementDays: 0,
                    amount: 0
                });
                return;
            }

            // 获取商家名称（取第一条记录的商家名称）
            const storeName = storeData[0]['商家名称'] || '未知商家';

            // 计算结算天数和总金额
            const settlementDays = new Set(storeData.map(row =>
                row['结算周期'] || row['结算周期'] || row['周期'] || row['period']
            )).size;

            const amount = storeData.reduce((sum, row) => {
                const amountValue = row['结算金额(元)'] || row['结算金额'] || row['金额'] || row['amount'] || row['Amount'];
                const numericAmount = parseFloat(amountValue) || 0;
                return sum + numericAmount;
            }, 0);

            console.log(`门店ID ${storeId} 总金额: ${amount.toFixed(2)}`);
            
            // 添加到总金额
            totalAmount += amount;

            // 保存数据
            currentData.push({
                storeId,
                storeName,
                settlementDays,
                amount
            });

            // 创建表格行
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${storeId}</strong></td>
                <td>${storeName}</td>
                <td>${settlementDays}</td>
                <td>${formatCurrency(amount)}</td>
            `;
            tbody.appendChild(row);
        });

        // 添加汇总行
        const summaryRow = document.createElement('tr');
        summaryRow.style.backgroundColor = '#f6ffed';
        summaryRow.style.fontWeight = 'bold';
        summaryRow.innerHTML = `
            <td colspan="3">总计</td>
            <td style="color: #52c41a; font-size: 16px;">${formatCurrency(totalAmount)}</td>
        `;
        tbody.appendChild(summaryRow);

        resultTable.appendChild(table);
        
        // 计算绩效
        calculatePerformance();
        
        showMessage(`分析完成！共分析${storeIdList.length}个门店ID`, 'success');

    } catch (error) {
        showMessage('数据分析失败: ' + error.message, 'error');
        console.error('分析错误:', error);
    }
}

// 格式化货币
function formatCurrency(amount) {
    return '¥' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 计算绩效金额
function calculatePerformance() {
    const percent = parseFloat(performancePercent.value) || 0;
    const performance = totalAmount * (percent / 100);
    
    // 更新绩效结果显示
    performanceResult.innerHTML = `
        <div class="info-item">
            <div class="info-label">总结算金额</div>
            <div class="info-value">${formatCurrency(totalAmount)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">绩效百分比</div>
            <div class="info-value">${percent}%</div>
        </div>
        <div class="info-item">
            <div class="info-label">绩效金额</div>
            <div class="info-value" style="color: #52c41a;">${formatCurrency(performance)}</div>
        </div>
        <div class="info-item">
            <div class="info-label">门店数量</div>
            <div class="info-value">${currentData ? currentData.length : 0}</div>
        </div>
    `;
}

// 导出数据
function exportData() {
    if (!currentData || currentData.length === 0) {
        showMessage('没有数据可导出', 'error');
        return;
    }
    
    try {
        const percent = parseFloat(performancePercent.value) || 0;
        const performance = totalAmount * (percent / 100);
        
        // 准备导出数据
        const exportData = currentData.map(item => ({
            '门店ID': item.storeId,
            '商家名称': item.storeName,
            '结算总天数': item.settlementDays,
            '汇总金额': item.amount.toFixed(2)
        }));
        
        // 添加汇总信息
        exportData.push({
            '门店ID': '总计',
            '商家名称': '',
            '结算总天数': '',
            '汇总金额': totalAmount.toFixed(2)
        });
        
        exportData.push({
            '门店ID': '绩效百分比',
            '商家名称': percent + '%',
            '结算总天数': '',
            '汇总金额': ''
        });
        
        exportData.push({
            '门店ID': '绩效金额',
            '商家名称': performance.toFixed(2),
            '结算总天数': '',
            '汇总金额': ''
        });
        
        // 创建工作簿
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "门店ID统计结果");
        
        // 生成文件名
        const now = new Date();
        const timestamp = now.getFullYear() + 
                         String(now.getMonth() + 1).padStart(2, '0') + 
                         String(now.getDate()).padStart(2, '0') + '_' +
                         String(now.getHours()).padStart(2, '0') + 
                         String(now.getMinutes()).padStart(2, '0');
        
        const filename = `门店ID统计结果_${timestamp}.xlsx`;
        
        // 导出文件
        XLSX.writeFile(workbook, filename);
        
        showMessage('导出成功！', 'success');

    } catch (error) {
        showMessage('导出失败: ' + error.message, 'error');
        console.error('导出错误:', error);
    }
}

// 重置所有数据
function resetAll() {
    fileInput.value = '';
    storeIds.value = '';
    performancePercent.value = '';
    resultTable.innerHTML = '';
    performanceResult.innerHTML = '';
    document.getElementById('previewTable').innerHTML = '';

    // 清空文件名显示
    const fileNameSpan = document.getElementById('fileName');
    if (fileNameSpan) {
        fileNameSpan.textContent = '';
        fileNameSpan.style.color = '#52c41a';
    }

    currentData = null;
    totalAmount = 0;

    analyzeBtn.disabled = true;
    exportBtn.disabled = true;

    showMessage('已重置所有数据', 'success');
}

// 全局测试函数
window.testFileInput = function() {
    console.log('测试文件输入功能...');
    const input = document.getElementById('fileInput');
    if (input) {
        console.log('文件输入元素存在');
        input.click();
    } else {
        console.error('文件输入元素不存在');
    }
};

// 全局调试函数
window.debugApp = function() {
    console.log('应用调试信息:', {
        fileInput: !!fileInput,
        layuiLoaded: typeof layui !== 'undefined',
        currentData: currentData,
        totalAmount: totalAmount
    });
};
