import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { AssetEntity } from './asset.entity';
import { BalanceChangeInterface } from './balance-change.model';

@Entity('asset_balance_change')
export class AssetBalanceChangeEntity implements BalanceChangeInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetEntity)
  asset: AssetEntity;

  @Column({ nullable: false })
  @RelationId((change: AssetBalanceChangeEntity) => change.asset)
  assetId: string;

  @Column({ type: 'decimal', precision: 17, scale: 2, nullable: false })
  capital: number;

  @Column({ type: 'decimal', precision: 17, scale: 2, nullable: false })
  value: number;

  @Column('date', { nullable: false })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  previousChange: AssetBalanceChangeEntity | null = null;

  getProfit(): number {
    return this.value - this.capital;
  }

  getPeriodReturn(): number {
    // TODO: Make it DRY
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
