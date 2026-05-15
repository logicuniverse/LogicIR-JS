# AI 模板

这个目录保存 AI 协作任务的复用模板。

模板不是 task 输出，也不是已接受的项目源码。它们只定义 sandbox 工作的
基本形状，方便人类后续 review，并把有价值的最小片段 promotion 到正式
目录。

使用方式：

- 新建 AI 自动任务时，把 [`task/`](task/) 复制到
  `ai/tasks/YYYY-MM-DD-<task>/`。
- 任务运行期间只改新 task 目录，不要把正在运行的 task 写回模板。
- 模板正文默认中文；文件名、status 值、命令名和固定流程关键词可以保留英文。

可用模板：

- [`task/`](task/): 单个 AI 全自动 task 的标准目录结构。
