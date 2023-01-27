import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { PortfolioEntity } from './portfolio.entity';

@Entity('asset')
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string | null;

  @Column({ nullable: true })
  group: string | null;

  @ManyToOne(() => PortfolioEntity)
  portfolio: PortfolioEntity;

  @Column({ nullable: true })
  @RelationId((asset: AssetEntity) => asset.portfolio)
  portfolioId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
