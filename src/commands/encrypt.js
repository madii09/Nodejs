import fs from 'fs';
import crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { resolvePath } from '../utils/pathResolver.js';

export async function encrypt(currentDir, input, output, password) {
  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);

    const key = await new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const inputStream = fs.createReadStream(inputPath);
    const outputStream = fs.createWriteStream(outputPath);

    outputStream.write(salt);
    outputStream.write(iv);

    await pipeline(inputStream, cipher, outputStream);

    const authTag = cipher.getAuthTag();
    await fs.promises.appendFile(outputPath, authTag);
  } catch (err) {
    throw new Error('Operation failed');
  }
}
