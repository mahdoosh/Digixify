import OpenAI from 'openai';

export class OpenRouterProvider {
  private client: OpenAI;

  constructor(apiKey: string, baseURL?: string, private defaultModel?: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL || 'https://openrouter.ai/api/v1',
    });
    this.defaultModel = defaultModel || 'openrouter/auto';
  }

  async chat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[], tools?: any, model?: string) {
    const response = await this.client.chat.completions.create({
      model: model || this.defaultModel,
      messages,
      tools,
      tool_choice: tools && tools.length > 0 ? 'auto' : undefined,
    });
    return response;
  }
}
