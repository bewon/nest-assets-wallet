import { Body, Controller, Post } from '@nestjs/common';
import { AssetService } from '../service/asset.service';
import { CreateAssetDto } from '../dto/create-asset.dto';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetService: AssetService) {}

  @Post()
  async create(@Body() createAssetDto: CreateAssetDto) {
    // return this.assetService.create(createAssetDto);
  }
}
