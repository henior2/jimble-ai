const config = {
  telegram: {
    token: Bun.env.TELEGRAM_BOT_TOKEN,
    storeMessages: Bun.env.TELEGRAM_STORE_MESSAGES,
  },
  discord: {
    token: Bun.env.DISCORD_BOT_TOKEN,
  },
  ai: {
    // baseURL: Bun.env.AI_OPENROUTER
    baseURL: Bun.env.OPENAI_BASE_URL
      ? Bun.env.OPENAI_BASE_URL
      : 'https://openrouter.ai/api/v1',
    openrouter: Bun.env.AI_OPENROUTER,
    system: Bun.env.AI_SYSTEM,
  },
  debug: !!Bun.env.DEBUG,
};

export default config;

// function required(key: string): string {
// 	const val = Bun.env[key];
// 	if (!val) throw new Error(`Missing required env var: ${key}`);
// 	return val;
// }
