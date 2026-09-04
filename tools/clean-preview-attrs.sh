#!/bin/sh
# 一键清理预览服务注入的 data-page-node-id 标注属性。
#
# 用法
#   sh tools/clean-preview-attrs.sh            # 扫描整个仓库
#   sh tools/clean-preview-attrs.sh <目录>     # 只扫指定目录
#
# 说明：宿主预览管线会在预览时给源文件就地回写该属性（每个元素一个，约 +8KB），
# 对渲染无任何作用。提交前有 .githooks/pre-commit 兜底，但想让工作区立刻干净
# 就跑这个脚本。

set -e

root=${1:-$(cd "$(dirname "$0")/.." && pwd)}
cd "$root"

STRIP='s/ data-page-node-id="[A-Za-z0-9_-]+"//g'

find .  -name .git -prune -o -type f \( -name '*.html' -o -name '*.htm' \) -print |
while IFS= read -r f; do
  tmp=$(mktemp "${TMPDIR:-/tmp}/dqfclean.XXXXXX")
  sed -E "$STRIP" "$f" > "$tmp"
  if ! cmp -s "$f" "$tmp"; then
    n=$(grep -o ' data-page-node-id="[A-Za-z0-9_-]*"' "$f" | wc -l | tr -d ' ')
    cat "$tmp" > "$f"   # 用重定向而非 mv，保留原文件权限与 inode
    echo "已清理 ${f}（${n} 处）"
  fi
  rm -f "$tmp"
done

echo "完成。可用 git status 确认工作区是否干净。"
