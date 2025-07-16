// 图表渲染类
export class ChartRenderer {
    constructor(containerId) {
        this.chart = window.echarts.init(document.getElementById(containerId));
        this.currentChart = null;
    }

    // 渲染图表
    render(data) {
        const echarts = window.echarts;  // 获取全局的 echarts 对象
        
        // 统一的主题色
        const colors = {
            primary: '#1890ff',
            success: '#52c41a',
            grid: '#f0f0f0',
            text: '#666'
        };

        // 通用图表配置
        const commonConfig = {
            textStyle: {
                fontSize: 16,
                fontWeight: 'normal',
                color: '#333'
            },
            tooltip: {
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderColor: '#eee',
                borderWidth: 1,
                textStyle: {
                    color: '#666'
                },
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            grid: {
                top: 80,
                containLabel: true
            },
            legend: {
                textStyle: {
                    color: '#666'
                }
            }
        };

        const option = {
            title: [{
                text: '店铺数量趋势',
                left: '25%',
                top: 0,
                textAlign: 'center',
                textStyle: commonConfig.textStyle
            }, {
                text: '结算金额总和趋势',
                left: '75%',
                top: 0,
                textAlign: 'center',
                textStyle: commonConfig.textStyle
            }],
            tooltip: commonConfig.tooltip,
            grid: [{
                left: '5%',
                right: '55%',
                top: '60px',
                bottom: '10%',
                containLabel: true
            }, {
                left: '55%',
                right: '5%',
                top: '60px',
                bottom: '10%',
                containLabel: true
            }],
            xAxis: [{
                type: 'category',
                data: data.periods,
                axisLabel: {
                    rotate: 45,
                    color: colors.text
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: colors.grid
                    }
                },
                gridIndex: 0
            }, {
                type: 'category',
                data: data.periods,
                axisLabel: {
                    rotate: 45,
                    color: colors.text
                },
                axisLine: {
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'dashed',
                        color: colors.grid
                    }
                },
                gridIndex: 1
            }],
            yAxis: [{
                type: 'value',
                name: '店铺数量',
                nameTextStyle: {
                    color: colors.text
                },
                axisLabel: {
                    color: colors.text
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: colors.grid
                    }
                },
                gridIndex: 0
            }, {
                type: 'value',
                name: '结算金额',
                nameTextStyle: {
                    color: colors.text
                },
                axisLabel: {
                    color: colors.text
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#999'
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: colors.grid
                    }
                },
                gridIndex: 1
            }],
            series: [{
                name: '店铺数量',
                type: 'line',
                data: data.storeCount,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3
                },
                itemStyle: {
                    color: colors.primary
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: colors.primary },
                        { offset: 1, color: 'rgba(24,144,255,0.1)' }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                xAxisIndex: 0,
                yAxisIndex: 0
            }, {
                name: '结算金额',
                type: 'line',
                data: data.amounts,
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                lineStyle: {
                    width: 3
                },
                itemStyle: {
                    color: colors.success
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: colors.success },
                        { offset: 1, color: 'rgba(82,196,26,0.1)' }
                    ])
                },
                emphasis: {
                    focus: 'series'
                },
                xAxisIndex: 1,
                yAxisIndex: 1
            }]
        };

        this.chart.setOption(option);
        this.currentChart = this.chart;
    }

    // 调整图表大小
    resize() {
        this.chart && this.chart.resize();
    }

    // 获取当前图表实例
    getCurrentChart() {
        return this.currentChart;
    }

    // 销毁图表
    dispose() {
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
            this.currentChart = null;
        }
    }
} 