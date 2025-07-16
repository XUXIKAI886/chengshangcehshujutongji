// 导入必要的依赖
import { utils } from './utils.js';

// 数据处理类
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
            return true;
        } catch (error) {
            utils.showError('处理Excel文件时发生错误: ' + error.message);
            return false;
        }
    }

    // 读取Excel文件
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

                    // 将工作表转换为JSON数据，跳过第一行（标题行）
                    const rawData = window.XLSX.utils.sheet_to_json(worksheet, {
                        raw: false,
                        defval: '',
                        range: 1  // 从第二行开始读取
                    });

                    if (!rawData || rawData.length === 0) {
                        throw new Error('Excel文件为空或没有数据行');
                    }

                    // 转换数据，使用固定的列映射
                    const jsonData = rawData.map(row => ({
                        日期: row['日期'] || '',
                        商家名称: row['商家名称'] || '',
                        门店ID: row['门店ID'] || '',
                        结算周期: row['结算周期'] || '',
                        费用类型: row['费用类型'] || '',
                        结算金额: row['结算金额\n(元)'] || row['结算金额(元)'] || '0',
                        扣费说明: row['扣费说明'] || ''
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
            // 尝试解析结算金额
            let amount = 0;
            try {
                const amountStr = String(row.结算金额 || '0').replace(/[^\d.-]/g, '');
                amount = parseFloat(amountStr) || 0;
            } catch (error) {
                console.error('解析结算金额时出错:', error);
                amount = 0;
            }

            return {
                日期: row.日期,
                商家名称: String(row.商家名称),
                门店ID: String(row.门店ID),
                结算周期: row.结算周期,
                费用类型: String(row.费用类型),
                结算金额: amount,
                扣费说明: String(row.扣费说明)
            };
        });
    }

    // 分析1：统计每天店铺数和结算总额
    analyzeDailySummary() {
        if (!this.rawData) {
            throw new Error('没有数据可分析');
        }

        // 按结算周期分组
        const summary = {};
        this.rawData.forEach(row => {
            const period = row.结算周期;
            if (!summary[period]) {
                summary[period] = {
                    结算周期: period,
                    店铺数量: new Set(),
                    结算金额总和: 0
                };
            }
            summary[period].店铺数量.add(row.门店ID);
            summary[period].结算金额总和 += row.结算金额;
        });

        // 转换为数组并计算总额
        this.dailySummary = Object.values(summary).map(item => ({
            结算周期: item.结算周期,
            店铺数量: item.店铺数量.size,
            结算金额总和: item.结算金额总和,
            总额: null
        }));

        // 计算总额并只在第一行显示
        const totalAmount = this.dailySummary.reduce((sum, item) => sum + item.结算金额总和, 0);
        if (this.dailySummary.length > 0) {
            this.dailySummary[0].总额 = totalAmount;
        }

        return this.dailySummary;
    }

    // 分析2：统计每个店的结算总额和结算天数
    analyzeStoreSummary() {
        if (!this.rawData) {
            throw new Error('没有数据可分析');
        }

        // 按商家名称分组
        const summary = {};
        this.rawData.forEach(row => {
            const storeName = row.商家名称;
            if (!summary[storeName]) {
                summary[storeName] = {
                    商家名称: storeName,
                    总结算金额: 0,
                    结算天数: new Set()
                };
            }
            summary[storeName].总结算金额 += row.结算金额;
            summary[storeName].结算天数.add(row.日期);
        });

        // 转换为数组
        this.storeSummary = Object.values(summary).map(item => ({
            商家名称: item.商家名称,
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
            throw new Error('没有分析数据');
        }

        return {
            periods: this.dailySummary.map(item => item.结算周期),
            storeCount: this.dailySummary.map(item => item.店铺数量),
            amounts: this.dailySummary.map(item => item.结算金额总和)
        };
    }
} 