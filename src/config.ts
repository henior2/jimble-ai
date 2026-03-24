const config = {
  telegram: {
    token: Bun.env.TELEGRAM_BOT_TOKEN,
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
