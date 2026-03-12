import path from 'path';
import { startRepl } from './repl.js';

const initialDir = path.resolve('./');

console.log('Welcome to Data Processing CLI!');
console.log(`You are currently in ${initialDir}`);

startRepl(initialDir);
