import OpenAI from 'openai';
import config from '@/config';

const webSearchTool = config.ai.openrouter
  ? { type: 'openrouter:web_search' }
  : { type: 'web_search' };

export const abortResponse = new Map<number | string, AbortController>();

export async function getResponse(
  key: string,
  model: string,
  messages: OpenAI.ChatCompletionMessageParam[],
  search: boolean = false,
  responseID?: number | string,
) {
  const client = new OpenAI({
    apiKey: key,
    baseURL: config.ai.baseURL,
    defaultHeaders: {
      'HTTP-Referer': 'https://github.com/henior2/jimble-ai',
      'X-OpenRouter-Title': 'Jimble AI',
    },
  });

  const controller = responseID !== undefined ? new AbortController() : null;
  if (responseID && controller) {
    abortResponse.set(responseID, controller);
  }

  return await client.chat.completions.create(
    {
      model,
      messages: [
        {
          role: 'system',
          content: config.ai.system ?? '',
        },
        ...messages,
      ],
      tools: (search
        ? [webSearchTool]
        : []) as OpenAI.Chat.Completions.ChatCompletionTool[],
      stream: true,
    },
    {
      signal: controller?.signal,
    },
  );
}
