import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

export async function decrypt(currentDir, input, output, password) {
  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    const fd = await fs.promises.open(inputPath, 'r');
    const stat = await fd.stat();

    if (stat.size < 44) {
      throw new Error();
    }

    const header = Buffer.alloc(28);
    await fd.read(header, 0, 28, 0);

    const salt = header.subarray(0, 16);
    const iv = header.subarray(16, 28);

    const authTag = Buffer.alloc(16);
    await fd.read(authTag, 0, 16, stat.size - 16);

    await fd.close();

    const key = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const inputStream = fs.createReadStream(inputPath, {
      start: 28,
      end: stat.size - 17,
    });

    const outputStream = fs.createWriteStream(outputPath);

    await pipeline(inputStream, decipher, outputStream);
  } catch (err) {
    throw new Error('Operation failed');
  }
}
