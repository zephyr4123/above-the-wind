# 贡献指南

## 开发环境

- Node ≥ 20（开发用 Node 26 / npm 11）、Python 3（仅采集脚本需要）
- 前端:`cd web && npm ci && npm run dev`

## 流程

1. 从 `main` 开 feature 分支,小步提交(一个逻辑单元一个 commit,信息用中文,技术名词保留英文)。
2. 提 PR → CI 自动跑 `lint + tsc + build`(红了不合并)。
3. 合并 `main` 后自动部署到 GitHub Pages;打 `v*` tag 自动出 GitHub Release。

## 红线

- **数据许可**:只引入免费、无版权风险的数据源(CC0 / CC-BY / 公有领域),新源先过 `research/SOURCES.md` 的许可判定;GeoNames 数据须署名。
- **图片红区**:不引入受版权的第三方照片;视觉资产走生成式 / 数据驱动。
- **设计体系**:改视觉从 `web/src/styles/archive.css` 的 `--archive-*` token 起,别在组件里写魔法值(规范见 `DESIGN.md`)。
