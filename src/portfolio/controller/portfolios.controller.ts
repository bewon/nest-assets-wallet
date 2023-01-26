import { Controller, Get, Param } from '@nestjs/common';
import { PortfolioService } from '../service/portfolio.service';

@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.portfolioService.findById(id);
  }
}
