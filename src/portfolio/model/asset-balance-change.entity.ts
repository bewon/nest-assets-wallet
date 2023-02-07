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
import { BalanceChangeModel } from './balance-change.model';

export class ColumnDecimalTransformer {
  to(data: number | null): number | null {
    return data;
  }
  from(data: string | null): number | null {
    return data == null ? null : parseFloat(data);
  }
}

@Entity('asset_balance_change')
export class AssetBalanceChangeEntity extends BalanceChangeModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AssetEntity)
  asset: AssetEntity;

  @Column({ nullable: false })
  @RelationId((change: AssetBalanceChangeEntity) => change.asset)
  assetId: string;

  @Column({
    type: 'decimal',
    precision: 17,
    scale: 2,
    nullable: false,
    transformer: new ColumnDecimalTransformer(),
  })
  capital: number;

  @Column({
    type: 'decimal',
    precision: 17,
    scale: 2,
    nullable: false,
    transformer: new ColumnDecimalTransformer(),
  })
  value: number;

  @Column('date', { nullable: false })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  previousChange: AssetBalanceChangeEntity | null = null;
}
