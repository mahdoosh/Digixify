import { promises as fs } from 'fs';
import path from 'path';

export async function fileRead(args: { path: string }): Promise<string> {
  const workspace = process.env.DIGIXIFY_WORKSPACE || path.join(process.env.HOME || '', '.digixify', 'workspace');
  const fullPath = path.resolve(workspace, args.path);
  // Ensure path is within workspace
  if (!fullPath.startsWith(workspace)) {
    throw new Error('Access denied: path outside workspace');
  }
  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    return content;
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}

export async function fileWrite(args: { path: string; content: string }): Promise<string> {
  const workspace = process.env.DIGIXIFY_WORKSPACE || path.join(process.env.HOME || '', '.digixify', 'workspace');
  const fullPath = path.resolve(workspace, args.path);
  if (!fullPath.startsWith(workspace)) {
    throw new Error('Access denied: path outside workspace');
  }
  try {
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, args.content, 'utf-8');
    return `Wrote ${args.path}`;
  } catch (err: any) {
    return `Error: ${err.message}`;
  }
}
