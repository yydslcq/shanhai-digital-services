# TianBa Project COS Clean

山海宣传页的精简维护版。

## Scope

- 页面代码保留在 `src/`。
- 图片、视频、GLB 与 Draco decoder 使用 COS URL。
- 本地原始素材、QA 临时图、上传 staging、历史大文件不再纳入本仓库。
- 素材台账保留在 `docs/asset-inventory/v0.7.0-preview-assets.xlsx`。

## Local Preview

```bash
npm ci
npm run dev -- --host 0.0.0.0 --port 5174
```

COS 防盗链需要放行本地/测试来源：

- `127.0.0.1`
- `localhost`
- `test.shuziwenbo.cn`

## GitHub Pages

默认 Vite base 为 `/shanhai-digital-services/`。如果 GitHub 仓库名不同，在构建时设置：

```bash
VITE_BASE_PATH=/your-repo-name/ npm run build
```

线上 COS 防盗链还需要放行 GitHub Pages 域名或自定义域名。
