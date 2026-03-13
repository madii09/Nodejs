export function parseCommand(input) {
  const parts = input.trim().split(/\s+/);

  const command = parts[0];
  const args = [];
  const options = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith('--')) {
      const key = part.slice(2);

      const next = parts[i + 1];

      if (!next || next.startsWith('--')) {
        options[key] = true;
      } else {
        options[key] = next;
        i++;
      }
    } else {
      args.push(part);
    }
  }

  return { command, args, options };
}
