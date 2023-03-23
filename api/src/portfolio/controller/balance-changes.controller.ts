import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  UnprocessableEntityException,
  Request,
  Post,
  Body,
  Delete,
  Query,
} from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { PortfolioService } from '../service/portfolio.service';
import { Request as ExpressRequest } from 'express';
import { CreateBalanceChangeDto } from '../dto/create-balance-change.dto';
import { UpdateBalanceChangeDto } from '../dto/update-balance-change.dto';

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
    @Query('year') year?: string,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    if (year != null) {
      return this.assetService.findChangesInGivenYear(asset, parseInt(year));
    } else {
      return this.assetService.findAllChanges(asset);
    }
  }

  @Post()
  async create(
    @Request() req: ExpressRequest,
    @Param('assetId') assetId: string,
    @Body() createBalanceChangeDto: CreateBalanceChangeDto,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    try {
      return this.assetService.createChange(asset, createBalanceChangeDto);
    } catch (error) {
      throw this.updateError(error);
    }
  }

  @Post(':id')
  async update(
    @Request() req: ExpressRequest,
    @Param('assetId') assetId: string,
    @Param('id') id: string,
    @Body() updateBalanceChangeDto: UpdateBalanceChangeDto,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    try {
      return this.assetService.updateChange(asset, id, updateBalanceChangeDto);
    } catch (error) {
      throw this.updateError(error);
    }
  }

  @Delete(':id')
  async remove(
    @Request() req: ExpressRequest,
    @Param('assetId') assetId: string,
    @Param('id') id: string,
  ) {
    const asset = await this.getAndCheckAssetForUser(req.user?.id, assetId);
    try {
      await this.assetService.removeChange(asset, id);
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
