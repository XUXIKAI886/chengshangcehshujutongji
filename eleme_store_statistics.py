#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
饿了么门店ID统计工具
功能: 批量查询门店ID对应的结算金额并计算绩效
作者: 呈尚策划数据统计系统
日期: 2025-10-08
"""

import pandas as pd
from datetime import datetime
import os


class ElemeStoreStatistics:
    """饿了么门店ID统计分析类"""

    def __init__(self, excel_path):
        """
        初始化统计分析器

        Args:
            excel_path: Excel文件路径
        """
        self.excel_path = excel_path
        self.df = None
        self.statistics_result = {}

    def read_excel_file(self):
        """读取Excel文件"""
        try:
            print(f"正在读取文件: {self.excel_path}")
            self.df = pd.read_excel(self.excel_path)
            print(f"[成功] 读取 {len(self.df)} 行数据")
            print(f"[成功] 数据列: {self.df.columns.tolist()}")
            return True
        except Exception as e:
            print(f"[错误] 读取文件失败: {str(e)}")
            return False

    def analyze_store_data(self, store_ids):
        """
        批量分析门店ID数据

        Args:
            store_ids: 门店ID列表

        Returns:
            dict: 统计结果字典
        """
        if self.df is None:
            print("[错误] 请先读取Excel文件")
            return None

        print(f"\n开始分析 {len(store_ids)} 个门店ID...")

        # 使用列索引而不是列名,避免编码问题
        # 列索引: 0=商家名称, 1=门店ID, 4=结算金额
        col_store_name = self.df.columns[0]  # 商家名称
        col_store_id = self.df.columns[1]    # 门店ID
        col_settlement = self.df.columns[4]  # 结算金额

        # 确保门店ID列为整数类型
        self.df[col_store_id] = self.df[col_store_id].astype(int)

        # 统计结果
        results = []
        total_amount = 0
        found_stores = 0
        not_found_stores = 0

        for store_id in store_ids:
            # 查询该门店ID的所有数据
            store_data = self.df[self.df[col_store_id] == store_id]

            if len(store_data) > 0:
                # 计算该门店的结算金额总和
                settlement_amount = store_data[col_settlement].sum()
                total_amount += settlement_amount
                found_stores += 1

                # 获取商家名称
                store_name = store_data[col_store_name].iloc[0]

                result = {
                    '门店ID': store_id,
                    '商家名称': store_name,
                    '结算金额': settlement_amount,
                    '数据行数': len(store_data),
                    '状态': '匹配成功'
                }

                print(f"[OK] 门店ID {store_id} ({store_name}): {settlement_amount:.2f}元 ({len(store_data)}条数据)")
            else:
                not_found_stores += 1
                result = {
                    '门店ID': store_id,
                    '商家名称': '未找到',
                    '结算金额': 0.0,
                    '数据行数': 0,
                    '状态': '未找到数据'
                }
                print(f"[--] 门店ID {store_id}: 未找到数据")

            results.append(result)

        # 保存统计结果
        self.statistics_result = {
            'details': results,
            'summary': {
                '总门店数': len(store_ids),
                '找到数据门店数': found_stores,
                '未找到数据门店数': not_found_stores,
                '汇总金额': total_amount
            }
        }

        return self.statistics_result

    def calculate_performance(self, performance_percentage):
        """
        计算绩效金额

        Args:
            performance_percentage: 绩效百分比

        Returns:
            float: 绩效金额
        """
        if not self.statistics_result:
            print("[错误] 请先进行数据分析")
            return None

        total_amount = self.statistics_result['summary']['汇总金额']
        performance_amount = total_amount * (performance_percentage / 100)

        print(f"\n[绩效计算]")
        print(f"   总金额: {total_amount:.2f}元")
        print(f"   绩效百分比: {performance_percentage}%")
        print(f"   绩效金额: {performance_amount:.2f}元")

        return performance_amount

    def print_summary(self):
        """打印统计汇总"""
        if not self.statistics_result:
            print("[错误] 暂无统计数据")
            return

        summary = self.statistics_result['summary']

        print("\n" + "="*60)
        print("[统计汇总]")
        print("="*60)
        print(f"总门店数量: {summary['总门店数']}")
        print(f"找到数据门店数: {summary['找到数据门店数']}")
        print(f"未找到数据门店数: {summary['未找到数据门店数']}")
        print(f"汇总金额: {summary['汇总金额']:.2f}元")
        print("="*60)

    def export_to_excel(self, output_path=None):
        """
        导出统计结果到Excel文件

        Args:
            output_path: 输出文件路径(可选)
        """
        if not self.statistics_result:
            print("[错误] 暂无统计数据可导出")
            return

        # 生成默认输出路径
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"饿了么门店统计结果_{timestamp}.xlsx"

        try:
            # 创建Excel写入器
            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                # 写入详细数据
                details_df = pd.DataFrame(self.statistics_result['details'])
                details_df.to_excel(writer, sheet_name='门店统计详情', index=False)

                # 写入汇总数据
                summary_df = pd.DataFrame([self.statistics_result['summary']])
                summary_df.to_excel(writer, sheet_name='统计汇总', index=False)

            print(f"\n[成功] 统计结果已导出到: {output_path}")
            return output_path
        except Exception as e:
            print(f"[错误] 导出失败: {str(e)}")
            return None


def main():
    """主程序入口"""
    print("="*60)
    print("饿了么门店ID统计工具")
    print("="*60)

    # Excel文件路径
    excel_path = r"E:\Augment\jixiaotongji\5349094916_20250921_20251007代运营固定费用账单_1759889236749.xlsx"

    # 创建统计分析器
    analyzer = ElemeStoreStatistics(excel_path)

    # 读取Excel文件
    if not analyzer.read_excel_file():
        return

    # 门店ID列表(示例 - 请根据实际需求修改)
    print("\n请输入要查询的门店ID(多个ID用逗号分隔):")
    print("示例: 1300598513,1303600710,1295127065")

    store_ids_input = input("门店ID: ").strip()

    if not store_ids_input:
        print("[提示] 未输入门店ID,使用示例数据进行演示...")
        # 示例门店ID列表
        store_ids = [1300598513, 1303600710, 1295127065, 1293566371, 1284259646]
    else:
        # 解析用户输入的门店ID
        try:
            store_ids = [int(sid.strip()) for sid in store_ids_input.split(',')]
        except ValueError:
            print("[错误] 门店ID格式错误,请输入数字")
            return

    # 分析门店数据
    results = analyzer.analyze_store_data(store_ids)

    if results:
        # 打印统计汇总
        analyzer.print_summary()

        # 绩效计算
        print("\n请输入绩效百分比(例如: 30表示30%):")
        try:
            performance_input = input("绩效百分比: ").strip()
            if performance_input:
                performance_percentage = float(performance_input)
                analyzer.calculate_performance(performance_percentage)
            else:
                print("未输入绩效百分比,跳过绩效计算")
        except ValueError:
            print("[错误] 绩效百分比格式错误")

        # 导出Excel
        print("\n是否导出统计结果到Excel? (y/n):")
        export_choice = input().strip().lower()
        if export_choice == 'y':
            analyzer.export_to_excel()

    print("\n程序执行完成!")


if __name__ == "__main__":
    main()
