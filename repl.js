import readline from 'readline';
import { parseCommand } from './utils/argParser.js';
import { up, cd, ls } from './navigation.js';

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
          break;

        case 'cd':
          if (!args[0]) {
            console.log('Invalid input');
            break;
          }
          currentDir = await cd(currentDir, args[0]);
          break;

        case 'ls':
          await ls(currentDir);
          break;

        default:
          console.log('Invalid input');
      }

      console.log(`You are currently in ${currentDir}`);
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
