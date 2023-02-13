import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { PortfolioEntity } from './portfolio.entity';
import { AssetBalanceChangeEntity } from './asset-balance-change.entity';

@Entity('asset')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  group?: string;

  @ManyToOne(() => PortfolioEntity)
  portfolio: PortfolioEntity;

  @Column({ nullable: true })
  @RelationId((asset: AssetEntity) => asset.portfolio)
  portfolioId: string;

  @OneToMany(() => AssetBalanceChangeEntity, (change) => change.asset, {
    cascade: ['insert', 'update', 'remove'],
  })
  balanceChanges: AssetBalanceChangeEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
