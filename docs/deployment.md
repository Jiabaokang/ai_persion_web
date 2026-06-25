# 部署与运维手册

> 项目：jbksy.cn（智识花园）
> 服务器：阿里云 ECS · `<server-ip>` · Ubuntu 24.04
> SSH 别名：`aliyun-jbk`
> 在线地址：<https://jbksy.cn>

---

## 一、部署架构

```
GitHub push main
      ├─→ A: ssh aliyun-jbk "/opt/jbksy/deploy.sh"     ← 手动随时部署
      └─→ B: GitHub Actions 自动 ssh 执行 deploy.sh    ← 提交即部署

服务器 <server-ip>
  ├─ /opt/jbksy/                      代码（git clone）
  ├─ /opt/jbksy/.output/              Nuxt 构建产物
  ├─ /opt/jbksy/deploy.sh             部署脚本（A / B 共用）
  ├─ /etc/jbksy.env                   生产环境变量（不进 git）
  ├─ /etc/systemd/system/jbksy.service systemd 服务单元
  ├─ /etc/nginx/conf.d/jbksy.conf     nginx 反代 + HTTPS
  ├─ /var/lib/jbksy/data/db.sqlite    持久化 SQLite 数据库
  └─ /var/log/jbksy/                  应用日志

请求链路：
  Internet → nginx :443 (Let's Encrypt) → 127.0.0.1:3000 (Nuxt)
```

### 关键约定

- 数据库**独立于代码目录**，部署不会覆盖业务数据
- Node 进程只监听 `127.0.0.1:3000`，不直接对公网暴露
- 配置文件 `/etc/jbksy.env` 权限 `600`，由 systemd 加载
- 证书自动续期（certbot 内置 systemd timer）

---

## 二、首次部署清单（已完成，备忘）

| 步骤 | 命令 / 说明 |
|---|---|
| 1. 装环境 | Node 22 (NodeSource)、pnpm 10、certbot、2G swap |
| 2. 克隆代码 | `git clone https://github.com/Jiabaokang/ai_persion_web.git /opt/jbksy` |
| 3. 配 systemd | `/etc/systemd/system/jbksy.service` + `systemctl enable jbksy` |
| 4. 配环境变量 | `/etc/jbksy.env` 写入 `NUXT_SESSION_SECRET`、DB 路径等 |
| 5. 首次构建 | `cd /opt/jbksy && /opt/jbksy/deploy.sh` |
| 6. 数据库迁移 | `NUXT_DB_PATH=/var/lib/jbksy/data/db.sqlite npx drizzle-kit migrate` |
| 7. 配 nginx | `/etc/nginx/conf.d/jbksy.conf` 反代到 `127.0.0.1:3000` |
| 8. 申请证书 | `certbot --nginx -d jbksy.cn -d www.jbksy.cn --redirect` |
| 9. 配 CI | GitHub Secrets：`DEPLOY_HOST` / `DEPLOY_SSH_KEY` / `DEPLOY_KNOWN_HOSTS`（不要把密钥写进仓库） |

---

## 三、日常发布流程

### 方案 A：手动部署（兜底）

```bash
# 拉最新 main 部署
ssh aliyun-jbk "/opt/jbksy/deploy.sh"

# 部署到指定 commit（回滚 / 灰度）
ssh aliyun-jbk "/opt/jbksy/deploy.sh --ref <sha>"

# 不拉代码，仅重建（本地手动改了代码后想测试）
ssh aliyun-jbk "/opt/jbksy/deploy.sh --no-pull"
```

`deploy.sh` 内部流程：

1. `git fetch + reset --hard origin/main`（直连失败自动切 ghfast.top 镜像）
2. `pnpm install --frozen-lockfile`
3. `pnpm build`（限制 1.5G 内存，避免 OOM）
4. `systemctl restart jbksy`
5. 健康检查 `curl 127.0.0.1:3000`

### 方案 B：CI 自动部署（默认）

```bash
git push origin main
# GitHub Actions 自动 SSH 调用 /opt/jbksy/deploy.sh
```

查看 CI 日志：<https://github.com/Jiabaokang/ai_persion_web/actions>

两种方式**互不冲突，可同时使用**。

---

## 四、运维常用命令

### 服务管理

```bash
# 实时日志（systemd journal）
ssh aliyun-jbk "journalctl -u jbksy -f"

# 最近 100 行日志
ssh aliyun-jbk "journalctl -u jbksy -n 100 --no-pager"

# 应用 stdout/stderr
ssh aliyun-jbk "tail -f /var/log/jbksy/app.log"
ssh aliyun-jbk "tail -f /var/log/jbksy/error.log"

# 重启
ssh aliyun-jbk "systemctl restart jbksy"

# 停止 / 启动
ssh aliyun-jbk "systemctl stop jbksy"
ssh aliyun-jbk "systemctl start jbksy"

# 查看运行状态
ssh aliyun-jbk "systemctl status jbksy --no-pager"
```

