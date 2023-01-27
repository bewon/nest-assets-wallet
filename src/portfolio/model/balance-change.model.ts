export interface BalanceChangeInterface {
  capital: number;
  value: number;
  date: Date;
  previousChange: BalanceChangeInterface | null;
  getProfit(): number;

  getPeriodReturn(): number;
}

export class BalanceChangeModel implements BalanceChangeInterface {
  constructor(
    public capital: number,
    public value: number,
    public date: Date,
    public previousChange: BalanceChangeInterface | null = null,
  ) {}
  getProfit(): number {
    return this.value - this.capital;
  }
  getPeriodReturn(): number {
    if (this.previousChange === null) {
      throw new Error('Previous change is not set');
    }
    if (this.previousChange.value === 0) {
      return 1.0;
    }
    const capitalChange = this.capital - this.previousChange.capital;
    const returnChange =
      (this.value - capitalChange) / this.previousChange.value;
    return returnChange < 0.0 ? 1.0 : returnChange;
  }
}
