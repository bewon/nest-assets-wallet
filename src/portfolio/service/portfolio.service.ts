import { Injectable } from '@nestjs/common';
import { PortfolioEntity } from '../model/portfolio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { AssetService } from './asset.service';
import {
  AnnualizedCalculation,
  PortfolioBalanceChangeSetService,
} from './portfolio-balance-change-set.service';

const round = (value: number | null, precision: number): number | null => {
  if (value == null) {
    return null;
  }
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
};

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    private readonly assetService: AssetService,
    private readonly portfolioBalanceChangeSetService: PortfolioBalanceChangeSetService,
  ) {}

  findById(id: string): Promise<PortfolioEntity | null> {
    return this.portfolioRepository.findOneBy({ id });
  }

  // Prepare snapshot for all portfolio assets
  prepareAssetsSnapshot(
    portfolio: PortfolioEntity,
    date?: Date,
  ): Promise<AssetSnapshotDto[]> {
    const promises = portfolio.assets.map((asset) =>
      this.assetService.prepareAssetSnapshot(asset, date),
    );
    return Promise.all(promises);
  }

  // prepare summary of portfolio and it's asset changes
  //   def prepare_performance_statistics(date=nil, group=nil, with_assets=true)
  // preparePerformanceStatistics(
  //   date?: Date,
  //   group?: string,
  //   withAssets?: boolean,
  // ): Promise<AssetSnapshotDto[]> {}

  // prepare assets changes summary from changes Set
  private prepareAssetsPerformance() {
    const calculations =
      this.portfolioBalanceChangeSetService.prepareCalculationsForAssets(false);
    return Object.entries(calculations).map(([assetId, calculation]) => {
      const result: {
        id: string;
        annualizedTwr: Record<string, number | null>;
      } = { id: assetId, annualizedTwr: {} };
      Object.entries(calculation).forEach(([period, periodCalculation]) => {
        result.annualizedTwr[period] = round(
          periodCalculation?.annualizedTwr ?? null,
          4,
        );
      });
      return result;
    });
  }

  // # prepare portfolio changes summary from changes Set
  //   def prepare_portfolio_performance
  private preparePortfolioPerformance(): Record<
    string,
    AnnualizedCalculation | null
  > {
    const calculations =
      this.portfolioBalanceChangeSetService.prepareCalculationsForPortfolio(
        true,
      );
    const result: ReturnType<typeof this.preparePortfolioPerformance> = {};
    Object.entries(calculations).forEach(([period, calculation]) => {
      if (calculation == null) {
        result[period] = null;
      } else {
        result[period] = {
          annualizedTwr: round(calculation.annualizedTwr, 4),
          capitalChange: calculation.capitalChange,
          profitChange: calculation.profitChange,
        };
      }
    });
    return result;
  }

  // # transform history statistics generated from changes Set to flatten one
  //   def transform_history_statistics(stats)
  //   private transformHistoryStatistics(stats: any) {
}