### Nginx

```bash
# 访问日志（含来源 IP / UA）
ssh aliyun-jbk "tail -f /var/log/nginx/jbksy.access.log"

# 错误日志
ssh aliyun-jbk "tail -f /var/log/nginx/jbksy.error.log"

# 重载配置（改了 nginx.conf 后）
ssh aliyun-jbk "nginx -t && systemctl reload nginx"
```

### HTTPS 证书

```bash
# 查看证书到期时间
ssh aliyun-jbk "certbot certificates"

# 手动续期（一般不需要，certbot 已自动定时）
ssh aliyun-jbk "certbot renew --dry-run"
ssh aliyun-jbk "certbot renew"

# 查看自动续期 timer
ssh aliyun-jbk "systemctl list-timers | grep certbot"
```

### 数据库

```bash
# 进入 sqlite shell
ssh aliyun-jbk "sqlite3 /var/lib/jbksy/data/db.sqlite"

# 备份（拷贝到本地）
scp aliyun-jbk:/var/lib/jbksy/data/db.sqlite ./backup-$(date +%Y%m%d).sqlite

# 跑新增的 drizzle 迁移
ssh aliyun-jbk "cd /opt/jbksy && NUXT_DB_PATH=/var/lib/jbksy/data/db.sqlite npx drizzle-kit migrate"

# 看表结构
ssh aliyun-jbk "sqlite3 /var/lib/jbksy/data/db.sqlite '.schema'"
```

#### 浏览器可视化（sqlite-web）

服务器已部署 `sqlite-web`，监听 `127.0.0.1:8765`（**不对公网暴露**）。
通过 SSH 隧道在本地浏览器访问：

```bash
# 1. 本地终端开 SSH 隧道（前台挂住，正常）
ssh -N -L 8765:127.0.0.1:8765 aliyun-jbk

# 2. 本地浏览器打开
http://localhost:8765/sqlite/

# 3. 登录密码：在服务器侧配置（不要写入 git）
```

功能：浏览表数据 / 执行 SQL / 查看表结构 / 导出 JSON·CSV / 导入。

服务管理：

```bash
# 启停 / 状态
ssh aliyun-jbk "systemctl {start|stop|restart|status} sqlite-web"

# 日志
ssh aliyun-jbk "journalctl -u sqlite-web -f"

# 改密码（编辑 systemd 单元后 reload）
ssh aliyun-jbk "编辑 /etc/systemd/system/sqlite-web.service 里的 SQLITE_WEB_PASSWORD，然后 systemctl daemon-reload && systemctl restart sqlite-web"
```

> ⚠️ Nuxt 应用与 sqlite-web 共用同一个 `db.sqlite`（WAL 模式，读不冲突）。
> 写操作请避开高峰，或在 sqlite-web 中谨慎执行。

### 系统资源

```bash
# 磁盘
ssh aliyun-jbk "df -h /"

# 内存 / swap
ssh aliyun-jbk "free -h"

# CPU 占用 Top 10
ssh aliyun-jbk "ps aux --sort=-%cpu | head -11"

# Node 进程
ssh aliyun-jbk "systemctl status jbksy | grep Memory"
```

---

## 五、常见问题排查

### 1. 部署后访问 502 / 503

```bash
# 看服务是否起来
ssh aliyun-jbk "systemctl status jbksy"

# 端口是否监听
ssh aliyun-jbk "ss -tlnp | grep 3000"

# 看启动错误
ssh aliyun-jbk "journalctl -u jbksy -n 50 --no-pager"
```

常见原因：

- 构建产物 `.output/server/index.mjs` 缺失 → 重跑 `deploy.sh`
- `.env` 缺关键变量 → 检查 `/etc/jbksy.env`
- DB 文件无权限 → `chmod -R u+rw /var/lib/jbksy/`

### 2. 构建 OOM（内存不足）

服务器只有 1.6G 内存，已配 2G swap。如果还是 OOM：

```bash
# 临时加更多 swap
ssh aliyun-jbk "swapoff /swapfile && fallocate -l 4G /swapfile && mkswap /swapfile && swapon /swapfile"
```

或在 `deploy.sh` 里调整 `NODE_OPTIONS="--max-old-space-size=1024"`。

### 3. GitHub 直连失败

`deploy.sh` 已内置 fallback：直连失败自动切 `ghfast.top` 镜像，不需要人工处理。

如果想强制走镜像：

```bash
ssh aliyun-jbk "cd /opt/jbksy && git remote set-url origin https://ghfast.top/https://github.com/Jiabaokang/ai_persion_web.git"
```

### 4. HTTPS 证书过期

正常不会发生（自动续期）。万一过期：

```bash
ssh aliyun-jbk "certbot renew --force-renewal && systemctl reload nginx"
```

### 5. 想看上次部署的版本

```bash
ssh aliyun-jbk "cd /opt/jbksy && git log -1 --format='%h %s (%ar)'"
```

