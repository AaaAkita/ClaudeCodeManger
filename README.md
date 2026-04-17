### Plugin Manifest Gotchas

If you plan to edit `.claude-plugin/plugin.json`, be aware that the Claude plugin validator enforces several **undocumented but strict constraints** that can cause installs to fail with vague errors (for example, `agents: Invalid input`). In particular, component fields must be arrays, `agents` must use explicit file paths rather than directories, and a `version` field is required for reliable validation and installation.

These constraints are not obvious from public examples and have caused repeated installation failures in the past. They are documented in detail in `.claude-plugin/PLUGIN_SCHEMA_NOTES.md`, which should be reviewed before making any changes to the plugin manifest.

### Custom Endpoints and Gateways

ECC does not override Claude Code transport settings. If Claude Code is configured to run through an official LLM gateway or a compatible custom endpoint, the plugin continues to work because hooks, skills, and any retained legacy command shims execute locally after the CLI starts successfully.

Use Claude Code's own environment/configuration for transport selection, for example:

```bash
export ANTHROPIC_BASE_URL=https://your-gateway.example.com
export ANTHROPIC_AUTH_TOKEN=your-token
claude
```

## 配置备份与密钥保护 / Configuration Backup & Secret Protection

`settings.json` 和 `config.json` 包含真实的 API 密钥和访问令牌，已被 `.gitignore` 排除，**禁止直接提交到 Git**。

如需将配置备份到远程仓库，请运行脱敏脚本：

```bash
node scripts/backup-sensitive-config.js
```

该脚本会递归扫描 JSON 中的敏感字段（如 `token`、`key`、`secret`、`password`、`auth`、`credential`、`apiKey` 等），将疑似密钥的值替换为占位符（例如 `YOUR_ENV_ANTHROPIC_AUTH_TOKEN_HERE`），并生成对应的 `*.sanitized` 文件：

- `settings.json` → `settings.json.sanitized`
- `config.json` → `config.json.sanitized`

这些 `.sanitized` 文件仅移除了真实密钥，完整保留了其他配置项（权限、插件列表、模型设置、MCP 配置等），可以安全地提交到 Git，用作模板或异地备份。

## 新电脑部署 / New Machine Setup

1. **Clone 仓库**
   ```bash
   git clone <你的远程仓库地址> ~/.claude
   ```

2. **恢复配置模板**
   ```bash
   node ~/.claude/scripts/restore-config.js
   ```
   该脚本会将 `*.sanitized` 复制为正式的 `settings.json` 和 `config.json`。

3. **替换密钥占位符**
   打开恢复后的文件，将所有 `YOUR_*_HERE（...，请替换为真实值）` 替换为你的真实 API 密钥、GitHub Token 等。

4. **验证配置**
   重新运行恢复脚本，确认没有占位符残留：
   ```bash
   node ~/.claude/scripts/restore-config.js
   ```
   若输出「所有配置已恢复，未发现占位符，可以直接使用」，则表示配置完整，Claude Code 可以正常启动。

