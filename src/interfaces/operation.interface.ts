import { OperationTypes } from '../enums/operations.enum.ts';
import { UserTypes } from '../enums/users.enum.ts';
import { Currency } from '../enums/currencies.enum.ts';

export interface OperationDetails {
  amount: number;
  currency: Currency;
}

export interface Operation {
  date: string;
  user_id: number;
  user_type: UserTypes;
  type: OperationTypes;
  operation: OperationDetails;
}
