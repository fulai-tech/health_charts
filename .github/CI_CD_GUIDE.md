# GitHub Actions CI/CD 配置说明

本项目已配置完整的 GitHub Actions 自动化工作流，包括测试、构建和代码质量检查。

## 📋 已配置的工作流

### 1. **测试工作流** (`test.yml`)
**触发条件**：推送到 main/master/develop 分支或创建 Pull Request

**执行内容**：
- ✅ 在 Node.js 20.19.0 和 22.x 上运行测试（兼容 Vite 7.2.5）
- ✅ 运行 ESLint 检查
- ✅ 运行 TypeScript 类型检查
- ✅ 运行所有单元测试
- ✅ 上传代码覆盖率报告（可选：需要 Codecov token）

**Badge 徽章**：
```markdown
![Tests](https://github.com/fulai-tech/health_charts/workflows/Tests/badge.svg)
```

---

### 2. **构建工作流** (`build.yml`)
**触发条件**：推送到 main/master 分支或创建 Pull Request

**执行内容**：
- ✅ 构建生产版本
- ✅ 上传构建产物（保留 7 天）
- ✅ 检查构建文件大小

**Badge 徽章**：

```markdown
![Build](https://github.com/fulai-tech/health_charts/workflows/Build/badge.svg)
```

---

### 3. **代码质量检查** (`code-quality.yml`)
**触发条件**：推送到 main/master/develop 分支或创建 Pull Request

**执行内容**：
- ✅ ESLint 代码检查
- ✅ TypeScript 类型检查
- ✅ 检查重复依赖
- ✅ 验证 package.json
- ✅ 安全漏洞扫描（yarn audit）

---

### 4. **Pull Request 检查** (`pr-checks.yml`)
**触发条件**：创建或更新 Pull Request

**执行内容**：
- ✅ 运行完整的 CI 流程
- ✅ 在 PR 中自动评论测试结果

---

### 5. **Dependabot 自动更新** (`dependabot.yml`)
**功能**：
- 🤖 每周一自动检查依赖更新
- 🤖 自动创建 PR 更新依赖
- 🤖 生产依赖和开发依赖分组更新
- 🤖 自动更新 GitHub Actions 版本

---

## 🚀 快速开始

### 1. 推送到 GitHub
```bash
git add .github/
git commit -m "feat: add GitHub Actions CI/CD workflows"
git push origin main
```

### 2. 查看工作流运行
访问你的 GitHub 仓库：
```
https://github.com/fulai-tech/health_charts/actions
```

### 3. 添加徽章到 README
在 `README.md` 顶部添加：

```markdown
# Health Charts

![Tests](https://github.com/fulai-tech/health_charts/workflows/Tests/badge.svg)
![Build](https://github.com/fulai-tech/health_charts/workflows/Build/badge.svg)
![Code Quality](https://github.com/fulai-tech/health_charts/workflows/Code%20Quality/badge.svg)

<!-- 其他内容... -->
```

---

## 🔧 本地运行 CI 检查

在提交代码前，可以本地运行相同的检查：

```bash
# 运行完整的 CI 检查
yarn ci

# 或者分步运行
yarn lint           # ESLint 检查
yarn typecheck      # TypeScript 类型检查
yarn test:run       # 运行测试
yarn build          # 构建项目
```

---

## 📊 代码覆盖率报告（可选）

### 配置 Codecov（推荐）

1. 访问 [Codecov.io](https://codecov.io/) 并连接你的 GitHub 仓库

2. 获取 Codecov token

3. 在 GitHub 仓库设置中添加 Secret：
   - 进入：Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `CODECOV_TOKEN`
   - Value: 粘贴你的 token

4. 添加 Codecov 徽章：
```markdown
[![codecov](https://codecov.io/gh/fulai-tech/health_charts/branch/main/graph/badge.svg)](https://codecov.io/gh/fulai-tech/health_charts)
```

---

## 🔒 分支保护规则（推荐）

为 `main` 分支设置保护规则：

1. 进入：Settings → Branches → Add rule

2. 配置以下规则：
   - ✅ **Branch name pattern**: `main`
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
     - 选择：`Run Tests`
     - 选择：`Build Project`
     - 选择：`Code Quality Checks`
   - ✅ **Require branches to be up to date before merging**
   - ✅ **Do not allow bypassing the above settings**

这样配置后，所有合并到 `main` 的代码必须先通过测试。

---

## 🎯 工作流触发矩阵

| 事件 | test.yml | build.yml | code-quality.yml | pr-checks.yml |
|------|----------|-----------|------------------|---------------|
| Push to main | ✅ | ✅ | ✅ | ❌ |
| Push to develop | ✅ | ❌ | ✅ | ❌ |
| Open PR | ✅ | ✅ | ✅ | ✅ |
| Update PR | ✅ | ✅ | ✅ | ✅ |

---

## 📝 自定义配置

### Node.js 版本要求
⚠️ **重要**：本项目使用 Vite 7.2.5，要求 Node.js **≥20.19.0** 或 **≥22.12.0**

当前工作流配置：
- 测试矩阵：Node.js **20.19.0** 和 **22.x**
- 构建/质检：Node.js **22.x**

### 修改 Node.js 版本
编辑 `.github/workflows/test.yml`：
```yaml
strategy:
  matrix:
    node-version: ['20.19.0', '22.x']  # 确保满足 Vite 要求
```

### 修改触发分支
编辑任意 workflow 文件：
```yaml
on:
  push:
    branches: [ main, master, develop, feature/* ]  # 添加更多分支
```

### 添加自动部署
创建 `.github/workflows/deploy.yml`：
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: |
          yarn install
          yarn build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 🐛 故障排查

### 问题1：测试失败
```bash
# 本地复现
yarn test:run

# 查看详细日志
yarn test:run --reporter=verbose
```

### 问题2：构建失败
```bash
# 本地构建
yarn build

# 清理后重新构建
rm -rf dist node_modules
yarn install
yarn build
```

### 问题3：类型检查失败
```bash
# 运行类型检查
yarn typecheck

# 查看具体错误
yarn tsc --noEmit --pretty
```

### 问题4：依赖安装失败
确保使用了 `--frozen-lockfile`：
```yaml
- run: yarn install --frozen-lockfile
```

这确保使用 yarn.lock 中的精确版本。

---

## 📈 性能优化

### 1. 缓存依赖
已配置 Node.js 依赖缓存：
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'yarn'
```

### 2. 并行执行
多个 job 自动并行运行，节省时间。

### 3. 跳过不必要的步骤
```yaml
- name: Run tests
  if: github.event_name == 'pull_request'
  run: yarn test:run
```

---

## 📚 参考资源

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [Vitest CI 配置](https://vitest.dev/guide/ci.html)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)
- [Dependabot 文档](https://docs.github.com/en/code-security/dependabot)

---

## 🎉 成功标志

推送后，你应该看到：
1. ✅ GitHub Actions 标签页显示运行中的工作流
2. ✅ Pull Request 中显示状态检查
3. ✅ 提交历史旁边显示 ✓ 或 ✗ 图标
4. ✅ README 中的徽章显示为绿色 "passing"

**恭喜！你的 CI/CD 已经配置完成！** 🎊
