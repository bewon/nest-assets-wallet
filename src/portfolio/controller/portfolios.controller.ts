import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from '../service/portfolio.service';
import { AssetService } from '../service/asset.service';

@Controller('portfolios')
export class PortfoliosController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly assetService: AssetService,
  ) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.portfolioService.findById(id);
  }

  @Get(':id/assets-snapshot')
  async findAssetsSnapshot(
    @Param('id') id: string,
    @Param('date') date?: string,
  ) {
    const portfolio = await this.portfolioService.findById(id);
    if (portfolio == null) {
      return null;
    }
    return this.portfolioService.prepareAssetsSnapshot(portfolio, date);
  }

  @Get(':id/performance-statistics')
  async findPerformanceStatistics(
    @Param('id') id: string,
    @Param('date') date?: string,
  ) {
    const portfolio = await this.portfolioService.findById(id);
    if (portfolio == null) {
      return null;
    }
    return this.portfolioService.preparePerformanceStatistics(portfolio, date);
  }

  @Get(':id/group-performance')
  async findGroupPerformance(
    @Param('id') id: string,
    @Param('date') date?: string,
    @Param('group') group?: string,
  ) {
    const portfolio = await this.portfolioService.findById(id);
    if (portfolio == null) {
      return null;
    }
    return this.portfolioService.preparePerformanceStatistics(
      portfolio,
      date,
      group,
      false,
    );
  }

  // def history_statistics
  @Get(':id/history-statistics')
  async findHistoryStatistics(
    @Param('id') id: string,
    @Param('group') group?: string,
    @Param('withAssets') withAssets?: string,
  ) {
    const portfolio = await this.portfolioService.findById(id);
    if (portfolio == null) {
      return null;
    }
    return this.portfolioService.prepareHistoryStatistics(
      portfolio,
      group,
      withAssets === 'true',
    );
  }

  @Get(':id/groups')
  async findGroups(@Param('id') id: string) {
    const portfolio = await this.portfolioService.findById(id);
    if (portfolio == null) {
      return null;
    }
    return this.assetService.findGroupsForPortfolio(portfolio);
  }
}
