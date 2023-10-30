import { UserTypes } from '../enums/users.enum.ts';

export interface NaturalUser {
  type: UserTypes.NATURAL;
  id: number;
  freeCashOutThisWeek: number;
  weekLimitDate: string;
}
