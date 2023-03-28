import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { defaultPortfolioId, PortfolioEntity } from '../model/portfolio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { AssetService } from './asset.service';
import {
  PeriodCalculation,
  PeriodHistory,
  periods,
  PortfolioBalanceChangeSetService,
} from './portfolio-balance-change-set.service';
import { defaultDateFormat } from '../../app.module';
import * as dayjs from 'dayjs';
import {
  AnnualizedCalculation,
  AssetHistoryStatistics,
  HistoryStatistics,
  PortfolioPerformanceStatistics,
  TransformedHistoryStatistics,
} from '../types';

const round = (
  value: number | undefined,
  precision: number,
): number | undefined => {
  if (value == null) {
    return undefined;
  }
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
};

@Injectable()
export class PortfolioService {
  private portfolioBalanceChangeSetService: PortfolioBalanceChangeSetService;
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    private readonly assetService: AssetService,
  ) {}

  findById(id: string): Promise<PortfolioEntity | null> {
    return this.portfolioRepository.findOneBy({ id });
  }

  findForUserId(userId: string): Promise<PortfolioEntity | null> {
    return this.portfolioRepository.findOneBy({ userId });
  }

  // Prepare snapshot for all portfolio assets
  async prepareAssetsSnapshot(
    portfolio: PortfolioEntity,
    date?: string,
  ): Promise<AssetSnapshotDto[]> {
    const assets = await this.assetService.findAssetsForPortfolio(portfolio);
    const promises = assets.map((asset) =>
      this.assetService.prepareAssetSnapshot(asset, date),
    );
    const snapshots = await Promise.all(promises);
    return snapshots.filter(
      (snapshot) => snapshot != null,
    ) as AssetSnapshotDto[];
  }

  // prepare summary of portfolio and it's asset changes
  async preparePerformanceStatistics(
    portfolio: PortfolioEntity,
    date?: string,
    group?: string,
    withAssets = true,
  ): Promise<PortfolioPerformanceStatistics> {
    const changes = await this.assetService.findPortfolioChanges(
      portfolio,
      group,
      date,
    );
    this.portfolioBalanceChangeSetService =
      new PortfolioBalanceChangeSetService();
    this.portfolioBalanceChangeSetService.setAllChanges(changes);
    this.portfolioBalanceChangeSetService.endDate =
      date ?? dayjs().format(defaultDateFormat);
    return {
      portfolio: this.preparePortfolioPerformance(),
      assets: withAssets ? this.prepareAssetsPerformance() : undefined,
    };
  }

  // prepare history/statistics of portfolio and it's asset changes
  async prepareHistoryStatistics(
    portfolio: PortfolioEntity,
    group?: string,
    withAssets?: boolean,
  ): Promise<HistoryStatistics> {
    const changes = await this.assetService.findPortfolioChanges(
      portfolio,
      group,
    );
    this.portfolioBalanceChangeSetService =
      new PortfolioBalanceChangeSetService();
    this.portfolioBalanceChangeSetService.setAllChanges(changes);
    this.portfolioBalanceChangeSetService.endDate =
      dayjs().format(defaultDateFormat);

    return {
      portfolio: this.transformHistoryStatistics(
        this.portfolioBalanceChangeSetService.prepareHistoryForPortfolio(),
      ),
      assets: withAssets
        ? await this.prepareAssetsHistoryStatistics()
        : undefined,
    };
  }

  async getAndCheckPortfolioForUser(
    userId: string | undefined,
    portfolioId: string,
  ) {
    if (userId != null) {
      const portfolio =
        portfolioId === defaultPortfolioId
          ? await this.findForUserId(userId)
          : await this.findById(portfolioId);
      if (portfolio == null || portfolio.userId !== userId) {
        throw new NotFoundException();
      }
      return portfolio;
    } else {
      throw new UnauthorizedException();
    }
  }

  // prepare assets changes summary from changes Set
  private prepareAssetsPerformance() {
    const calculations =
      this.portfolioBalanceChangeSetService.prepareCalculationsForAssets(true);
    return Object.entries(calculations).map(([assetId, calculation]) => {
      return { id: assetId, performance: this.preparePerformance(calculation) };
    });
  }

  // prepare portfolio changes summary from changes Set
  private preparePortfolioPerformance() {
    const calculations =
      this.portfolioBalanceChangeSetService.prepareCalculationsForPortfolio(
        true,
      );
    return this.preparePerformance(calculations);
  }

  private preparePerformance(calculations: PeriodCalculation) {
    const result: Record<string, AnnualizedCalculation | undefined> = {};
    Object.entries(calculations).forEach(([period, calculation]) => {
      if (calculation == null) {
        result[period] = undefined;
      } else {
        result[period] = {
          annualizedTwr: round(calculation.annualizedTwr, 4),
          capitalChange: calculation.capitalChange,
          valueChange: calculation.valueChange,
          profitChange: calculation.profitChange,
        };
      }
    });
    return result;
  }

  // prepare history/statistics of asset changes from changes Set
  private async prepareAssetsHistoryStatistics(): Promise<
    AssetHistoryStatistics[]
  > {
    const entries = Object.entries(
      this.portfolioBalanceChangeSetService.prepareHistoryForAssets(),
    ).map(async ([assetId, calculations]) => {
      const lastCalculation = calculations[calculations.length - 1];
      const asset = await this.assetService.findById(assetId);
      return {
        id: assetId,
        name: asset?.name,
        group: asset?.group,
        values: this.transformHistoryStatistics(calculations),
        value: lastCalculation?.change?.value,
        capital: lastCalculation?.change?.capital,
      };
    });
    return Promise.all(entries);
  }

  // transform history statistics generated from changes Set to flatten one
  private transformHistoryStatistics(
    calculations: PeriodHistory,
  ): TransformedHistoryStatistics {
    return calculations.map((record) => {
      const baseValues: [string, number, number, number, number | null] = [
        record.change.date,
        record.change.capital,
        record.change.value,
        record.change.getProfit(),
        round(record?.periodCalculation?.total?.annualizedTwr, 4) ?? null,
      ];
      const periodValues = Object.keys(periods).map(
        (period) =>
          round(record?.periodCalculation?.[period]?.annualizedTwr, 4) ?? null,
      );
      return [...baseValues, ...periodValues];
    });
  }
}
