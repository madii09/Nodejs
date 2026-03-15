import fs from 'fs';
import { resolvePath } from '../utils/pathResolver.js';

export async function count(currentDir, input) {
  try {
    const inputPath = resolvePath(currentDir, input);

    const stream = fs.createReadStream(inputPath, { encoding: 'utf8' });

    let lines = 0;
    let words = 0;
    let characters = 0;

    let leftover = '';

    for await (const chunk of stream) {
      characters += chunk.length;

      const text = leftover + chunk;
      const parts = text.split(/\s+/);

      leftover = parts.pop();

      words += parts.filter(Boolean).length;

      lines += (chunk.match(/\n/g) || []).length;
    }

    if (leftover.trim()) {
      words++;
    }

    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${characters}`);
  } catch (err) {
    throw new Error('Operation failed');
  }
}
