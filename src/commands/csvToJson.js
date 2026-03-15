import fs from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import { resolvePath } from '../utils/pathResolver.js';

export async function csvToJson(currentDir, input, output) {
  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    const readStream = fs.createReadStream(inputPath, { encoding: 'utf8' });
    const writeStream = fs.createWriteStream(outputPath);

    let headers = null;
    let isFirst = true;

    const transform = new Transform({
      writableObjectMode: false,
      readableObjectMode: false,

      transform(chunk, encoding, callback) {
        const lines = chunk.toString().split('\n').filter(Boolean);
        let result = '';

        for (const line of lines) {
          const values = line.split(',');

          if (!headers) {
            headers = values;
            continue;
          }

          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = values[i];
          });

          const json = JSON.stringify(obj);

          if (isFirst) {
            result += '[' + json;
            isFirst = false;
          } else {
            result += ',' + json;
          }
        }

        callback(null, result);
      },

      flush(callback) {
        callback(null, ']');
      },
    });

    await pipeline(readStream, transform, writeStream);
  } catch (err) {
    throw new Error('Operation failed');
  }
}
