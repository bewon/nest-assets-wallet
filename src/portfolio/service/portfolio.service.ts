import { Injectable } from '@nestjs/common';
import { PortfolioEntity } from '../entity/portfolio.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private readonly portfolioRepository: Repository<PortfolioEntity>,
  ) {}

  findById(id: string): Promise<PortfolioEntity> {
    return this.portfolioRepository.findOneBy({ id });
  }
}
