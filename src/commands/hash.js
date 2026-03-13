import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { resolvePath } from '../utils/pathResolver.js';
import { pipeline } from 'stream/promises';

const SUPPORTED_ALGORITHMS = ['sha256', 'md5', 'sha512'];

export async function hash(
  currentDir,
  inputFile,
  algorithm = 'sha256',
  save = false,
) {
  try {
    if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
      throw new Error('Unsupported algorithm');
    }

    const resolvedInput = resolvePath(currentDir, inputFile);

    await fs.promises.access(resolvedInput, fs.constants.R_OK);

    const hashStream = crypto.createHash(algorithm);
    const inputStream = fs.createReadStream(resolvedInput);

    await pipeline(inputStream, hashStream);

    const digest = hashStream.digest('hex');

    console.log(`${algorithm}: ${digest}`);

    if (save) {
      const outputFile = `${resolvedInput}.${algorithm}`;
      await fs.promises.writeFile(outputFile, digest);
      console.log(`Saved hash to ${outputFile}`);
    }
  } catch (err) {
    console.log('Operation failed');
  }
}
