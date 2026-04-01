import { OpenRouterProvider } from '../providers/OpenRouterProvider.js';
import { getOpenAITools, executeTool } from '../tools/index.js';
import fs from 'fs/promises';
import path from 'path';

interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  tool_calls?: any[];
  tool_call_id?: string;
}

export class Agent {
  private provider: OpenRouterProvider;
  private systemPrompt: string;
  private histories: Map<string, Message[]> = new Map();
  private maxHistory = 20; // rounds

  constructor(apiKey: string, systemPrompt?: string) {
    this.provider = new OpenRouterProvider(apiKey);
    this.systemPrompt = systemPrompt || this.defaultSystem();
  }

  private defaultSystem(): string {
    const soul = process.env.AGENT_SOUL || 'You are a helpful AI colleague.';
    return `${soul}\n\nYou are Digixify, an AI assistant that can use tools to accomplish tasks. Think step by step. When you need information or to perform an action, use the available tools. Always explain what you are doing before doing it. Respect privacy and safety.`;
  }

  private ensureHistory(chatId: string): Message[] {
    if (!this.histories.has(chatId)) {
      this.histories.set(chatId, [{ role: 'system', content: this.systemPrompt }]);
    }
    return this.histories.get(chatId)!;
  }

  private trimHistory(chatId: string) {
    const hist = this.histories.get(chatId)!;
    // Keep system at front, then keep most recent messages up to maxHistory (excluding system)
    const system = hist[0];
    const rest = hist.slice(1);
    if (rest.length > this.maxHistory) {
      const recent = rest.slice(-this.maxHistory);
      this.histories.set(chatId, [system, ...recent]);
    }
  }

  async handleMessage(userText: string, chatId: string): Promise<string> {
    const history = this.ensureHistory(chatId);
    history.push({ role: 'user', content: userText });

    // Loop for tool calls
    let result: string;
    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      const response = await this.provider.chat(history, getOpenAITools());
      const choice = response.choices[0];
      const assistantMsg = choice.message;

      // Add assistant message to history (including tool calls if any)
      history.push(assistantMsg);

      if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
        result = assistantMsg.content || '';
        break;
      }

      // Execute each tool call and add tool response messages
      for (const toolCall of assistantMsg.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const observation = await executeTool(toolName, toolArgs);
        history.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: observation,
        });
      }

      iterations++;
    }

    if (iterations >= maxIterations) {
      result = "I reached the maximum number of steps. Here's the latest output from the last step:\n" + (history[history.length-1].content || '');
    }

    this.trimHistory(chatId);
    return result || '(no response)';
  }
}
