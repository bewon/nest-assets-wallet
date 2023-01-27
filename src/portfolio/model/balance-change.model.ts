export interface BalanceChangeInterface {
  capital: number;
  value: number;
  date: Date;
  previousChange: BalanceChangeInterface | null;
}

export class BalanceChangeModel implements BalanceChangeInterface {
  constructor(
    public capital: number,
    public value: number,
    public date: Date,
    public previousChange: BalanceChangeInterface | null = null,
  ) {}
}
