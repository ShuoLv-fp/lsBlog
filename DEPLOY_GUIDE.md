# 博客部署指南

本指南将帮助你运行 `deploy.ps1` 脚本来部署你的 Hugo 博客到 GitHub Pages。

## 前提条件

1. **Git** - 已安装并配置好 GitHub 账号
2. **PowerShell** - Windows 10/11 自带
3. **Hugo** - 需要下载并安装

## 步骤 1: 下载 Hugo

1. 访问 [Hugo 官方发布页面](https://github.com/gohugoio/hugo/releases)
2. 下载适合 Windows 的版本（推荐 `hugo_extended` 版本）
3. 将下载的 ZIP 文件解压到 `hugo_tmp` 目录
4. 确保 `hugo_tmp` 目录中有 `hugo.exe` 文件

## 步骤 2: 运行部署脚本

### 方法 A: 在 PowerShell 中直接运行

1. 打开 PowerShell 终端
2. 导航到博客目录：
   ```powershell
   cd D:\Github_clone\lsBlog
   ```
3. 运行部署脚本：
   ```powershell
   .\deploy.ps1
   ```

### 方法 B: 以管理员身份运行

如果遇到权限问题，可以：
1. 右键点击 `deploy.ps1` 文件
2. 选择 "以管理员身份运行"

## 步骤 3: 验证部署

1. 脚本运行完成后，访问你的博客地址：
   https://ShuoLv-fp.github.io/lsBlog/

2. 注意：GitHub Pages 可能需要几分钟时间来更新内容

## 常见问题

### 1. Hugo 未找到
- 确保 `hugo.exe` 已正确解压到 `hugo_tmp` 目录
- 检查文件路径是否正确

### 2. Git 权限问题
- 确保你已配置好 Git 用户名和邮箱：
  ```powershell
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```
- 确保你有推送权限到 GitHub 仓库

### 3. 构建失败
- 检查 Hugo 配置文件 `hugo.toml` 是否正确
- 检查内容文件是否有语法错误

## 脚本功能说明

1. **构建项目** - 使用 Hugo 生成静态网站文件
2. **准备分支** - 检查并创建 `gh-pages` 分支（如果不存在）
3. **部署内容** - 使用 git worktree 方式部署到 `gh-pages` 分支
4. **提交更改** - 自动提交并推送更改到 GitHub
5. **清理** - 清理临时部署目录

## 注意事项

- 首次运行时会创建 `gh-pages` 分支
- 确保 GitHub 仓库设置中，GitHub Pages 的源分支设置为 `gh-pages`
- 部署过程中会自动处理所有步骤，无需手动干预
