import { Injectable } from '@nestjs/common';
import { PortfolioEntity } from '../model/portfolio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { AssetService } from './asset.service';
import {
  AnnualizedCalculation,
  PeriodHistory,
  periods,
  PortfolioBalanceChangeSetService,
} from './portfolio-balance-change-set.service';
import { defaultDateFormat } from '../../app.module';
import * as dayjs from 'dayjs';

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
  ): Promise<{
    portfolio: Record<string, AnnualizedCalculation | null>;
    assets?: { id: string; annualizedTwr: Record<string, number | null> }[];
  }> {
    const changes = await this.assetService.findPortfolioChanges(
      portfolio,
      group,
      date,
    );
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
  ): Promise<{
    portfolio: (string | number | null)[][];
    assets?: Record<string, any>[];
  }> {
    const changes = await this.assetService.findPortfolioChanges(
      portfolio,
      group,
    );
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

  // prepare portfolio changes summary from changes Set
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

  // prepare history/statistics of asset changes from changes Set
  private async prepareAssetsHistoryStatistics() {
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
  private transformHistoryStatistics(calculations: PeriodHistory) {
    return calculations.map((record) => [
      ...[
        record?.change?.date?.toString(),
        record?.change?.capital,
        record?.change?.value,
        record?.change?.getProfit(),
        round(record?.periodCalculation?.total?.annualizedTwr ?? null, 4),
      ],
      ...Object.keys(periods).map((period) =>
        round(record?.periodCalculation?.[period]?.annualizedTwr, 4),
      ),
    ]);
  }
}
