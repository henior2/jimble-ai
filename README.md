# jimble-ai

This is a Discord and Telegram bot for LLM support via OpenRouter.

## stack

- Bun for runtime
- Docker for deployments
- [grammY](https://grammy.dev/) for the Telegram bot
- [discord.js](https://discord.js.org/) for the Discord bot
- [mtcute](https://mtcute.dev/) for MTProto access (reading Telegram messages)
- [lmdb-js](https://www.npmjs.com/package/lmdb) for user data and message cache
  <!-- - Postgres for database (with Bun SQL driver) -->
  <!-- - [Drizzle](https://orm.drizzle.team/) for ORM -->

This project was created using `bun init` in bun v1.3.5. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
