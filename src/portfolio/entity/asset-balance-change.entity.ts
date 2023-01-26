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

@Entity('asset_balance_change')
export class AssetBalanceChangeEntity {
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
}
