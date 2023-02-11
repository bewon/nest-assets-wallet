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
  AnnualizedCalculation,
  PeriodHistory,
  periods,
  PortfolioBalanceChangeSetService,
} from './portfolio-balance-change-set.service';
import { defaultDateFormat } from '../../app.module';
import * as dayjs from 'dayjs';

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
  ): Promise<{
    portfolio: Record<string, AnnualizedCalculation | undefined>;
    assets?: {
      id: string;
      annualizedTwr: Record<string, number | undefined>;
    }[];
  }> {
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
  ): Promise<{
    portfolio: (string | number | null)[][];
    assets?: Record<string, any>[];
  }> {
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
      this.portfolioBalanceChangeSetService.prepareCalculationsForAssets(false);
    return Object.entries(calculations).map(([assetId, calculation]) => {
      const result: {
        id: string;
        annualizedTwr: Record<string, number | undefined>;
      } = { id: assetId, annualizedTwr: {} };
      Object.entries(calculation).forEach(([period, periodCalculation]) => {
        result.annualizedTwr[period] =
          round(periodCalculation?.annualizedTwr, 4) ?? undefined;
      });
      return result;
    });
  }

  // prepare portfolio changes summary from changes Set
  private preparePortfolioPerformance(): Record<
    string,
    AnnualizedCalculation | undefined
  > {
    const calculations =
      this.portfolioBalanceChangeSetService.prepareCalculationsForPortfolio(
        true,
      );
    const result: ReturnType<typeof this.preparePortfolioPerformance> = {};
    Object.entries(calculations).forEach(([period, calculation]) => {
      if (calculation == null) {
        result[period] = undefined;
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
        record.change.date,
        record.change.capital,
        record.change.value,
        record.change.getProfit(),
        round(record?.periodCalculation?.total?.annualizedTwr, 4) ?? null,
      ],
      ...Object.keys(periods).map(
        (period) =>
          round(record?.periodCalculation?.[period]?.annualizedTwr, 4) ?? null,
      ),
    ]);
  }
}
