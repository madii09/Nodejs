import fs from 'fs/promises';
import path from 'path';
import { resolvePath } from './utils/pathResolver.js';

export async function up(currentDir) {
  const parent = path.dirname(currentDir);
  if (parent === currentDir) return currentDir;
  return parent;
}

export async function cd(currentDir, targetPath) {
  try {
    const resolved = resolvePath(currentDir, targetPath);
    const stat = await fs.stat(resolved);

    if (!stat.isDirectory()) throw new Error('Not a directory');

    return resolved;
  } catch (err) {
    throw new Error('Operation failed');
  }
}

export async function ls(currentDir) {
  try {
    const items = await fs.readdir(currentDir, { withFileTypes: true });

    const folders = [];
    const files = [];

    for (const item of items) {
      if (item.isDirectory()) folders.push(item.name);
      else files.push(item.name);
    }

    folders.sort();
    files.sort();

    for (const f of folders) console.log(`${f}    [folder]`);
    for (const f of files) console.log(`${f}    [file]`);
  } catch (err) {
    throw new Error('Operation failed');
  }
}
