import path from 'path';

export function resolvePath(currentDir, inputPath) {
  return inputPath ? path.resolve(currentDir, inputPath) : null;
}
