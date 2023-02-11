import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UnprocessableEntityException,
} from '@nestjs/common';
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
    try {
      return this.assetService.create(portfolioId, createAssetDto);
    } catch (error) {
      this.reThrowException(error);
    }
  }

  private reThrowException(error: Error) {
    if (error instanceof UnprocessableEntityException) {
      throw new HttpException(error.message, HttpStatus.UNPROCESSABLE_ENTITY);
    } else {
      throw error;
    }
  }
}
