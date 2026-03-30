import createClient from 'openapi-fetch';
import type { paths as openrouterPaths } from './schemas/openrouter';

export const openrouter = createClient<openrouterPaths>({
  baseUrl: 'https://openrouter.ai/api/v1/',
});
