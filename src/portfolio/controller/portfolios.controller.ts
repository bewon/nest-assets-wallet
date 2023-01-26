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
    return this.portfolioService.prepareAssetsSnapshot(
      portfolio,
      date != null ? new Date(date) : undefined,
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
