import { fileRead, fileWrite } from './FileSystem.js';
import { shellExec } from './Shell.js';
import { webFetch } from './WebFetch.js';

export interface Tool {
  name: string;
  description: string;
  parameters: any; // JSON schema
  execute: (args: any) => Promise<string>;
}

export const tools: Tool[] = [
  {
    name: 'file_read',
    description: 'Read a file from the workspace. Returns the file content as text.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path to the file within the workspace' },
      },
      required: ['path'],
    },
    execute: fileRead,
  },
  {
    name: 'file_write',
    description: 'Write content to a file in the workspace. Overwrites if exists. Creates directories as needed.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path to the file within the workspace' },
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['path', 'content'],
    },
    execute: fileWrite,
  },
  {
    name: 'shell_exec',
    description: 'Execute a shell command in the workspace. Use with caution. Returns stdout and stderr.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command to run (bash)' },
      },
      required: ['command'],
    },
    execute: shellExec,
  },
  {
    name: 'web_fetch',
    description: 'Fetch a URL and return its content as text. Optionally limit length.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL to fetch' },
        maxChars: { type: 'number', description: 'Maximum characters to return (default 4000)' },
      },
      required: ['url'],
    },
    execute: webFetch,
  },
];

export function getOpenAITools() {
  return tools.map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

export async function executeTool(name: string, args: any): Promise<string> {
  const tool = tools.find(t => t.name === name);
  if (!tool) return `Error: tool ${name} not found`;
  try {
    return await tool.execute(args);
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}
