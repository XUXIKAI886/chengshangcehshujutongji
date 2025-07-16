// 导入必要的依赖
import { DataProcessor } from './dataProcessor.js';
import { ChartRenderer } from './chartRenderer.js';
import { utils } from './utils.js';

// 主程序
document.addEventListener('DOMContentLoaded', () => {
    // 初始化处理器和渲染器
    const dataProcessor = new DataProcessor();
    const chartRenderer = new ChartRenderer('chartContainer');

    // 获取DOM元素
    const fileInput = document.getElementById('fileInput');
    const initButton = document.getElementById('initButton');
    const analyzeButton1 = document.getElementById('analyzeButton1');
    const analyzeButton2 = document.getElementById('analyzeButton2');
    const exportTable1 = document.getElementById('exportTable1');
    const exportTable2 = document.getElementById('exportTable2');
    const generateChart = document.getElementById('generateChart');
    const saveChart = document.getElementById('saveChart');

    // 文件选择处理
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            const success = await dataProcessor.processExcelFile(file);
            if (success) {
                utils.showSuccess('文件加载成功');
            }
        }
    });

    // 初始化按钮
    initButton.addEventListener('click', () => {
        // 清空表格
        document.getElementById('table1').innerHTML = '';
        document.getElementById('table2').innerHTML = '';
        
        // 清空文件输入
        fileInput.value = '';
        
        // 销毁图表
        chartRenderer.dispose();
        
        // 重置数据处理器
        dataProcessor.rawData = null;
        dataProcessor.dailySummary = null;
        dataProcessor.storeSummary = null;
        
        utils.showSuccess('已重置所有数据');
    });

    // 分析按钮1
    analyzeButton1.addEventListener('click', () => {
        try {
            const summary = dataProcessor.analyzeDailySummary();
            const table = utils.createTable(summary, ['结算周期', '店铺数量', '结算金额总和', '总额']);
            document.getElementById('table1').innerHTML = '';
            document.getElementById('table1').appendChild(table);
        } catch (error) {
            utils.showError(error.message);
        }
    });

    // 分析按钮2
    analyzeButton2.addEventListener('click', () => {
        try {
            const summary = dataProcessor.analyzeStoreSummary();
            const table = utils.createTable(summary, ['商家名称', '总结算金额', '结算天数']);
            document.getElementById('table2').innerHTML = '';
            document.getElementById('table2').appendChild(table);
        } catch (error) {
            utils.showError(error.message);
        }
    });

    // 导出表格1
    exportTable1.addEventListener('click', () => {
        try {
            const summary = dataProcessor.dailySummary;
            if (!summary) {
                throw new Error('没有数据可导出');
            }
            utils.exportToExcel(summary, '统计每天店铺数和结算总额.xlsx');
        } catch (error) {
            utils.showError(error.message);
        }
    });

    // 导出表格2
    exportTable2.addEventListener('click', () => {
        try {
            const summary = dataProcessor.storeSummary;
            if (!summary) {
                throw new Error('没有数据可导出');
            }
            utils.exportToExcel(summary, '统计每个店的结算总额和结算天数.xlsx');
        } catch (error) {
            utils.showError(error.message);
        }
    });

    // 生成图表
    generateChart.addEventListener('click', () => {
        try {
            const chartData = dataProcessor.getChartData();
            chartRenderer.render(chartData);
        } catch (error) {
            utils.showError(error.message);
        }
    });

    // 保存图表
    saveChart.addEventListener('click', () => {
        try {
            const chart = chartRenderer.getCurrentChart();
            if (!chart) {
                throw new Error('没有图表可保存');
            }
            utils.saveChart(chart, '数据分析图表.png');
        } catch (error) {
            utils.showError(error.message);
        }
    });

    // 窗口大小改变时调整图表
    window.addEventListener('resize', () => {
        chartRenderer.resize();
    });
}); 