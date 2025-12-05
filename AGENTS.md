# Repository Guidelines

## 项目结构与模块组织
该仓库以多模块Web工具和Python批处理脚本并行维护，根目录提供`index.html`与运行脚本，`eleme_store_statistics.py`、`run_eleme_statistics.py`、`check_excel.py`负责离线批量统计。`eleme-pro/`、`mendianid-pro/`、`daiyunying-pro/`、`dianpushujukeshihua/`、`fuwushangtongji/`与`eleme-fuwushang/`分别封装饿了么、美团以及可视化场景的前端页面，每个模块都有独立`scripts/css`资产，发布时请仅暴露对应模块目录。`README.md`与`CLAUDE.md`记录上层说明，`饿了么门店统计使用说明.md`面向业务用户，新增资产或素材请置于各模块`assets/`子目录以免根目录膨胀。

## 构建、测试与开发命令
- `python -m http.server 8000`：在仓库根目录发起零依赖静态预览，`http://localhost:8000/eleme-pro/`等路径可直接访问各子模块。
- `npx serve . -l 4173`：需要跨平台HTTPS或自签证书时使用，可复用于前端联调。
- `python run_eleme_statistics.py`：批量读取Excel并导出统计报告，运行前先将`excel_path`替换为本地文件，终端输出包含绩效预览。
- `python check_excel.py`：验证第三方账单字段，适合提测前快速检查列名与编码问题。

## 代码风格与命名约定
前端脚本统一使用ES6模块、`const/let`与4空格缩进，函数与变量采用驼峰命名，类使用帕斯卡命名，常量保持全大写下划线。DOM查询集中在`initializeElements`风格的辅助函数内，事件绑定放入`initializeEventListeners`以维持可维护性。CSS遵循BEM风格或语义化组合类，不混用内联样式；公共渐变色、阴影规则请复用既有变量。Python脚本沿用PEP8与中文日志输出，涉及路径的常量置于文件顶部利于迁移。

## 测试指引
每次改动至少验证一个饿了么和一个美团账单：上传示例文件、确认统计卡片、导出Excel并与手工计算对比。新增解析逻辑需在`tests/fixtures/`（若尚未创建请补充）投放脱敏样例，并在PR描述中说明预期字段。对Python脚本进行`python -m compileall`或`ruff check`（若安装）静态检查后再运行，确保终端日志无WARN，同时截图Web界面或附加导出文件名称以证明覆盖率。

## 提交与Pull Request指南
遵循`type(scope): 描述`的提交约定（示例：`feat(daiyunying-pro): 新增多档位绩效计算`），类型常见有`feat`、`fix`、`refactor`、`style`、`docs`。Commit说明保持中文主动语态，不超过50字；如修改多模块，请拆分为多次提交并在描述中标注影响面。Pull Request需包含：变更背景、关联系统或Issue编号、主要截图/导出结果、测试步骤列表及勾选状态，涉及数据脚本时附带所用Excel列结构以便复现。

## 安全与配置提示
所有真实账单、客户Excel和自动导出的报告必须存放在仓库外部路径，必要时仅提交脱敏片段或生成脚本。`运行饿了么门店统计.bat`等入口脚本默认调用Windows终端，如需在Linux或CI使用，请新建`scripts/serve.sh`等平台脚本而不是修改原文件。引入新的CDN或第三方库时先在`index.html`内以注释说明用途，并确保网络受限环境下提供本地备份。
