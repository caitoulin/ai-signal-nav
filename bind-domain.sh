#!/usr/bin/env bash
# 把域名绑定到 GitHub Pages（本机 git push 被拦，故走 REST API）
#
# 用法：
#   ./bind-domain.sh <域名>                    # 绑定并轮询校验状态
#   ./bind-domain.sh <域名> --check            # 只读查看当前绑定状态
#   OWNER=xxx REPO=yyy ./bind-domain.sh <域名>  # 指定目标仓库
#
# 前提：域名已购买 / 已申请到，且你知道在哪改 DNS。

set -euo pipefail

# ── 目标仓库（部署 React 版时改成对应仓库）──────────────
OWNER="${OWNER:-caitoulin}"
REPO="${REPO:-ai-nav}"
BRANCH="${BRANCH:-main}"

DOMAIN="${1:-}"
MODE="${2:-}"

die() { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }
ok()  { printf '\033[32m✓ %s\033[0m\n' "$1"; }
info(){ printf '\033[36m· %s\033[0m\n' "$1"; }

[[ -n "$DOMAIN" ]] || die "用法：$0 <域名> [--check]"
command -v gh >/dev/null || die "未安装 gh CLI"

# ── 检查模式 ──────────────────────────────────────────
if [[ "$MODE" == "--check" ]]; then
  info "当前 Pages 配置（$OWNER/$REPO）："
  gh api "repos/$OWNER/$REPO/pages" \
    --jq '"  html_url    : \(.html_url)\n  cname       : \(.cname // "（未绑定）")\n  status      : \(.status)\n  https       : \(.https_enforced)\n  domain_state: \(.protected_domain_state // "-")"'
  exit 0
fi

# ── 1. 写入 CNAME 文件 ────────────────────────────────
info "1/4  写入 CNAME 文件（内容：$DOMAIN）"
TMP="$(mktemp)"
printf '%s\n' "$DOMAIN" > "$TMP"
SHA=$(gh api "repos/$OWNER/$REPO/contents/CNAME" --jq '.sha' 2>/dev/null || true)
ARGS=(-X PUT "repos/$OWNER/$REPO/contents/CNAME"
      -f "message=chore: bind custom domain $DOMAIN"
      -f "content=$(base64 -i "$TMP")"
      -f "branch=$BRANCH")
[[ -n "$SHA" ]] && ARGS+=(-f "sha=$SHA")
gh api "${ARGS[@]}" >/dev/null && ok "CNAME 已提交" || die "CNAME 提交失败"
rm -f "$TMP"

# ── 2. 设置 Pages 自定义域名 ──────────────────────────
info "2/4  设置 Pages 自定义域名"
gh api -X PUT "repos/$OWNER/$REPO/pages" -f "cname=$DOMAIN" >/dev/null \
  && ok "cname = $DOMAIN" || die "设置失败（域名格式或权限问题）"

# ── 3. 开启强制 HTTPS ─────────────────────────────────
info "3/4  开启 Enforce HTTPS"
gh api -X PUT "repos/$OWNER/$REPO/pages" -f "https_enforced=true" >/dev/null \
  && ok "https_enforced = true" || info "证书可能尚未签发，稍后重跑本脚本即可"

# ── 4. 轮询直到域名就绪 ───────────────────────────────
info "4/4  等待 DNS 与证书（最多 10 分钟）"
for i in $(seq 1 40); do
  STATE=$(gh api "repos/$OWNER/$REPO/pages" --jq '.protected_domain_state // "unknown"')
  [[ "$STATE" == "approved" ]] && { ok "域名已通过校验，证书签发中"; break; }
  printf '   [%02d/40] state=%s\n' "$i" "$STATE"
  [[ "$STATE" == "unauthorized" ]] && die "域名未指向本仓库，请先配置下面的 DNS 记录"
  sleep 15
done

cat <<EOF

──────────────────────────────────────────────
请在域名服务商处添加 DNS 记录：

  根域（$DOMAIN）—— 4 条 A 记录：
    185.199.108.153
    185.199.109.153
    185.199.110.153
    185.199.111.153

  子域（www.$DOMAIN）—— 1 条 CNAME：
    $OWNER.github.io

  可选 IPv6（AAAA）：
    2606:50c0:8000::153
    2606:50c0:8001::153
    2606:50c0:8002::153
    2606:50c0:8003::153

添加后等待生效（通常 5–30 分钟），再执行：
  $0 $DOMAIN --check
──────────────────────────────────────────────
EOF
