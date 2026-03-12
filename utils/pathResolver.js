import path from 'path';

export function resolvePath(currentDir, inputPath) {
  if (!inputPath) return null;

  if (path.isAbsolute(inputPath)) {
    return path.normalize(inputPath);
  }

  return path.join(currentDir, inputPath);
}
