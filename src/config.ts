const config = {
  telegram: {
    token: Bun.env.TELEGRAM_BOT_TOKEN,
    storeMessages: Bun.env.TELEGRAM_STORE_MESSAGES,
  },
  discord: {
    token: Bun.env.DISCORD_BOT_TOKEN,
  },
};

export default config;

// function required(key: string): string {
// 	const val = Bun.env[key];
// 	if (!val) throw new Error(`Missing required env var: ${key}`);
// 	return val;
// }
