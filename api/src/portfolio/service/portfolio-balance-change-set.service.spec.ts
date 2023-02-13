import { PortfolioBalanceChangeSetService } from './portfolio-balance-change-set.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PortfolioBalanceChangeSetService', () => {
  let service: PortfolioBalanceChangeSetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioBalanceChangeSetService],
    }).compile();

    service = module.get<PortfolioBalanceChangeSetService>(
      PortfolioBalanceChangeSetService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
