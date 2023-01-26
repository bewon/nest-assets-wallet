import {
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AssetEntity } from './asset.entity';

@Entity('portfolio')
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => AssetEntity, (asset) => asset.portfolio, { cascade: true })
  assets: AssetEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
