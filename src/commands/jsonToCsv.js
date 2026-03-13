import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';
import { resolvePath } from '../utils/pathResolver.js';

export async function jsonToCsv(currentDir, input, output) {
  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    const content = await fs.promises.readFile(inputPath, 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error();
    }

    const headers = Object.keys(data[0]);
    const lines = [];

    lines.push(headers.join(','));

    for (const obj of data) {
      const row = headers.map((h) => obj[h] ?? '').join(',');
      lines.push(row);
    }

    const csvStream = Readable.from(lines.map((l) => l + '\n'));

    const writeStream = fs.createWriteStream(outputPath);

    await pipeline(csvStream, writeStream);
  } catch (err) {
    throw new Error('Operation failed');
  }
}
