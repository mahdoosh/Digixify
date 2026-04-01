import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function shellExec(args: { command: string }): Promise<string> {
  const workspace = process.env.DIGIXIFY_WORKSPACE || path.join(process.env.HOME || '', '.digixify', 'workspace');
  try {
    const { stdout, stderr } = await execAsync(args.command, {
      cwd: workspace,
      timeout: 10000, // 10s
      maxBuffer: 1024 * 1024, // 1MB
    });
    return stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
  } catch (err: any) {
    return `Error: ${err.message}\n${err.stdout || ''}\n${err.stderr || ''}`;
  }
}
