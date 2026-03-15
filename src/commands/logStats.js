import fs from 'fs';
import os from 'os';
import path from 'path';
import { Worker } from 'worker_threads';
import { resolvePath } from '../utils/pathResolver.js';

export async function logStats(currentDir, input, output) {
  try {
    const inputPath = resolvePath(currentDir, input);
    const outputPath = resolvePath(currentDir, output);

    await fs.promises.access(inputPath);

    const cpuCount = os.cpus().length;
    const statsPromises = [];

    const { size: fileSize } = await fs.promises.stat(inputPath);
    const chunkSize = Math.ceil(fileSize / cpuCount);

    for (let i = 0; i < cpuCount; i++) {
      const start = i * chunkSize;
      const end = Math.min((i + 1) * chunkSize - 1, fileSize - 1);

      statsPromises.push(
        new Promise((resolve, reject) => {
          const worker = new Worker(path.resolve('src/workers/logWorker.js'), {
            workerData: { inputPath, start, end },
          });

          worker.on('message', resolve);
          worker.on('error', reject);
          worker.on('exit', (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with code ${code}`));
          });
        }),
      );
    }

    const results = await Promise.all(statsPromises);

    const finalStats = {
      total: 0,
      levels: {},
      status: { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 },
      paths: {},
      responseTimeSum: 0,
    };

    for (const res of results) {
      finalStats.total += res.total;
      finalStats.responseTimeSum += res.responseTimeSum;

      for (const level in res.levels) {
        finalStats.levels[level] =
          (finalStats.levels[level] || 0) + res.levels[level];
      }

      for (const status in res.status) {
        finalStats.status[status] += res.status[status];
      }

      for (const pathKey in res.paths) {
        finalStats.paths[pathKey] =
          (finalStats.paths[pathKey] || 0) + res.paths[pathKey];
      }
    }

    const topPaths = Object.entries(finalStats.paths)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const result = {
      total: finalStats.total,
      levels: finalStats.levels,
      status: finalStats.status,
      topPaths,
      avgResponseTimeMs:
        finalStats.total === 0
          ? 0
          : Number((finalStats.responseTimeSum / finalStats.total).toFixed(2)),
    };

    await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2));
  } catch {
    throw new Error('Operation failed');
  }
}
