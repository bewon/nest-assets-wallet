export interface BalanceChangeInterface {
  capital: number;
  value: number;
  date: string;
  previousChange: BalanceChangeInterface | null;
  getProfit(): number;

  getPeriodReturn(): number | null;
}

export class BalanceChangeModel implements BalanceChangeInterface {
  constructor(
    public capital: number,
    public value: number,
    public date: string,
    public previousChange: BalanceChangeInterface | null = null,
  ) {}
  getProfit(): number {
    return Math.round((this.value - this.capital) * 100) / 100;
  }
  getPeriodReturn(): number | null {
    if (this.previousChange == null) {
      return null;
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
