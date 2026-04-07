#!/bin/bash

# 博客部署脚本 - 使用 lsBlog 仓库的 gh-pages 分支
echo "🚀 开始部署博客..."

# 1. 使用 Hugo 重新构建项目
echo "📦 构建项目..."
cd /Users/bytedance/Documents/GitHub/lsBlog
./hugo_tmp/hugo

if [ $? -ne 0 ]; then
    echo "❌ 构建失败！"
    exit 1
fi

echo "✅ 构建成功！"

# 2. 检查并创建 gh-pages 分支（如果不存在）
echo "� 准备 gh-pages 分支..."
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "创建 gh-pages 分支..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
else
    echo "gh-pages 分支已存在"
fi

# 3. 使用 worktree 方式部署（更安全）
echo "📂 准备部署目录..."
rm -rf /tmp/lsBlog-deploy
git worktree add /tmp/lsBlog-deploy gh-pages

# 4. 清空并复制新内容
echo "🗑️  清空旧内容..."
cd /tmp/lsBlog-deploy
git rm -rf . --ignore-unmatch

echo "📋 复制新内容..."
cp -r /Users/bytedance/Documents/GitHub/lsBlog/public/* .

# 5. 添加到 git
echo "➕ 添加文件到 git..."
git add .

# 6. 提交
COMMIT_MESSAGE="Deploy blog: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📝 提交更改: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

# 7. 推送
echo "☁️  推送到 GitHub..."
git push origin gh-pages

# 8. 清理
echo "🧹 清理..."
cd /Users/bytedance/Documents/GitHub/lsBlog
git worktree remove /tmp/lsBlog-deploy

echo ""
echo "🎉 部署完成！"
echo ""
echo "🌐 你的博客地址：https://ShuoLv-fp.github.io/lsBlog/"
echo ""
echo "⚠️  重要：请确保在 GitHub 仓库设置中，"
echo "   GitHub Pages 的源分支设置为 gh-pages"
echo ""
echo "注意：GitHub Pages 可能需要几分钟时间来更新，请稍等片刻再访问。"
