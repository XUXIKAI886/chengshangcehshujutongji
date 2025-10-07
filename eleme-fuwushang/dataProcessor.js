// 导入必要的依赖
import { utils } from './utils.js';

// 饿了么数据处理类
export class DataProcessor {
    constructor() {
        this.rawData = null;
        this.dailySummary = null;
        this.storeSummary = null;
    }

    // 处理Excel文件
    async processExcelFile(file) {
        try {
            const data = await this.readExcelFile(file);
            this.rawData = this.cleanData(data);
            document.getElementById('fileName').textContent = `${file.name} (已加载 ${this.rawData.length} 条记录)`;
            return true;
        } catch (error) {
            utils.showError('处理Excel文件时发生错误: ' + error.message);
            return false;
        }
    }

    // 读取Excel文件（饿了么格式）
    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = window.XLSX.read(data, { type: 'array' });

                    // 检查工作表
                    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                        throw new Error('Excel文件中没有工作表');
                    }

                    // 使用第一个工作表
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // 将工作表转换为JSON数据（使用第一行作为标题）
                    const rawData = window.XLSX.utils.sheet_to_json(worksheet, {
                        raw: false,
                        defval: ''
                    });

                    if (!rawData || rawData.length === 0) {
                        throw new Error('Excel文件为空或没有数据行');
                    }

                    console.log('饿了么Excel数据前3条:', rawData.slice(0, 3));

                    // 转换数据，适配饿了么字段
                    const jsonData = rawData.map(row => ({
                        合同编号: row['合同编号'] || '',
                        门店id: row['门店id'] || row['门店ID'] || '',
                        合同类型: row['合同类型'] || '',
                        代运营结算金额: row['代运营结算金额'] || '0',
                        代运营收入: row['代运营收入'] || '0',
                        技术服务费: row['技术服务费（抽佣）'] || row['技术服务费'] || '0',
                        结算类型: row['结算类型'] || '',
                        入账状态: row['入账状态'] || '',
                        代运营服务编号: row['代运营服务编号'] || '',
                        门店名称: row['门店名称'] || '',
                        入账日期: row['入账日期'] || '',
                        账单日期: row['账单日期'] || '',
                        合同状态: row['合同状态'] || ''
                    }));

                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // 清理数据
    cleanData(data) {
        // 检查数据是否为空
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Excel文件为空');
        }

        // 清理和转换数据
        return data.map(row => {
            // 解析代运营结算金额
            let amount = 0;
            try {
                const amountStr = String(row.代运营结算金额 || '0').replace(/[^\d.-]/g, '');
                amount = parseFloat(amountStr) || 0;
            } catch (error) {
                console.error('解析代运营结算金额时出错:', error);
                amount = 0;
            }

            return {
                合同编号: String(row.合同编号),
                门店id: String(row.门店id),
                合同类型: String(row.合同类型),
                代运营结算金额: amount,
                代运营收入: parseFloat(row.代运营收入) || 0,
                技术服务费: parseFloat(row.技术服务费) || 0,
                结算类型: String(row.结算类型),
                入账状态: String(row.入账状态),
                代运营服务编号: String(row.代运营服务编号),
                门店名称: String(row.门店名称),
                入账日期: row.入账日期,
                账单日期: row.账单日期,
                合同状态: String(row.合同状态)
            };
        });
    }

    // 分析1：按日期统计门店数和结算额
    analyzeDailySummary() {
        if (!this.rawData) {
            throw new Error('没有数据可分析，请先上传饿了么账单文件');
        }

        // 按账单日期分组
        const summary = {};
        this.rawData.forEach(row => {
            // 格式化日期
            let date = row.账单日期;
            if (date instanceof Date) {
                date = date.toISOString().split('T')[0];
            } else {
                date = String(date).split(' ')[0];
            }

            if (!summary[date]) {
                summary[date] = {
                    账单日期: date,
                    门店数量: new Set(),
                    结算金额总和: 0
                };
            }
            summary[date].门店数量.add(row.门店id);
            summary[date].结算金额总和 += row.代运营结算金额;
        });

        // 转换为数组并计算总额
        this.dailySummary = Object.values(summary).map(item => ({
            账单日期: item.账单日期,
            门店数量: item.门店数量.size,
            结算金额总和: item.结算金额总和,
            总额: null
        }));

        // 按日期排序
        this.dailySummary.sort((a, b) => new Date(a.账单日期) - new Date(b.账单日期));

        // 计算总额并只在第一行显示
        const totalAmount = this.dailySummary.reduce((sum, item) => sum + item.结算金额总和, 0);
        if (this.dailySummary.length > 0) {
            this.dailySummary[0].总额 = totalAmount;
        }

        return this.dailySummary;
    }

    // 分析2：按门店统计结算金额和天数
    analyzeStoreSummary() {
        if (!this.rawData) {
            throw new Error('没有数据可分析，请先上传饿了么账单文件');
        }

        // 按门店名称分组
        const summary = {};
        this.rawData.forEach(row => {
            const storeName = row.门店名称;
            const storeId = row.门店id;
            const key = `${storeName}_${storeId}`;

            if (!summary[key]) {
                summary[key] = {
                    门店名称: storeName,
                    门店id: storeId,
                    总结算金额: 0,
                    结算天数: new Set()
                };
            }
            summary[key].总结算金额 += row.代运营结算金额;

            // 添加日期到Set中去重
            let date = row.账单日期;
            if (date instanceof Date) {
                date = date.toISOString().split('T')[0];
            } else {
                date = String(date).split(' ')[0];
            }
            summary[key].结算天数.add(date);
        });

        // 转换为数组
        this.storeSummary = Object.values(summary).map(item => ({
            门店名称: item.门店名称,
            门店id: item.门店id,
            总结算金额: item.总结算金额,
            结算天数: item.结算天数.size
        }));

        // 按总结算金额降序排序
        this.storeSummary.sort((a, b) => b.总结算金额 - a.总结算金额);

        return this.storeSummary;
    }

    // 获取图表数据
    getChartData() {
        if (!this.dailySummary) {
            throw new Error('没有分析数据，请先进行【按日期统计】分析');
        }

        return {
            periods: this.dailySummary.map(item => item.账单日期),
            storeCount: this.dailySummary.map(item => item.门店数量),
            amounts: this.dailySummary.map(item => item.结算金额总和)
        };
    }
}
