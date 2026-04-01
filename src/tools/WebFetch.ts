import { request } from 'https';
import { URL } from 'url';
import { pipeline } from 'stream';
import { promisify } from 'util';
import zlib from 'zlib';

const streamPipeline = promisify(pipeline);

export async function webFetch(args: { url: string; maxChars?: number }): Promise<string> {
  const max = args.maxChars || 4000;
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(args.url);
      const options = {
        method: 'GET',
        headers: {
          'User-Agent': 'Digixify/1.0',
          'Accept': 'text/html,application/json,text/plain,*/*',
          'Accept-Encoding': 'gzip, deflate',
        },
      };
      const req = request(url, options, (res) => {
        const chunks: Buffer[] = [];
        let encoding = '';
        const ce = res.headers['content-encoding'];
        if (ce) encoding = ce;
        res.on('data', (chunk) => {
          chunks.push(Buffer.from(chunk));
          // Early stop if we exceed max
          if (Buffer.concat(chunks).length > max * 2) { // over-approx
            res.destroy();
          }
        });
        res.on('end', () => {
          let buffer = Buffer.concat(chunks);
          try {
            if (encoding === 'gzip') {
              buffer = zlib.gunzipSync(buffer);
            } else if (encoding === 'deflate') {
              buffer = zlib.inflateSync(buffer);
            }
            const text = buffer.toString('utf-8');
            resolve(text.slice(0, max) + (text.length > max ? '...' : ''));
          } catch (e) {
            resolve(`Error decompressing: ${e}`);
          }
        });
      });
      req.on('error', reject);
      req.end();
    } catch (e: any) {
      resolve(`Error: ${e.message}`);
    }
  });
}
