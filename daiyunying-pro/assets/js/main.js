/* global layui, XLSX */

console.log('饿了么固定费用统计 - 初始化中...');

// 全局变量
let currentData = null;
let analysisResults = null;

// DOM元素
let fileInput, uploadArea, storeIds, performanceRate, analyzeBtn, exportBtn, resetBtn;
let totalStoresEl, foundStoresEl, totalOrdersEl, totalAmountEl, statusBadge;
let resultsContainer, performanceSummary, performanceAmount, totalOrdersDisplay;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化...');
    initializeElements();
    initializeEventListeners();

    // 初始化Layui
    if (typeof layui !== 'undefined') {
        layui.use(['layer'], function() {
            console.log('Layui初始化成功');
        });
    }
});

// 获取DOM元素
function initializeElements() {
    fileInput = document.getElementById('fileInput');
    uploadArea = document.getElementById('uploadArea');
    storeIds = document.getElementById('storeIds');
    performanceRate = document.getElementById('performanceRate');
    analyzeBtn = document.getElementById('analyzeBtn');
    exportBtn = document.getElementById('exportBtn');
    resetBtn = document.getElementById('resetBtn');

    totalStoresEl = document.getElementById('totalStores');
    foundStoresEl = document.getElementById('foundStores');
    totalOrdersEl = document.getElementById('totalOrders');
    totalAmountEl = document.getElementById('totalAmount');
    statusBadge = document.getElementById('statusBadge');

    resultsContainer = document.getElementById('resultsContainer');
    performanceSummary = document.getElementById('performanceSummary');
    performanceAmount = document.getElementById('performanceAmount');
    totalOrdersDisplay = document.getElementById('totalOrdersDisplay');

    console.log('DOM元素获取完成');
}

// 初始化事件监听器
function initializeEventListeners() {
    // 文件上传
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // 按钮事件
    analyzeBtn.addEventListener('click', startAnalysis);
    exportBtn.addEventListener('click', exportReport);
    resetBtn.addEventListener('click', resetAll);

    // 绩效计算
    performanceRate.addEventListener('input', calculatePerformance);

    console.log('事件监听器初始化完成');
}

// 处理拖拽
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    console.log('处理文件:', file.name);

    if (!file.name.toLowerCase().match(/\.(xls|xlsx)$/)) {
        showMessage('请选择Excel文件（.xls或.xlsx格式）', 'error');
        return;
    }

    // 显示文件信息
    document.getElementById('fileInfo').style.display = 'block';
    document.getElementById('fileName').textContent = `${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`;

    // 读取文件
    readExcelFile(file)
        .then(data => {
            currentData = data;
            analyzeBtn.disabled = false;
            showMessage('文件读取成功', 'success');
            updateStatus('文件已加载');
        })
        .catch(error => {
            showMessage('文件读取失败: ' + error.message, 'error');
            console.error('文件读取错误:', error);
        });
}

