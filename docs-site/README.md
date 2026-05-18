# LogicIR Doc Site

This directory is a static browsing projection for existing repository Markdown.
It is not a documentation source of truth.

Source documents stay in:

- `docs/`
- `dev/`
- selected AI entry pages under `ai/`

Current AI projection policy:

- keep `ai/tasks/README.md`
- keep `ai/tasks/material-index.md`
- keep one page per task directory, using that task's `README.md`
- do not project every file inside each task directory

The generated VitePress source is written to `.generated/` by:

```sh
yarn docs:sync
```

Local preview with source Markdown watching:

```sh
yarn docs:dev
```

Default local URL:

```text
http://127.0.0.1:15163/
```

`docs:dev` watches Markdown under `docs/`, `dev/`, and `ai/`. When a source
Markdown file changes, it refreshes `.generated/`; VitePress then hot-reloads
the page.

Static build:

```sh
yarn docs:build
```
