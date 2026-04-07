#!/usr/bin/env pwsh

# 博客部署脚本 - 使用 lsBlog 仓库的 gh-pages 分支
Write-Host "🚀 开始部署博客..."

# 1. 使用 Hugo 重新构建项目
Write-Host "📦 构建项目..."
Set-Location "D:\Github_clone\lsBlog"

# 检查 Hugo 是否存在
if (-not (Test-Path ".\hugo_tmp\hugo.exe")) {
    Write-Host "❌ Hugo 可执行文件不存在，请下载并解压到 hugo_tmp 目录"
    Write-Host "下载地址: https://github.com/gohugoio/hugo/releases"
    exit 1
}

# 运行 Hugo 构建
.\hugo_tmp\hugo

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！"
    exit 1
}

Write-Host "✅ 构建成功！"

# 2. 检查并创建 gh-pages 分支（如果不存在）
Write-Host "📋 准备 gh-pages 分支..."
$branchExists = git show-ref --verify --quiet refs/heads/gh-pages
if (-not $branchExists) {
    Write-Host "创建 gh-pages 分支..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
} else {
    Write-Host "gh-pages 分支已存在"
}

# 3. 使用 worktree 方式部署（更安全）
Write-Host "📂 准备部署目录..."
$deployDir = "C:\tmp\lsBlog-deploy"
if (Test-Path $deployDir) {
    Remove-Item -Recurse -Force $deployDir
}
git worktree add $deployDir gh-pages

# 4. 清空并复制新内容
Write-Host "🗑️  清空旧内容..."
Set-Location $deployDir
git rm -rf . --ignore-unmatch

Write-Host "📋 复制新内容..."
Copy-Item -Recurse "D:\Github_clone\lsBlog\public\*" .

# 5. 添加到 git
Write-Host "➕ 添加文件到 git..."
git add .

# 6. 提交
$commitMessage = "Deploy blog: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "📝 提交更改: $commitMessage"
git commit -m "$commitMessage"

# 7. 推送
Write-Host "☁️  推送到 GitHub..."
git push origin gh-pages

# 8. 清理
Write-Host "🧹 清理..."
Set-Location "D:\Github_clone\lsBlog"
git worktree remove $deployDir

Write-Host ""
Write-Host "🎉 部署完成！"
Write-Host ""
Write-Host "🌐 你的博客地址：https://ShuoLv-fp.github.io/lsBlog/"
Write-Host ""
Write-Host "⚠️  重要：请确保在 GitHub 仓库设置中，"
Write-Host "   GitHub Pages 的源分支设置为 gh-pages"
Write-Host ""
Write-Host "注意：GitHub Pages 可能需要几分钟时间来更新，请稍等片刻再访问。"
