import fs from 'fs';
import crypto from 'crypto';
import { resolvePath } from '../utils/pathResolver.js';

const SUPPORTED = ['sha256', 'md5', 'sha512'];

export async function hashCompare(
  currentDir,
  inputFile,
  hashFile,
  algorithm = 'sha256',
) {
  try {
    if (!SUPPORTED.includes(algorithm)) {
      throw new Error('Unsupported algorithm');
    }

    const inputPath = resolvePath(currentDir, inputFile);
    const hashPath = resolvePath(currentDir, hashFile);

    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(inputPath);

    for await (const chunk of stream) {
      hash.update(chunk);
    }

    const calculated = hash.digest('hex');

    const expectedRaw = await fs.promises.readFile(hashPath, 'utf8');

    const expected = expectedRaw.trim().toLowerCase();

    if (calculated.toLowerCase() === expected) {
      console.log('OK');
    } else {
      console.log('MISMATCH');
    }
  } catch (err) {
    throw new Error('Operation failed');
  }
}
