import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfoliosController } from './controller/portfolios.controller';
import { PortfolioService } from './service/portfolio.service';
import { PortfolioEntity } from './model/portfolio.entity';
import { AssetService } from './service/asset.service';
import { AssetEntity } from './model/asset.entity';
import { AssetBalanceChangeEntity } from './model/asset-balance-change.entity';
import { PortfolioBalanceChangeSetService } from './service/portfolio-balance-change-set.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PortfolioEntity,
      AssetEntity,
      AssetBalanceChangeEntity,
    ]),
  ],
  controllers: [PortfoliosController],
  providers: [PortfolioService, AssetService, PortfolioBalanceChangeSetService],
})
export class PortfolioModule {}
