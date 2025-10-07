// 饿了么服务商统计工具函数集合
export const utils = {
    // 格式化日期
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },

    // 格式化金额
    formatAmount(amount) {
        return parseFloat(amount).toFixed(2);
    },

    // 创建表格
    createTable(data, headers) {
        const table = document.createElement('table');
        table.className = 'layui-table';

        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // 创建表格内容
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                let value = row[header];

                // 特殊处理总额列
                if (header === '总额') {
                    if (value !== null && value !== undefined) {
                        value = this.formatAmount(value);
                    } else {
                        value = '';
                    }
                } else if (typeof value === 'number') {
                    value = this.formatAmount(value);
                }

                td.textContent = value || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    },

    // 导出Excel文件
    exportToExcel(data, filename) {
        const worksheet = window.XLSX.utils.json_to_sheet(data);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "饿了么账单统计");
        window.XLSX.writeFile(workbook, filename);
    },

    // 保存图表为图片
    saveChart(chart, filename) {
        const url = chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#fff'
        });
        const a = document.createElement('a');
        a.download = filename;
        a.href = url;
        a.click();
    },

    // 显示错误消息
    showError(message) {
        if (window.layui && window.layui.layer) {
            window.layui.layer.msg(message, {icon: 2});
        } else if (window.layer) {
            window.layer.msg(message, {icon: 2});
        } else {
            alert(`错误: ${message}`);
        }
    },

    // 显示成功消息
    showSuccess(message) {
        if (window.layui && window.layui.layer) {
            window.layui.layer.msg(message, {icon: 1});
        } else if (window.layer) {
            window.layer.msg(message, {icon: 1});
        } else {
            alert(`成功: ${message}`);
        }
    }
};
