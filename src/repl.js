import readline from 'readline';
import { parseCommand } from './utils/argParser.js';
import { cd, ls, up } from './navigation.js';
import { csvToJson } from './commands/csvToJson.js';
import { jsonToCsv } from './commands/jsonToCsv.js';
import { count } from './commands/count.js';
import { hash } from './commands/hash.js';
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';
import { decrypt } from './commands/decrypt.js';
import { logStats } from './commands/logStats.js';

export function startRepl(initialDir) {
  let currentDir = initialDir;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();

    if (input === '.exit') {
      console.log('Thank you for using Data Processing CLI!');
      process.exit(0);
    }

    try {
      const { command, args, options } = parseCommand(input);

      switch (command) {
        case 'up':
          currentDir = await up(currentDir);
          console.log(`You are currently in ${currentDir}`);
          break;

        case 'cd':
          if (!args[0]) {
            console.log('Invalid input');
            break;
          }
          currentDir = await cd(currentDir, args[0]);
          console.log(`You are currently in ${currentDir}`);
          break;

        case 'ls':
          await ls(currentDir);
          console.log(`You are currently in ${currentDir}`);
          break;

        case 'csv-to-json':
          if (!options.input || !options.output) {
            console.log('Invalid input');
            break;
          }
          await csvToJson(currentDir, options.input, options.output);
          break;

        case 'json-to-csv':
          if (!options.input || !options.output) {
            console.log('Invalid input');
            break;
          }
          await jsonToCsv(currentDir, options.input, options.output);
          break;

        case 'count':
          if (!options.input) {
            console.log('Invalid input');
            break;
          }
          await count(currentDir, options.input);
          break;
        case 'hash':
          if (!options.input) {
            console.log('Invalid input');
            break;
          }
          const algorithm = options.algorithm || 'sha256';
          const save = !!options.save;
          await hash(currentDir, options.input, algorithm, save);
          break;
        case 'hash-compare':
          if (!options.input || !options.hash) {
            console.log('Invalid input');
            break;
          }

          await hashCompare(
            currentDir,
            options.input,
            options.hash,
            options.algorithm || 'sha256',
          );
          break;
        case 'encrypt':
          if (!options.input || !options.output || !options.password) {
            console.log('Invalid input');
            break;
          }

          await encrypt(
            currentDir,
            options.input,
            options.output,
            options.password,
          );
          break;
        case 'decrypt':
          if (!options.input || !options.output || !options.password) {
            console.log('Invalid input');
            break;
          }

          await decrypt(
            currentDir,
            options.input,
            options.output,
            options.password,
          );
          break;
        case 'log-stats':
          if (!options.input || !options.output) {
            console.log('Invalid input');
            break;
          }

          await logStats(currentDir, options.input, options.output);
          break;
        default:
          console.log('Invalid input');
      }
    } catch (err) {
      console.log('Operation failed');
    }

    rl.prompt();
  });

  rl.on('SIGINT', () => {
    console.log('\nThank you for using Data Processing CLI!');
    process.exit(0);
  });
}
