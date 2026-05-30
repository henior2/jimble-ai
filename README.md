# jimble-ai

This is a Discord and Telegram bot for LLM support via OpenRouter.

## stack

- Bun for runtime
- Docker for deployments
- [grammY](https://grammy.dev/) for the Telegram bot
- [discord.js](https://discord.js.org/) for the Discord bot
- [lmdb-js](https://www.npmjs.com/package/lmdb) for user data and message storage
  <!-- - Postgres for database (with Bun SQL driver) -->
  <!-- - [Drizzle](https://orm.drizzle.team/) for ORM -->

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## running

1. Create a new directory for storing the docker compose and bot data.
2. Copy the `docker-compose.yml` file to the directory or run:
```bash
curl -LO https://raw.githubusercontent.com/henior2/jimble-ai/refs/heads/main/docker-compose.yml
```
3. Edit the file and fill in the environment variables
4. Run with `docker compose up -d`

## conventions

`_template` - used to denote that a file does not contain project code but a template for other files in that scope (eg. bot command handlers)
