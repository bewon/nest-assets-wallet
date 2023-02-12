import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  UnprocessableEntityException,
  Request,
} from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { PortfolioService } from '../service/portfolio.service';
import { Request as ExpressRequest } from 'express';

@Controller('assets/:assetId/balance-changes')
export class BalanceChangesController {
  constructor(
    private readonly assetService: AssetService,
    private readonly portfolioService: PortfolioService,
  ) {}

  @Get()
  async findAll(
    @Request() req: ExpressRequest,
    @Param('assetId') assetId: string,
    @Param('year') year?: string,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    if (year != null) {
      return this.assetService.findChangesInGivenYear(asset, parseInt(year));
    } else {
      return this.assetService.findAllChanges(asset);
    }
  }

  private async getAndCheckAssetForUser(
    userId: string | undefined,
    assetId: string,
  ) {
    const asset = await this.assetService.findById(assetId);
    if (asset == null || asset.portfolioId == null) {
      throw new NotFoundException();
    }
    await this.portfolioService.getAndCheckPortfolioForUser(
      userId,
      asset.portfolioId,
    );
    return asset;
  }

  private reThrowException(error: Error) {
    if (error instanceof UnprocessableEntityException) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else {
      throw error;
    }
  }
}
