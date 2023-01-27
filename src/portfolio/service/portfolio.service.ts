import { Injectable } from '@nestjs/common';
import { PortfolioEntity } from '../model/portfolio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssetSnapshotDto } from '../dto/asset-snapshot.dto';
import { AssetService } from './asset.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
    private readonly assetService: AssetService,
  ) {}

  findById(id: string): Promise<PortfolioEntity | null> {
    return this.portfolioRepository.findOneBy({ id });
  }

  prepareAssetsSnapshot(
    portfolio: PortfolioEntity,
    date?: Date,
  ): Promise<AssetSnapshotDto[]> {
    const promises = portfolio.assets.map((asset) =>
      this.assetService.prepareAssetSnapshot(asset, date),
    );
    return Promise.all(promises);
  }
}
