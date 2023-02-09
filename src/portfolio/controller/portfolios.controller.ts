import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { PortfolioService } from '../service/portfolio.service';
import { AssetService } from '../service/asset.service';
import { defaultPortfolioId } from '../model/portfolio.entity';

@Controller('portfolios')
export class PortfoliosController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly assetService: AssetService,
  ) {}

  @Get(':id')
  async findById(@Request() req: ExpressRequest, @Param('id') id: string) {
    return await this.getPortfolio(req.user?.id, id);
  }

  @Get(':id/assets-snapshot')
  async findAssetsSnapshot(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Param('date') date?: string,
  ) {
    const portfolio = await this.getPortfolio(req.user?.id, id);
    return this.portfolioService.prepareAssetsSnapshot(portfolio, date);
  }

  @Get(':id/performance-statistics')
  async findPerformanceStatistics(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Param('date') date?: string,
  ) {
    const portfolio = await this.getPortfolio(req.user?.id, id);
    return this.portfolioService.preparePerformanceStatistics(portfolio, date);
  }

  @Get(':id/group-performance')
  async findGroupPerformance(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Param('date') date?: string,
    @Param('group') group?: string,
  ) {
    const portfolio = await this.getPortfolio(req.user?.id, id);
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
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Param('group') group?: string,
    @Param('withAssets') withAssets?: string,
  ) {
    const portfolio = await this.getPortfolio(req.user?.id, id);
    return this.portfolioService.prepareHistoryStatistics(
      portfolio,
      group,
      withAssets === 'true',
    );
  }

  @Get(':id/groups')
  async findGroups(@Request() req: ExpressRequest, @Param('id') id: string) {
    const portfolio = await this.getPortfolio(req.user?.id, id);
    return this.assetService.findGroupsForPortfolio(portfolio);
  }

  private async getPortfolio(userId: string | undefined, portfolioId: string) {
    if (userId != null) {
      const portfolio =
        portfolioId === defaultPortfolioId
          ? await this.portfolioService.findForUserId(userId)
          : await this.portfolioService.findById(portfolioId);
      if (portfolio == null || portfolio.userId !== userId) {
        throw new NotFoundException();
      }
      return portfolio;
    } else {
      throw new UnauthorizedException();
    }
  }
}
