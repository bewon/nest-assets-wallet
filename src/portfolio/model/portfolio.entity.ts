import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { AssetEntity } from './asset.entity';
import { UserEntity } from '../../auth/model/user.entity';

export const defaultPortfolioId = 'default';

@Entity('portfolio')
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => AssetEntity, (asset) => asset.portfolio, { cascade: true })
  assets: AssetEntity[];

  @OneToOne(() => UserEntity)
  @JoinColumn()
  user: UserEntity;

  @Column({ nullable: true })
  @RelationId((portfolio: PortfolioEntity) => portfolio.user)
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
