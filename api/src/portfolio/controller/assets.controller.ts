import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { PortfolioService } from '../service/portfolio.service';
import { Request as ExpressRequest } from 'express';
import { UpdateAssetDto } from '../dto/update-asset.dto';

@Controller()
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
    try {
      return this.assetService.create(portfolioId, createAssetDto);
    } catch (error) {
      throw this.updateError(error);
    }
  }

  @Post('assets/:assetId')
  async update(
    @Request() req: ExpressRequest,
    @Param('assetId') assetId: string,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    try {
      return this.assetService.update(asset, updateAssetDto);
    } catch (error) {
      throw this.updateError(error);
    }
  }

  @Delete('assets/:assetId')
  async remove(
    @Request() req: ExpressRequest,
    @Param('assetId') assetId: string,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    try {
      await this.assetService.remove(asset);
    } catch (error) {
      throw this.updateError(error);
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

  private updateError(error: Error) {
    if (error instanceof UnprocessableEntityException) {
      return new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else {
      return error;
    }
  }
}
