import { Currency } from '../enums/currencies.enum.ts';
import { OperationTypes } from '../enums/operations.enum.ts';
import { UserTypes } from '../enums/users.enum.ts';
import {
  getCommissionFeeForCashIn,
  getCommissionFeeForCashOutJuridical,
  getCommissionFeeForCashOutNatural,
} from '../services/operation.service.ts';
import { CASH_CONSTANTS } from '../constants/fees.ts';
import { naturalUsers } from '../users/naturalUser.ts';

describe('getCommissionFeeForCashIn', () => {
  it('should calculate the correct commission fee for cash in operations', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_IN,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };

    const commissionFee = getCommissionFeeForCashIn(operation);

    expect(commissionFee).toBe(0.3);
  });

  it('should throw an error if there is no max fee for the currency', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_IN,
      operation: {
        amount: 1000,
        currency: Currency.USD,
      },
    };
    expect(() => getCommissionFeeForCashIn(operation)).toThrow(
      'No max fee for this currency'
    );
  });

  it('should return the max fee if the calculated fee is greater than the max fee', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_IN,
      operation: {
        amount: 1000000,
        currency: Currency.EUR,
      },
    };

    const commissionFee = getCommissionFeeForCashIn(operation);

    expect(commissionFee).toBe(5);
  });
});
describe('getCommissionFeeForCashOutNatural', () => {
  beforeEach(() => {
    naturalUsers.length = 0;
  });

  it('should calculate the correct commission fee when user has not exceeded the free cash out limit', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };

    const commissionFee = getCommissionFeeForCashOutNatural(operation);

    expect(commissionFee).toBe(0);
  });

  it('should calculate the correct commission fee when user has exceeded the free cash out limit', () => {
    const operation1 = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };

    const operation2 = {
      date: '2021-08-02',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };

    const commissionFee1 = getCommissionFeeForCashOutNatural(operation1);
    const commissionFee2 = getCommissionFeeForCashOutNatural(operation2);

    expect(commissionFee1).toBe(0);
    expect(commissionFee2).toBe(3);
  });

  it('should throw an error if there is no week limit for the currency', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.USD,
      },
    };
    expect(() => getCommissionFeeForCashOutNatural(operation)).toThrow(
      'No week limit for this currency'
    );
  });

  it('should throw an error if no rule is found', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.NATURAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };
    CASH_CONSTANTS.cash_out.natural = {} as any;
    expect(() => getCommissionFeeForCashOutNatural(operation)).toThrow(
      'No rule found'
    );
  });
});
describe('getCommissionFeeForCashOutJuridical', () => {
  it('should calculate the correct commission fee for cash out operations for juridical users', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.JURIDICAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };

    const commissionFee = getCommissionFeeForCashOutJuridical(operation);

    expect(commissionFee).toBe(3);
  });

  it('should return the minimum fee if the calculated fee is less than the minimum fee', () => {
    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.JURIDICAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 100,
        currency: Currency.EUR,
      },
    };

    const commissionFee = getCommissionFeeForCashOutJuridical(operation);

    expect(commissionFee).toBe(0.5);
  });

  it('should throw an error if there is no rule for the user type', () => {
    CASH_CONSTANTS.cash_out.juridical = {
      percents: 0.3,
    } as any;

    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.JURIDICAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.EUR,
      },
    };

    expect(() => getCommissionFeeForCashOutJuridical(operation)).toThrow(
      'No rule found'
    );
  });

  it('should throw an error if there is no minimum fee for the currency', () => {
    CASH_CONSTANTS.cash_out.juridical = {
      percents: 0.3,
      min: [],
    } as any;

    const operation = {
      date: '2021-08-01',
      user_id: 1,
      user_type: UserTypes.JURIDICAL,
      type: OperationTypes.CASH_OUT,
      operation: {
        amount: 1000,
        currency: Currency.USD,
      },
    };

    expect(() => getCommissionFeeForCashOutJuridical(operation)).toThrow(
      'No min fee for this currency'
    );
  });
});