// 读取Excel文件（饿了么固定费用账单格式）
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

                // 处理数据格式
                if (jsonData.length < 2) {
                    throw new Error('Excel文件数据不足');
                }

                console.log('原始数据前3行:', jsonData.slice(0, 3));

                // 检测特殊格式：第一行可能是标题（如"代运营账单"）
                let headerRowIndex = 0;
                let headers = jsonData[0];

                // 如果第一行只有一个单元格且内容像标题，则使用第二行作为字段名
                if (headers.length === 1 && typeof headers[0] === 'string' && headers[0].includes('账单')) {
                    console.log('检测到特殊格式，使用第二行作为字段名');
                    headerRowIndex = 1;
                    headers = jsonData[1];
                }

                const rows = jsonData.slice(headerRowIndex + 1);

                console.log('字段名:', headers);

                const processedData = rows.map(row => {
                    const obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index];
                    });
                    return obj;
                }).filter(row => {
                    // 过滤掉没有门店ID的行
                    const storeId = row['门店ID'] || row['门店id'];
                    return storeId && String(storeId).trim();
                });

                console.log('Excel数据处理完成，共', processedData.length, '条记录');
                console.log('前3条数据样本:', processedData.slice(0, 3));

                // 验证必要字段
                if (processedData.length > 0) {
                    const firstRow = processedData[0];
                    const hasStoreId = firstRow['门店ID'] || firstRow['门店id'];
                    const hasSettlement = firstRow['结算金额'] || firstRow['结算金额(元)'] || firstRow['代运营结算金额'];

                    if (!hasStoreId) {
                        throw new Error('Excel文件缺少"门店ID"或"门店id"字段');
                    }
                    if (!hasSettlement) {
                        throw new Error('Excel文件缺少"结算金额"、"结算金额(元)"或"代运营结算金额"字段');
                    }
                }

                resolve(processedData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 开始分析
function startAnalysis() {
    if (!currentData) {
        showMessage('请先选择Excel文件', 'error');
        return;
    }

    const storeIdList = storeIds.value.trim().split('\n')
        .map(id => id.trim())
        .filter(id => id && /^\d+$/.test(id));

    if (storeIdList.length === 0) {
        showMessage('请输入有效的门店ID', 'error');
        return;
    }

    console.log('开始分析', storeIdList.length, '个门店ID');
    updateStatus('分析中...');

    // 执行分析
    analysisResults = analyzeStoreData(currentData, storeIdList);

    // 更新界面
    updateStatistics(analysisResults);
    updateResultsTable(analysisResults);
    calculatePerformance();

    exportBtn.disabled = false;
    updateStatus('分析完成');
    showMessage(`分析完成！找到${analysisResults.foundStores.length}个门店的数据`, 'success');
}

// 档位配置
const TIER_CONFIG = {
    tier1: {
        label: '档位1',
        amount: 33.95,
        name: '档位1 (35元-1.05元抽佣)',
        salesPerformance: 7,      // 销售绩效：7元/单
        assistantPerformance: 0   // 助理绩效：0元/单
    },
    tier2: {
        label: '档位2',
        amount: 36.86,
        name: '档位2 (38元-1.14元抽佣)',
        salesPerformance: 7,      // 销售绩效：7元/单
        assistantPerformance: 3   // 助理绩效：3元/单
    },
    tier3: {
        label: '档位3',
        amount: 48.5,
        name: '档位3 (48.50元)',
        salesPerformance: 7,      // 销售绩效：7元/单
        assistantPerformance: 3   // 助理绩效：3元/单
    }
};

const TIER_KEYS = Object.keys(TIER_CONFIG);
const TIER_AMOUNT_HINT = TIER_KEYS.map(key => `${TIER_CONFIG[key].amount.toFixed(2)}元`).join('、');

function createEmptyTierStats() {
    return TIER_KEYS.reduce((stats, tierKey) => {
        stats[tierKey] = { count: 0, amount: 0 };
        return stats;
    }, {});
}

// 识别档位
function identifyTier(amount) {
    // 允许0.01元的误差
    for (const tierKey of TIER_KEYS) {
        if (Math.abs(amount - TIER_CONFIG[tierKey].amount) < 0.01) {
            return tierKey;
        }
    }
    return null;
}

// 分析门店数据（饿了么版本 - 支持多档位）
function analyzeStoreData(data, storeIdList) {
    const results = {
        totalStores: storeIdList.length,
        foundStores: [],
        notFoundStores: [],
        totalAmount: 0,
        totalDays: 0,
        details: [],
        // 档位统计
        tierStats: createEmptyTierStats()
    };

    storeIdList.forEach(storeId => {
        console.log(`\n=== 分析门店ID: ${storeId} ===`);

        // 筛选该门店的数据（兼容"门店ID"和"门店id"两种字段名）
        const storeData = data.filter(row => {
            const rowStoreId = String(row['门店ID'] || row['门店id'] || '').trim();
            const match = rowStoreId === storeId;
            if (match) {
                console.log(`✓ 匹配成功: ${rowStoreId} === ${storeId}`);
            }
            return match;
        });

        console.log(`门店ID ${storeId} 匹配到 ${storeData.length} 条记录`);

        if (storeData.length === 0) {
            // 未找到数据
            const sampleStoreIds = data.slice(0, 5).map(row => {
                return String(row['门店ID'] || row['门店id'] || '').trim();
            }).filter(id => id);
            console.log(`未找到门店ID ${storeId}，数据中的门店ID样本:`, sampleStoreIds);

            results.notFoundStores.push(storeId);
            results.details.push({
                storeId,
                storeName: '未找到数据',
                contractStartTime: '-',
                settlementDays: 0,
                amount: 0,
                orderCount: 0,
                tier: null,
                tierName: '-',
                recordCount: 0,
                found: false
            });
            return;
        }

        // 计算统计数据（兼容多种商家名称字段）
        const storeName = storeData[0]['商家名称'] || storeData[0]['店铺名称'] || storeData[0]['门店名称'] || '未知商家';

        // 获取合同开始时间
        const contractStartTime = storeData[0]['合同开始时间'] || storeData[0]['开始时间'] || '-';

        // 计算结算天数（按结算周期去重）
        const settlementPeriods = new Set(
            storeData.map(row => {
                const period = row['结算周期'];
                return String(period || '').trim();
            }).filter(p => p)
        );
        const settlementDays = settlementPeriods.size;

        // 计算结算金额汇总（兼容多种字段名）
        const amount = storeData.reduce((sum, row) => {
            const settlementAmount = parseFloat(row['结算金额'] || row['结算金额(元)'] || row['代运营结算金额'] || 0);
            return sum + settlementAmount;
        }, 0);

        const recordCount = storeData.length;

        // 识别档位
        const tier = identifyTier(amount);
        let orderCount = 0;
        let tierName = '其他';

        if (tier && TIER_CONFIG[tier]) {
            orderCount = 1;
            tierName = TIER_CONFIG[tier].name;
            results.tierStats[tier].count += 1;
            results.tierStats[tier].amount += amount;
            console.log(`📊 门店${storeId}统计: 记录数=${recordCount}, 总金额=￥${amount.toFixed(2)}, 订单数=${orderCount}, 档位=${TIER_CONFIG[tier].label} ✓`);
        } else {
            console.log(`⚠️ 门店${storeId}统计: 记录数=${recordCount}, 总金额=￥${amount.toFixed(2)}, 订单数=${orderCount}, 档位=未知 (不符合${TIER_AMOUNT_HINT})`);
        }

        results.foundStores.push(storeId);
        results.totalAmount += amount;
        results.totalDays += settlementDays;

        results.details.push({
            storeId,
            storeName,
            contractStartTime,
            settlementDays,
            amount,
            orderCount,
            tier,
            tierName,
            recordCount,
            found: true
        });

        console.log(`门店${storeId}: ${storeName}, ${settlementDays}个结算周期, ¥${amount.toFixed(2)}, ${orderCount}单, ${tierName}`);
    });

    console.log('\n=== 汇总统计 ===');
    console.log(`查询门店总数: ${results.totalStores}`);
    console.log(`找到数据门店: ${results.foundStores.length}`);
    console.log(`总结算周期数: ${results.totalDays}`);
    console.log(`结算金额汇总: ¥${results.totalAmount.toFixed(2)}`);
    TIER_KEYS.forEach(tierKey => {
        console.log(`${TIER_CONFIG[tierKey].label}订单数: ${results.tierStats[tierKey].count}单, 金额: ￥${results.tierStats[tierKey].amount.toFixed(2)}`);
    });

    return results;
}

// 更新统计数据
function updateStatistics(results) {
    // 计算总订单数
    const totalOrders = results.details.reduce((sum, item) => sum + item.orderCount, 0);

    totalStoresEl.textContent = results.totalStores;
    foundStoresEl.textContent = results.foundStores.length;
    totalOrdersEl.textContent = totalOrders;
    totalAmountEl.textContent = `¥${results.totalAmount.toFixed(2)}`;
}

// 更新结果表格（支持档位显示）
function updateResultsTable(results) {
    // 计算总订单数
    const totalOrders = results.details.reduce((sum, item) => sum + item.orderCount, 0);
    const totalRecords = results.details.reduce((sum, item) => sum + item.recordCount, 0);
    const tierSummary = TIER_KEYS.map(tierKey => `${TIER_CONFIG[tierKey].label}: ${results.tierStats[tierKey].count}`).join(' | ');

    const tableHTML = `
        <table class="results-table">
            <thead>
                <tr>
                    <th>合同开始时间</th>
                    <th>门店ID</th>
                    <th>商家名称</th>
                    <th>结算金额</th>
                    <th>档位</th>
                    <th>订单数</th>
                    <th>记录数</th>
                    <th>状态</th>
                </tr>
            </thead>
            <tbody>
                ${results.details.map(item => {
                    let tierBadge = '';
                    if (item.tier && TIER_CONFIG[item.tier]) {
                        tierBadge = `<span class="tier-badge ${item.tier}">${TIER_CONFIG[item.tier].label}</span>`;
                    } else if (item.found) {
                        tierBadge = '<span class="tier-badge tier-other">其他</span>';
                    } else {
                        tierBadge = '-';
                    }

                    return `
                    <tr>
                        <td>${item.contractStartTime}</td>
                        <td><strong>${item.storeId}</strong></td>
                        <td>${item.storeName}</td>
                        <td class="${item.found ? 'amount-positive' : ''}">￥${item.amount.toFixed(2)}</td>
                        <td>${tierBadge}</td>
                        <td><strong>${item.orderCount}</strong></td>
                        <td>${item.recordCount}</td>
                        <td>
                            <span class="status-badge ${item.found ? 'status-success' : 'status-error'}">
                                ${item.found ? '<i class="fas fa-check"></i> 有结算' : '<i class="fas fa-times"></i> 无数据'}
                            </span>
                        </td>
                    </tr>
                `}).join('')}
                <tr class="summary-row">
                    <td colspan="4"><strong>总计</strong></td>
                    <td><strong>${tierSummary}</strong></td>
                    <td><strong>${totalOrders}</strong></td>
                    <td><strong>${totalRecords}</strong></td>
                    <td><strong>${results.foundStores.length}/${results.totalStores}</strong></td>
                </tr>
            </tbody>
        </table>
    `;

    resultsContainer.innerHTML = tableHTML;
}


// 计算绩效（支持销售和助理绩效）
function calculatePerformance() {
    if (!analysisResults) {
        console.log('⚠️ calculatePerformance: analysisResults为空');
        return;
    }

    // 计算总订单数和档位明细
    const totalOrders = analysisResults.details.reduce((sum, item) => sum + item.orderCount, 0);
    const salesDetails = TIER_KEYS.map(tierKey => {
        const tierStats = analysisResults.tierStats[tierKey] || { count: 0 };
        const tierConfig = TIER_CONFIG[tierKey];
        return {
            tierKey,
            label: tierConfig.label,
            count: tierStats.count,
            rate: tierConfig.salesPerformance,
            amount: tierStats.count * tierConfig.salesPerformance
        };
    });
    const assistantDetails = TIER_KEYS
        .filter(tierKey => TIER_CONFIG[tierKey].assistantPerformance > 0)
        .map(tierKey => {
            const tierStats = analysisResults.tierStats[tierKey] || { count: 0 };
            const tierConfig = TIER_CONFIG[tierKey];
            return {
                tierKey,
                label: tierConfig.label,
                count: tierStats.count,
                rate: tierConfig.assistantPerformance,
                amount: tierStats.count * tierConfig.assistantPerformance
            };
        });

    const totalSalesPerf = salesDetails.reduce((sum, detail) => sum + detail.amount, 0);
    const totalAssistantPerf = assistantDetails.reduce((sum, detail) => sum + detail.amount, 0);
    const tierOrderDesc = TIER_KEYS.map(tierKey => `${TIER_CONFIG[tierKey].label}: ${analysisResults.tierStats[tierKey].count}单`).join('，');

    const salesLog = {};
    salesDetails.forEach(detail => {
        salesLog[detail.label] = { count: detail.count, rate: detail.rate, total: detail.amount };
    });
    const assistantLog = {};
    assistantDetails.forEach(detail => {
        assistantLog[detail.label] = { count: detail.count, rate: detail.rate, total: detail.amount };
    });

    console.log('📊 绩效计算:', {
        销售绩效: salesLog,
        助理绩效: assistantLog,
        totalOrders,
        totalOrdersDisplay: totalOrdersDisplay ? '已找到' : '未找到'
    });

    if (totalOrders > 0) {
        if (totalOrdersDisplay) {
            totalOrdersDisplay.textContent = `${totalOrders}单 (${tierOrderDesc})`;
            console.log('📌 总订单数已更新:', totalOrdersDisplay.textContent);
        } else {
            console.error('❌ totalOrdersDisplay元素未找到');
        }

        if (performanceAmount) {
            const salesItemsHTML = salesDetails.map(detail => `
                            <div class="perf-item">
                                <div class="perf-item-label">
                                    <span class="perf-tier-badge ${detail.tierKey}-badge">${detail.label}</span>
                                    <span class="perf-calc">${detail.count}单 × ￥${detail.rate}</span>
                                </div>
                                <div class="perf-item-value">￥${detail.amount.toFixed(2)}</div>
                            </div>
                        `).join('');

            const assistantItemsHTML = (assistantDetails.map(detail => `
                            <div class="perf-item">
                                <div class="perf-item-label">
                                    <span class="perf-tier-badge ${detail.tierKey}-badge">${detail.label}</span>
                                    <span class="perf-calc">${detail.count}单 × ￥${detail.rate}</span>
                                </div>
                                <div class="perf-item-value">￥${detail.amount.toFixed(2)}</div>
                            </div>
                        `).join('')) || '';
            const assistantNoteText = assistantDetails.length > 0
                ? `仅${assistantDetails.map(detail => detail.label).join('、')}订单享有助理绩效`
                : '暂无档位享有助理绩效';

            performanceAmount.innerHTML = `
                <div class="performance-detail-modern">
                    <!-- 销售绩效卡片 -->
                    <div class="perf-card perf-card-sales">
                        <div class="perf-card-header">
                            <div class="perf-icon-wrapper perf-icon-sales">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="perf-header-text">
                                <h3>销售绩效</h3>
                                <p>Sales Performance</p>
                            </div>
                        </div>
                        <div class="perf-card-body">
                            ${salesItemsHTML}
                        </div>
                        <div class="perf-card-footer perf-footer-sales">
                            <span>总额</span>
                            <span class="perf-total-amount">￥${totalSalesPerf.toFixed(2)}</span>
                        </div>
                    </div>

                    <!-- 助理绩效卡片 -->
                    <div class="perf-card perf-card-assistant">
                        <div class="perf-card-header">
                            <div class="perf-icon-wrapper perf-icon-assistant">
                                <i class="fas fa-user-tie"></i>
                            </div>
                            <div class="perf-header-text">
                                <h3>助理绩效</h3>
                                <p>Assistant Performance</p>
                            </div>
                        </div>
                        <div class="perf-card-body">
                            ${assistantItemsHTML || '<div class="perf-item"><div class="perf-item-label"><span class="perf-calc">暂无助理绩效数据</span></div><div class="perf-item-value">￥0.00</div></div>'}
                            <div class="perf-item perf-item-note">
                                <div class="perf-note">
                                    <i class="fas fa-info-circle"></i>
                                    <span>${assistantNoteText}</span>
                                </div>
                            </div>
                        </div>
                        <div class="perf-card-footer perf-footer-assistant">
                            <span>总额</span>
                            <span class="perf-total-amount">￥${totalAssistantPerf.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
            console.log('✅ 绩效金额已更新: 销售=￥' + totalSalesPerf.toFixed(2) + ', 助理=￥' + totalAssistantPerf.toFixed(2));
        } else {
            console.error('❌ performanceAmount元素未找到');
        }

        performanceSummary.style.display = 'block';
        console.log('✨ 绩效摘要已显示');
    } else {
        performanceSummary.style.display = 'none';
        console.log('ℹ️ 总订单数为0，隐藏绩效摘要');
    }
}


// 导出报告（支持多档位统计）
function exportReport() {
    if (!analysisResults) {
        showMessage('没有数据可导出', 'error');
        return;
    }

    try {
        // 计算总订单数和绩效金额
        const totalOrders = analysisResults.details.reduce((sum, item) => sum + item.orderCount, 0);
        const salesPerfDetails = TIER_KEYS.map(tierKey => {
            const tierStats = analysisResults.tierStats[tierKey] || { count: 0, amount: 0 };
            const tierConfig = TIER_CONFIG[tierKey];
            return {
                tierKey,
                name: tierConfig.name,
                label: tierConfig.label,
                amount: tierStats.amount,
                count: tierStats.count,
                salesRate: tierConfig.salesPerformance,
                assistantRate: tierConfig.assistantPerformance
            };
        });
        const assistantPerfDetails = salesPerfDetails.filter(item => item.assistantRate > 0);
        const totalSalesPerf = salesPerfDetails.reduce((sum, item) => sum + item.count * item.salesRate, 0);
        const totalAssistantPerf = assistantPerfDetails.reduce((sum, item) => sum + item.count * item.assistantRate, 0);

        // 准备导出数据
        const exportData = analysisResults.details.map(item => ({
            '合同开始时间': item.contractStartTime,
            '门店ID': item.storeId,
            '商家名称': item.storeName,
            '结算金额': item.amount.toFixed(2),
            '档位': item.tierName || '-',
            '订单数': item.orderCount,
            '记录数': item.recordCount,
            '状态': item.found ? '有结算数据' : '未找到数据'
        }));

        // 添加空行
        exportData.push({
            '合同开始时间': '',
            '门店ID': '',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 添加汇总统计标题
        exportData.push({
            '合同开始时间': '',
            '门店ID': '=== 汇总统计 ===',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 基础统计
        exportData.push({
            '合同开始时间': '',
            '门店ID': '查询门店总数',
            '商家名称': analysisResults.totalStores,
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        exportData.push({
            '合同开始时间': '',
            '门店ID': '找到数据门店',
            '商家名称': analysisResults.foundStores.length,
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        exportData.push({
            '合同开始时间': '',
            '门店ID': '总结算周期数',
            '商家名称': analysisResults.totalDays,
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        exportData.push({
            '合同开始时间': '',
            '门店ID': '结算金额汇总',
            '商家名称': `￥${analysisResults.totalAmount.toFixed(2)}`,
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 添加空行
        exportData.push({
            '合同开始时间': '',
            '门店ID': '',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 档位统计
        exportData.push({
            '合同开始时间': '',
            '门店ID': '=== 档位统计 ===',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        salesPerfDetails.forEach(detail => {
            exportData.push({
                '合同开始时间': '',
                '门店ID': detail.name,
                '商家名称': `${detail.count}单`,
                '结算金额': `￥${detail.amount.toFixed(2)}`,
                '档位': '',
                '订单数': '',
                '记录数': '',
                '状态': ''
            });
        });

        exportData.push({
            '合同开始时间': '',
            '门店ID': '总订单数',
            '商家名称': totalOrders,
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 添加空行
        exportData.push({
            '合同开始时间': '',
            '门店ID': '',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 绩效统计
        exportData.push({
            '合同开始时间': '',
            '门店ID': '=== 绩效统计 ===',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 销售绩效
        exportData.push({
            '合同开始时间': '',
            '门店ID': '::: 销售绩效',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        salesPerfDetails.forEach(detail => {
            exportData.push({
                '合同开始时间': '',
                '门店ID': `  ${detail.label} (￥${detail.salesRate}/单)`,
                '商家名称': `${detail.count}单`,
                '结算金额': `￥${(detail.count * detail.salesRate).toFixed(2)}`,
                '档位': '',
                '订单数': '',
                '记录数': '',
                '状态': ''
            });
        });

        exportData.push({
            '合同开始时间': '',
            '门店ID': '  销售绩效总额',
            '商家名称': '',
            '结算金额': `￥${totalSalesPerf.toFixed(2)}`,
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 助理绩效
        exportData.push({
            '合同开始时间': '',
            '门店ID': '',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        exportData.push({
            '合同开始时间': '',
            '门店ID': '::: 助理绩效',
            '商家名称': '',
            '结算金额': '',
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        if (assistantPerfDetails.length > 0) {
            assistantPerfDetails.forEach(detail => {
                exportData.push({
                    '合同开始时间': '',
                    '门店ID': `  ${detail.label} (￥${detail.assistantRate}/单)`,
                    '商家名称': `${detail.count}单`,
                    '结算金额': `￥${(detail.count * detail.assistantRate).toFixed(2)}`,
                    '档位': '',
                    '订单数': '',
                    '记录数': '',
                    '状态': ''
                });
            });
        } else {
            exportData.push({
                '合同开始时间': '',
                '门店ID': '  暂无助理绩效档位',
                '商家名称': '',
                '结算金额': '￥0.00',
                '档位': '',
                '订单数': '',
                '记录数': '',
                '状态': ''
            });
        }

        exportData.push({
            '合同开始时间': '',
            '门店ID': '  助理绩效总额',
            '商家名称': '',
            '结算金额': `￥${totalAssistantPerf.toFixed(2)}`,
            '档位': '',
            '订单数': '',
            '记录数': '',
            '状态': ''
        });

        // 创建工作簿
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "饿了么固定费用统计报告");

        // 生成文件名
        const now = new Date();
        const timestamp = now.getFullYear() +
                         String(now.getMonth() + 1).padStart(2, '0') +
                         String(now.getDate()).padStart(2, '0') + '_' +
                         String(now.getHours()).padStart(2, '0') +
                         String(now.getMinutes()).padStart(2, '0');

        const filename = `饿了么固定费用统计报告_${timestamp}.xlsx`;

        // 导出文件
        XLSX.writeFile(workbook, filename);

        showMessage('报告导出成功！', 'success');

    } catch (error) {
        showMessage('导出失败: ' + error.message, 'error');
        console.error('导出错误:', error);
    }
}


// 重置所有数据
function resetAll() {
    currentData = null;
    analysisResults = null;

    fileInput.value = '';
    storeIds.value = '';
    performanceRate.value = '7';

    document.getElementById('fileInfo').style.display = 'none';

    // 重置统计数据
    totalStoresEl.textContent = '0';
    foundStoresEl.textContent = '0';
    totalOrdersEl.textContent = '0';
    totalAmountEl.textContent = '¥0.00';

    // 重置表格
    resultsContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-file-excel"></i>
            <p>请上传饿了么账单Excel文件并输入门店ID开始分析</p>
            <small>支持 .xls 和 .xlsx 格式的饿了么固定费用账单</small>
        </div>
    `;

    // 重置按钮状态
    analyzeBtn.disabled = true;
    exportBtn.disabled = true;

    // 隐藏绩效
    performanceSummary.style.display = 'none';

    updateStatus('等待数据');
    showMessage('已重置所有数据', 'success');
}

// 更新状态
function updateStatus(status) {
    statusBadge.textContent = status;
}

// 显示消息
function showMessage(message, type = 'info') {
    if (typeof layui !== 'undefined' && layui.layer) {
        const iconMap = { 'success': 1, 'error': 2, 'warning': 3, 'info': 0 };
        layui.layer.msg(message, {icon: iconMap[type] || 0, time: 2000});
    } else {
        const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : type === 'warning' ? '⚠️ ' : 'ℹ️ ';
        console.log(prefix + message);
    }
}

console.log('饿了么固定费用统计初始化完成');
