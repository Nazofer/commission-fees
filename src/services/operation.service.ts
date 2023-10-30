import { OperationTypes } from '../enums/operations.enum.ts';
import { Operation } from '../interfaces/operation.interface.ts';
import { CASH_CONSTANTS } from '../constants/fees.ts';
import { naturalUsers } from '../users/naturalUser.ts';
import { UserTypes } from '../enums/users.enum.ts';
import { WEEK_IN_MILISECS } from '../constants/dates.ts';
import { printError, printSuccess } from './logger.service.ts';

const getCommissionFeeForCashIn = (operation: Operation): number => {
  const { amount, currency } = operation.operation;
  const { percents } = CASH_CONSTANTS.cash_in;

  const fee = (amount * percents) / 100;
  const maxFee = CASH_CONSTANTS.cash_in.max.find(
    (item) => item.currency === currency
  )?.amount;

  if (!maxFee) {
    throw new Error('No max fee for this currency');
  }

  return fee > maxFee ? maxFee : fee;
};

const getCommissionFeeForCashOutNatural = (operation: Operation): number => {
  const { amount, currency } = operation.operation;
  const rule = CASH_CONSTANTS.cash_out.natural;

  if ('week_limit' in rule) {
    const weekLimit = rule.week_limit.find(
      (item) => item.currency === currency
    )?.amount;

    if (!weekLimit) {
      throw new Error('No week limit for this currency');
    }

    let exceededAmount = 0;
    let freeCashOutThisWeek = weekLimit;

    const existedUser = naturalUsers.find(
      (item) => item.id === operation.user_id
    );

    if (!existedUser) {
      exceededAmount = amount - freeCashOutThisWeek;
      naturalUsers.push({
        id: operation.user_id,
        freeCashOutThisWeek:
          exceededAmount > 0 ? 0 : freeCashOutThisWeek - amount,
        type: UserTypes.NATURAL,
        weekLimitDate: operation.date,
      });
    } else {
      const weekLimitDate = new Date(existedUser.weekLimitDate).getTime();
      const currentDate = new Date(operation.date).getTime();
      if (currentDate - weekLimitDate > WEEK_IN_MILISECS) {
        existedUser.weekLimitDate = operation.date;
        existedUser.freeCashOutThisWeek =
          freeCashOutThisWeek - amount < 0 ? 0 : freeCashOutThisWeek - amount;
        exceededAmount = amount - existedUser.freeCashOutThisWeek;
      } else {
        existedUser.freeCashOutThisWeek -= amount;
        if (existedUser.freeCashOutThisWeek < 0) {
          existedUser.freeCashOutThisWeek = 0;
        }
        exceededAmount = amount - existedUser.freeCashOutThisWeek;
      }
    }

    return exceededAmount > 0 ? (exceededAmount * rule.percents) / 100 : 0;
  }
  throw new Error('No rule found');
};

const getCommissionFeeForCashOutJuridical = (operation: Operation): number => {
  const { amount, currency } = operation.operation;
  const { percents } = CASH_CONSTANTS.cash_out[operation.user_type];
  const rule = CASH_CONSTANTS.cash_out[operation.user_type];
  if ('min' in rule) {
    const { min } = rule;
    const fee = (amount * percents) / 100;
    const minFee = min.find((item) => item.currency === currency)?.amount;

    if (!minFee) {
      throw new Error('No min fee for this currency');
    }

    return fee < minFee ? minFee : fee;
  }

  throw new Error('No rule found');
};

const getCommissionFeeForCashOut = (operation: Operation): number => {
  const { user_type } = operation;

  switch (user_type) {
    case 'natural':
      return getCommissionFeeForCashOutNatural(operation);

    case 'juridical':
      return getCommissionFeeForCashOutJuridical(operation);

    default:
      throw new Error('No such user type');
  }
};

const getCommissionFee = (operation: Operation): number => {
  const { type } = operation;

  switch (type) {
    case OperationTypes.CASH_IN:
      return getCommissionFeeForCashIn(operation);

    case OperationTypes.CASH_OUT:
      return getCommissionFeeForCashOut(operation);
    default:
      throw new Error('No such operation type');
  }
};

export const calculateCommissionFees = (operations: Operation[]): void => {
  const dataSortedByDateASC = operations.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  dataSortedByDateASC.forEach((item) => {
    try {
      const res = getCommissionFee(item);
      if (res === null || res === undefined) {
        printError('No result');
        return;
      }
      printSuccess(res.toString());
    } catch (err) {
      printError((err as Error).message);
    }
  });
};