### 6. 紧急回滚到上一版本

```bash
ssh aliyun-jbk "cd /opt/jbksy && /opt/jbksy/deploy.sh --ref HEAD~1"
```

---

## 六、CI/CD 配置（B 方案）

### Workflow 文件

`.github/workflows/deploy.yml`：

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:    # 也支持手动触发
```

- **触发**：推送到 `main` 分支自动跑
- **手动触发**：仓库 → Actions → `部署到生产环境` → `Run workflow`
- **并发控制**：同时只有一个部署在跑，新触发会排队（防止竞态）
- **超时**：20 分钟

### 必须的 GitHub Secrets

| Secret 名 | 内容 | 备注 |
|---|---|---|
| `DEPLOY_HOST` | `<server-ip>` | 服务器 IP |
| `DEPLOY_SSH_KEY` | OpenSSH 私钥（ed25519） | 服务器 `/root/.ssh/github_deploy` |
| `DEPLOY_KNOWN_HOSTS` | `<server-ip> ssh-ed25519 ...` | 防 MITM 校验 |

### 轮换 SSH key

```bash
# 在服务器生成新 key
ssh aliyun-jbk "ssh-keygen -t ed25519 -f /root/.ssh/github_deploy_new -N ''"

# 把新公钥加到 authorized_keys
ssh aliyun-jbk "cat /root/.ssh/github_deploy_new.pub >> /root/.ssh/authorized_keys"

# 把新私钥更新到 GitHub Secrets DEPLOY_SSH_KEY

# 删旧 key
ssh aliyun-jbk "sed -i '/github-actions@jbksy/d' /root/.ssh/authorized_keys"
ssh aliyun-jbk "rm /root/.ssh/github_deploy*"
ssh aliyun-jbk "mv /root/.ssh/github_deploy_new /root/.ssh/github_deploy"
```

---

## 七、目录与文件清单

### 服务器端

| 路径 | 用途 | 权限 |
|---|---|---|
| `/opt/jbksy/` | 项目代码（git） | root:root 755 |
| `/opt/jbksy/.output/` | Nuxt 产物 | root:root 755 |
| `/opt/jbksy/deploy.sh` | 部署脚本 | root:root 755 |
| `/etc/jbksy.env` | 环境变量 | root:root **600** |
| `/etc/systemd/system/jbksy.service` | systemd 单元 | root:root 644 |
| `/etc/systemd/system/sqlite-web.service` | sqlite-web 单元 | root:root 644 |
| `/etc/nginx/conf.d/jbksy.conf` | nginx 站点 | root:root 644 |
| `/var/lib/jbksy/data/db.sqlite` | SQLite 主库 | root:root 644 |
| `/var/lib/jbksy/data/db.sqlite-wal` | WAL 日志 | root:root 644 |
| `/var/log/jbksy/app.log` | 应用 stdout | root:root 644 |
| `/var/log/jbksy/error.log` | 应用 stderr | root:root 644 |
| `/var/log/nginx/jbksy.access.log` | nginx 访问日志 | nginx 日志规则 |
| `/var/log/nginx/jbksy.error.log` | nginx 错误日志 | nginx 日志规则 |
| `/etc/letsencrypt/live/jbksy.cn/` | HTTPS 证书 | root:root 700 |

### `/etc/jbksy.env` 模板

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
NUXT_SESSION_SECRET=<32 字节随机串：openssl rand -hex 32>
NUXT_DB_PATH=/var/lib/jbksy/data/db.sqlite
NUXT_PUBLIC_SITE_URL=https://jbksy.cn
NUXT_PUBLIC_SITE_NAME=智识花园
NUXT_PUBLIC_AUTHOR_NAME=jiabaokang
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<改成强密码>
```

⚠️ 改完执行 `systemctl restart jbksy` 生效。

---

## 八、安全 checklist

- [x] 80 强制跳转 443（certbot 自动配置）
- [x] Node 只监听 loopback，不直接对外
- [x] `.env` 权限 600
- [x] SSH 密钥登录，禁用密码登录（如已配置）
- [x] CI 使用专用 deploy key，仅限 root（如需更严格可改为 `command=` 限制只能跑 deploy.sh）
- [ ] **改默认 admin 密码**（首次部署默认 `admin/admin123`）
- [ ] **改默认 sqlite-web 密码**（位于 `/etc/systemd/system/sqlite-web.service`）
- [ ] 阿里云安全组：仅开 22/80/443，关闭其他对外端口
- [ ] 定期备份 `db.sqlite` 到本地或 OSS

---

## 九、相关文档

- 项目说明：[`../README.md`](../README.md)
- MVP 开发计划：[`./superpowers/plans/2026-06-22-nuxt-mvp-full-plan.md`](./superpowers/plans/2026-06-22-nuxt-mvp-full-plan.md)
- GitHub Actions：<https://github.com/Jiabaokang/ai_persion_web/actions>
