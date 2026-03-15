import fs from 'fs';
import readline from 'readline';
import { parentPort, workerData } from 'worker_threads';

const { inputPath, start, end } = workerData;

async function processChunk() {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputPath, {
      start,
      end,
      encoding: 'utf8',
    });

    const rl = readline.createInterface({ input: stream });
    const stats = {
      total: 0,
      levels: {},
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
      paths: {},
      responseTimeSum: 0,
    };

    let firstLineSkipped = start !== 0;

    rl.on('line', (line) => {
      if (!line.trim()) return;

      if (firstLineSkipped) {
        firstLineSkipped = false;
        return;
      }

      stats.total += 1;
      const parts = line.split(' ');
      if (parts.length < 7) return;

      const [, level, , statusCodeStr, responseTimeStr, , pathVal] = parts;
      const statusCode = Number(statusCodeStr);
      const responseTime = Number(responseTimeStr);

      stats.levels[level] = (stats.levels[level] || 0) + 1;

      if (statusCode >= 200 && statusCode < 300) stats.status['2xx'] += 1;
      else if (statusCode >= 300 && statusCode < 400) stats.status['3xx'] += 1;
      else if (statusCode >= 400 && statusCode < 500) stats.status['4xx'] += 1;
      else if (statusCode >= 500) stats.status['5xx'] += 1;

      stats.responseTimeSum += responseTime;
      stats.paths[pathVal] = (stats.paths[pathVal] || 0) + 1;
    });

    rl.on('close', () => resolve(stats));
    rl.on('error', (err) => reject(err));
  });
}

processChunk().then((stats) => parentPort.postMessage(stats));
