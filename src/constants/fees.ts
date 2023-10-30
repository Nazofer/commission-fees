import { Currency } from '../enums/currencies.enum.ts';

export const CASH_CONSTANTS = Object.freeze({
  cash_in: {
    percents: 0.03,
    max: [
      {
        amount: 5,
        currency: Currency.EUR,
      },
    ],
  },
  cash_out: {
    natural: {
      percents: 0.3,
      week_limit: [
        {
          amount: 1000,
          currency: Currency.EUR,
        },
      ],
    },
    juridical: {
      percents: 0.3,
      min: [
        {
          amount: 0.5,
          currency: Currency.EUR,
        },
      ],
    },
  },
});
