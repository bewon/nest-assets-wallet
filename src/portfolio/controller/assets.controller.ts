import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { PortfolioService } from '../service/portfolio.service';
import { Request as ExpressRequest } from 'express';

@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetService: AssetService,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Post('portfolios/:portfolioId/assets')
  async create(
    @Request() req: ExpressRequest,
    @Param('portfolioId') portfolioId: string,
    @Body() createAssetDto: CreateAssetDto,
  ) {
    await this.portfolioService.getAndCheckPortfolioForUser(
      req.user?.id,
      portfolioId,
    );
    return this.assetService.create(portfolioId, createAssetDto);
  }
}
