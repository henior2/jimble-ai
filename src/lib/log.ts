/** biome-ignore-all lint/suspicious/noExplicitAny: logger can accept any params */
import config from '@/config';

export function logger(sender: string) {
  const base = (status: string, ...data: any[]) =>
    console.log(
      `${status} [${new Date().toISOString()}] [${sender}] ${data.join(' ')}`,
    );
  return {
    ok(...data: any[]) {
      base('OK  ', ...data);
    },
    warn(...data: any[]) {
      base('WARN', ...data);
    },
    error(...data: any[]) {
      base('ERR ', ...data);
    },
    info(...data: any[]) {
      base('INFO', ...data);
    },
    debug(...data: any[]) {
      if (!config.debug) return;
      base('DBG ', ...data);
    },
  };
}

export const core = logger('CORE');
export const telegram = logger('TELEGRAM');
export const discord = logger('DISCORD');
