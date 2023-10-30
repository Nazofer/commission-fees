import chalk from 'chalk';

export const printError = (err: string): void => {
  console.log(`${chalk.bgRed(' ERROR ')} ${err}`);
};

export const printSuccess = (msg: string): void => {
  console.log(`${chalk.bgGreen(' SUCCESS ')} ${msg}`);
};
