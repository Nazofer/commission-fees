export const getArgs = (argv: string[]): string[] | null => {
  const args = argv.slice(2);
  if (args.length === 0) {
    return null;
  }
  return args;
};
