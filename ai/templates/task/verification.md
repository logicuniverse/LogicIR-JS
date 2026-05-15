# Verification 模板

记录本 task 执行过的所有检查。

## 命令（Commands）

| Command | Result | Notes |
| --- | --- | --- |
|  |  |  |

## 最低验证要求

每个 AI 自动 task 都必须留下可运行验证证据。不能因为文件看起来合理，就把
task 标记为 `ready-for-review`。

当 task 是 roadmap round 时：

- 验证 `README.md` 的 `Round Target` 中声明的完整链路。
- 记录精确 fixture、生成的 plan/artifact、runtime command 和最终观测结果。
- 如果只验证了中间文件，不得把 round 标记为完成。

当 task 包含 TypeScript 时：

- 除非 TypeScript 只是文档伪代码，否则 task 根目录应包含 `package.json`
  和 task-local verification scripts。
- 尽可能对 task-local code 运行 type check。
- 如果 task 实现 runtime behavior、tool、projector、compiler、example 或
  fixture，必须运行相关 JS/TS build、test 或 smoke command。
- 如果 task code 通过相对路径引用正式 package 或其它仓库文件，只能把它们
  作为只读 dependency evidence，不得修改这些文件。

当 task 包含或生成 Verilog HDL 时：

- 在 Windows 上验证前激活 OSS CAD Suite：
  `. E:\oss-cad-suite\environment.ps1`
- 直接运行 `iverilog` 做 syntax 或 simulation smoke checks。
- 记录 `iverilog` 使用的 generated HDL files、testbench files 和 output
  artifact paths。
- 如果 HDL 验证通过相对路径引用外部仓库 `.v`、`.sv`、include 或 fixture
  文件，必须在 `source-map.md` 中记录为只读输入。

当 task 包含 Python 或未来其它 runtime/projection language 时：

- 可运行代码和 verification entry points 保持在 task sandbox 内。
- 允许通过相对路径引用外部仓库 source 作为只读输入，并必须记录在
  `source-map.md`。
- 不要求正式 package import task-local code。

当 task 声称同时支持 JS/TS 和 Verilog HDL 时：

- 同时运行 JS/TS verification path 和 Verilog HDL verification path。
- 如果任一路径无法运行，记录 concrete blocker，并且不得把该路径描述为
  verified。

当 task 提出 promotion 时：

- 记录 promotion 后预期的正式验证，通常是 `yarn build` 和 `yarn test`。
- 记录正式目标目录所需的文档链接检查、fixture 检查或 target-specific
  commands。
- promotion 前确认没有正式 package import task-local code。

## 已知缺口

- 
