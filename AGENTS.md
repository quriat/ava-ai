# Project Context

## My Role
- Personal assistant for Adam J.
- Help with daily tasks, software engineering, and anything else needed
- Always ask for clarification when unclear

## User: Adam J.
- **Business:** AvaLimo — limo service in Houston, TX
- **Website:** avalimo.net
- **Interests:** Automation, AI, self-hosting

## n8n Setup
- **Self-hosted at:** n8napp.adamj.fit
- **Workflows:** 27+ active workflows
- **Core booking pipeline:** Booking Router → Send Email + Create Calendar Event
- **Also:** Auto-post to LinkedIn via n8n

## OpenClaw (self-hosted AI agent)
When Adam says "openclaw dashboard", open the relevant instance:
- **Local (this Mac):** `http://127.0.0.1:18800/` — gateway runs as LaunchAgent, usually already up.
- **VPS (`168.231.74.172`):** gateway runs on the VPS at `127.0.0.1:18789`. Reach it via SSH tunnel, then open `http://localhost:18789/`:
  `ssh -N -L 18789:127.0.0.1:18789 root@168.231.74.172`
  - Token auto-auth is included in the copied URL; otherwise append `?token=<OPENCLAW_GATEWAY_TOKEN>`.
  - If gateway is down on VPS: `openclaw gateway stop` then `openclaw gateway run` (don't start a second instance — `EADDRINUSE` on 18789 means one is already running).
  - Run in background on VPS (survives logout/reboot): `openclaw gateway install` then `openclaw gateway enable` (systemd service). Quick detach: `nohup openclaw gateway run > /tmp/openclaw.log 2>&1 & disown`.
  - Known issue: `codex` plugin blocked by ownership mismatch (`uid=1000` vs root) — fix with `chown -R root:root /data/.openclaw/npm/projects/openclaw-codex-*/node_modules/@openclaw/codex`.

## Kimchi (terminal AI-coding agent on VPS `85.239.241.67`)
SSH access: `ssh -i ~/.ssh/hermes_key root@85.239.241.67` (hermes_key also works for `168.231.74.172`).
- **Binary:** `/usr/local/bin/kimchi`; **config dir:** `/root/.config/kimchi/harness/` (`settings.json`, `models.json`, `config.json`).
- **Current default:** provider `ollama-cloud`, model `deepseek-v4-flash` (Ollama Cloud paid API, GPU, no rate limits).
- **Ollama Cloud:** chat API base `https://ollama.com/v1` (OpenAI-compatible). NOTE: `api.ollama.com` 301-redirects to `ollama.com` and Kimchi's HTTP client converts POST→GET on redirect → `405`. Always use `https://ollama.com/v1` directly (NOT `api.ollama.com`). Key stored in `/etc/systemd/system/ollama.service.d/override.conf` (`OLLAMA_API_KEY`) AND in `models.json`. Validate (note the redirect-safe flags are only needed if you test via `api.ollama.com`): `curl -s --max-time 40 -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d '{"model":"deepseek-v4-flash","messages":[{"role":"user","content":"hi"}],"max_tokens":8}' https://ollama.com/v1/chat/completions`.
- **Available cheap Ollama Cloud models:** `deepseek-v4-flash` (default, cheap+fast), `gpt-oss:20b`, `nemotron-3-nano:30b`, `kimi-k2.5`, `kimi-k2.6`, `minimax-m2.5`, `glm-5.2`.
- **Local ollama** (`localhost:11434`, CPU-only / no GPU) is slow. ollama service override sets `OLLAMA_FLASH_ATTENTION=0`, `OLLAMA_KEEP_ALIVE=10m`, `OLLAMA_REQUEST_TIMEOUT=3600`.
- **Qwen models are BROKEN on this host** — ollama loads them but the runner never responds (CPU/GGUF incompatibility). Do NOT use `qwen2.5*` via local ollama.
- **`kimchi-dev` free models** (`kimi-k2.7`, `deepseek-v4-flash`, etc.) are rate-limited (429) on the free tier — rotate between them or use the paid `ollama-cloud` provider.
- **Fixes applied:** raised ollama `OLLAMA_REQUEST_TIMEOUT` to 3600 (was 300s → "Request timed out" at 5min); reverted broken `qwen2.5-kimchi:3b` custom model.
