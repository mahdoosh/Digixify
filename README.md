# Digixify Agent

A human-centric AI agent that lives in your chat apps (Telegram, Discord, etc.) and works with you as a persistent colleague.

Built on:
- [OpenClaw](https://openclaw.ai) for messaging, memory, and security
- OpenRouter (or any OpenAI-compatible API) for intelligence
- TypeScript/Node for portability

---

## Deploy in One Command (VPS/Docker)

The fastest way: run this on your VPS (SSH or web terminal):

```bash
curl -sSL https://raw.githubusercontent.com/mahdoosh/Digixify/main/install.sh | bash
```

It will:
- Install Docker (if missing)
- Create `/opt/digixify`
- Ask for your Telegram Bot Token
- Pull the pre-built image from GitHub Container Registry (or build locally if needed)
- Start the container

After it finishes, send a message to your bot. You'll get a startup notification in Telegram.

---

## Hostinger Docker Manager (GUI)

If you prefer Hostinger's Docker UI:

1. In Docker Manager, create a **Compose** project.
2. Name it `digixify`.
3. **Compose URL**: `https://raw.githubusercontent.com/mahdoosh/Digixify/main/docker-compose.yml`
4. Add these environment variables in the UI:
   - `TELEGRAM_BOT_TOKEN` = your bot token from @BotFather
   - `OPENAI_API_KEY` = your OpenRouter API key
   - `ADMIN_CHAT_ID` = `7446908876` (your Telegram user ID for startup alert)
   - `OPENAI_MODEL` = `stepfun/step-3.5-flash:free` (default free model)
5. Enable **Auto-restart**.
6. Deploy.

The manager will build the image from source and start the container.

---

## Quick Start (Manual)

### Option A: Native Node

1. Install dependencies:
   ```bash
   npm ci
   npm run build
   ```

2. Copy `.env.example` to `.env` and fill in:
   - `TELEGRAM_BOT_TOKEN` (from @BotFather)
   - `OPENAI_API_KEY` (your OpenRouter key)
   - `OPENAI_MODEL` (optional; default `openrouter/auto`)
   - `DIGIXIFY_WORKSPACE` (optional; default `~/.digixify/workspace`)

3. Run:
   ```bash
   npm start
   ```

4. Message your bot on Telegram.

---

### Option B: Docker (manual)

Ensure you have Docker + docker-compose installed.

1. Build and run:
   ```bash
   docker-compose up -d
   ```

2. Set environment variables (secrets) in one of two ways:
   - Create a `.env` file in the same directory (see `.env.example`)
   - Or pass via `docker-compose.yml` `environment:` section

3. To view logs:
   ```bash
   docker logs -f digixify
   ```

4. To stop:
   ```bash
   docker-compose down
   ```

---

## Features (v0.1)

- Telegram bot interface
- OpenAI-compatible LLM (OpenRouter or your own)
- Tools: file_read, file_write, shell_exec, web_fetch
- Per-chat history
- Workspace isolation

---

## Roadmap

See [SPEC.md](./SPEC.md) for full architecture and development plan.

---

## License

AGPLv3 — see LICENSE file.
