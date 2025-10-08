#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
饿了么门店ID统计自动化执行脚本
自动读取Excel文件中的所有门店ID并进行统计分析
"""

import pandas as pd
from eleme_store_statistics import ElemeStoreStatistics


def main():
    """主程序入口"""
    print("="*60)
    print("饿了么门店ID批量统计工具 - 自动化执行")
    print("="*60)

    # Excel文件路径
    excel_path = r"E:\Augment\jixiaotongji\5349094916_20250921_20251007代运营固定费用账单_1759889236749.xlsx"

    # 创建统计分析器
    analyzer = ElemeStoreStatistics(excel_path)

    # 读取Excel文件
    if not analyzer.read_excel_file():
        return

    # 自动获取文件中的所有唯一门店ID
    print("\n正在提取文件中的所有门店ID...")
    col_store_id = analyzer.df.columns[1]  # 门店ID列
    unique_store_ids = analyzer.df[col_store_id].unique().tolist()
    print(f"[成功] 发现 {len(unique_store_ids)} 个唯一门店ID")

    # 分析门店数据
    print("\n开始批量分析所有门店数据...")
    results = analyzer.analyze_store_data(unique_store_ids)

    if results:
        # 打印统计汇总
        analyzer.print_summary()

        # 绩效计算(默认30%)
        print("\n执行绩效计算(默认30%)...")
        performance_percentage = 30.0
        performance_amount = analyzer.calculate_performance(performance_percentage)

        # 自动导出Excel
        print("\n正在导出统计结果...")
        output_file = analyzer.export_to_excel()

        # 显示详细结果摘要
        print("\n" + "="*60)
        print("[门店统计详情] (前10个门店)")
        print("="*60)
        details = results['details'][:10]  # 只显示前10个
        for idx, detail in enumerate(details, 1):
            print(f"{idx}. 门店ID: {detail['门店ID']}")
            print(f"   商家名称: {detail['商家名称']}")
            print(f"   结算金额: {detail['结算金额']:.2f}元")
            print(f"   状态: {detail['状态']}")
            print("-"*60)

        if len(results['details']) > 10:
            print(f"... 还有 {len(results['details']) - 10} 个门店未显示")
            print(f"完整数据请查看导出的Excel文件: {output_file}")

    print("\n" + "="*60)
    print("[成功] 程序执行完成!")
    print("="*60)


if __name__ == "__main__":
    main()
