# Claude Code 安装与配置恢复指南（AI 可读版）

> 本指南面向 AI 助手或自动化脚本，步骤明确、可逐条执行。
> **核心逻辑：先安装 Claude Code CLI，再克隆配置仓库，最后恢复密钥。**

---

## 1. 环境要求

| 项目 | 要求 |
|------|------|
| 操作系统 | macOS、Windows 10+、Linux |
| Node.js | v18.0+（推荐 v20 LTS） |
| Git | 已安装并配置用户身份 |
| 包管理器 | npm（内置）或 pnpm |

---

## 2. 安装 Claude Code CLI

### 2.1 通过 npm 安装（推荐）

```bash
npm install -g @anthropic-ai/claude-code
```

### 2.2 通过 pnpm 安装

```bash
pnpm add -g @anthropic-ai/claude-code
```

### 2.3 验证安装

```bash
claude --version
```

预期输出示例：`claude 0.x.x`

---

## 3. 首次启动与认证

运行以下命令启动 Claude Code，按提示完成登录或 API Key 配置：

```bash
claude
```

- 若使用浏览器 OAuth，按提示打开链接并授权。
- 若使用 API Key，需提前准备好 `ANTHROPIC_AUTH_TOKEN` 环境变量或在交互中输入。

---

## 4. 克隆配置仓库

确保 Claude Code 已安装并可以正常运行后，克隆远程配置仓库到本地 `~/.claude` 目录：

```bash
# 若目录已存在，先备份或移除
mv ~/.claude ~/.claude.backup.$(date +%s) 2>/dev/null || true

# 克隆仓库
git clone https://github.com/AaaAkita/ClaudeCodeManger.git ~/.claude
```

---

## 5. 恢复配置文件

进入配置目录并运行恢复脚本，从 `.sanitized` 模板生成正式配置文件：

```bash
cd ~/.claude
node scripts/restore-config.js
```

**预期输出：**

```
[restored] settings.json
[warn] settings.json 中仍有 X 个占位符未替换：
  - YOUR_ENV_ANTHROPIC_AUTH_TOKEN_HERE
  - YOUR_ENV_GITHUB_PERSONAL_ACCESS_TOKEN_HERE
[restored] config.json
[ok] config.json 中没有发现占位符。
配置已恢复，但仍有占位符未替换。请在编辑后重新运行此脚本验证。
```

---

## 6. 替换密钥占位符

编辑 `settings.json` 和 `config.json`，将所有 `YOUR_*_HERE` 占位符替换为真实值。

**必须替换的字段（通常在 `settings.json` 的 `env` 中）：**

| 占位符 | 说明 |
|--------|------|
| `YOUR_ENV_ANTHROPIC_AUTH_TOKEN_HERE` | Anthropic API Key 或网关 Token |
| `YOUR_ENV_GITHUB_PERSONAL_ACCESS_TOKEN_HERE` | GitHub Personal Access Token |

编辑完成后，再次运行验证脚本：

```bash
node scripts/restore-config.js
```

**成功标志：**

```
所有配置已恢复，未发现占位符，可以直接使用。
```

---

## 7. 最终验证

重新启动 Claude Code，确认配置生效且无报错：

```bash
claude
```

在 Claude Code 内部可执行以下检查：

```bash
/check-skills
```

或查看代理列表是否加载正常：

```bash
/agents
```

---

## 8. 快速检查清单（AI 执行用）

- [ ] `claude --version` 返回版本号
- [ ] `~/.claude` 目录存在且包含 `scripts/restore-config.js`
- [ ] `node scripts/restore-config.js` 执行成功
- [ ] `settings.json` 中无剩余占位符
- [ ] `claude` 能正常启动并进入交互界面

---

## 故障排查

### `claude: command not found`
- 检查 Node.js 全局安装路径是否在 `PATH` 中
- 尝试 `npx claude` 作为临时替代

### `restore-config.js` 报错文件不存在
- 确认当前工作目录是 `~/.claude`
- 确认仓库已完整克隆（`settings.json.sanitized` 和 `config.json.sanitized` 存在）

### 启动后配置未生效
- 确认编辑的是 `~/.claude/settings.json`，而非 `settings.json.sanitized`
- 检查 Claude Code 是否读取了正确的配置目录（默认 `$HOME/.claude`）
