import { getArgs } from './src/helpers/args.ts';
import { printError } from './src/services/logger.service.ts';
import { calculateCommissionFees } from './src/services/operation.service.ts';
import { getData } from './src/services/storage.service.ts';

const initCLI = async () => {
  const args = getArgs(process.argv);
  if (!args) {
    printError('No inputs provided');
    return;
  }
  const data = await getData(args[0]);
  if (!data) {
    printError('No data found');
    return;
  }

  calculateCommissionFees(data);
};

initCLI();
