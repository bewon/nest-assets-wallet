import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfoliosController } from './controller/portfolios.controller';
import { PortfolioService } from './service/portfolio.service';
import { PortfolioEntity } from './entity/portfolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity])],
  controllers: [PortfoliosController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
