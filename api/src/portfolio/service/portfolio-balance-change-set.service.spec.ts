import { PortfolioBalanceChangeSetService } from './portfolio-balance-change-set.service';
import { AssetBalanceChangeEntity } from '../model/asset-balance-change.entity';

const createChange = (
  assetId: string,
  date: string,
  capital: number,
  value: number,
): AssetBalanceChangeEntity => {
  const change = new AssetBalanceChangeEntity(capital, value, date);
  change.assetId = assetId;
  return change;
};

describe('PortfolioBalanceChangeSetService', () => {
  let service: PortfolioBalanceChangeSetService;

  beforeEach(() => {
    service = new PortfolioBalanceChangeSetService();
    // Consistent end date for predictable calculations
    service.endDate = '2022-12-31';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setAllChanges', () => {
    it('should correctly group changes by asset ID', () => {
      const changes = [
        createChange('A1', '2022-01-01', 100, 110),
        createChange('A2', '2022-01-01', 200, 220),
        createChange('A1', '2022-02-01', 110, 120),
      ];
      service.setAllChanges(changes);
      expect(service.groupedAssetChanges['A1']).toHaveLength(2);
      expect(service.groupedAssetChanges['A2']).toHaveLength(1);
      expect(service.groupedAssetChanges['A1'][0].value).toBe(110);
      expect(service.groupedAssetChanges['A1'][1].value).toBe(120);
    });

    it('should create summed portfolio changes chronologically', () => {
      const changes = [
        createChange('A1', '2022-01-01', 100, 110),
        createChange('A2', '2022-01-01', 200, 220), // Same date, should be summed
        createChange('A1', '2022-02-01', 110, 120), // New date
      ];
      service.setAllChanges(changes);
      const portfolioChanges = service.portfolioChanges;
      expect(portfolioChanges).toHaveLength(2);
      expect(portfolioChanges[0].date).toBe('2022-01-01');
      expect(portfolioChanges[0].capital).toBe(300); // 100 + 200
      expect(portfolioChanges[0].value).toBe(330); // 110 + 220
      expect(portfolioChanges[1].date).toBe('2022-02-01');
      expect(portfolioChanges[1].capital).toBe(310); // 110 (A1) + 200 (A2)
      expect(portfolioChanges[1].value).toBe(340); // 120 (A1) + 220 (A2)
    });

    it('should link previous changes correctly', () => {
      const changes = [
        createChange('A1', '2022-01-01', 100, 110),
        createChange('A2', '2022-01-15', 200, 220),
        createChange('A1', '2022-02-01', 110, 125),
      ];
      service.setAllChanges(changes);
      const asset1Changes = service['groupedAssetChanges']['A1'];
      const portfolioChanges = service['portfolioChanges'];

      expect(asset1Changes[0].previousChange).toBeNull();
      expect(asset1Changes[1].previousChange).toBe(asset1Changes[0]);

      expect(portfolioChanges[0].previousChange).toBeNull();
      expect(portfolioChanges[1].previousChange).toBe(portfolioChanges[0]);
      expect(portfolioChanges[2].previousChange).toBe(portfolioChanges[1]);
    });

    it('should handle an empty array of changes', () => {
      service.setAllChanges([]);
      expect(service['groupedAssetChanges']).toEqual({});
      expect(service['portfolioChanges']).toEqual([]);
    });
  });

  describe('Calculations', () => {
    let changes: AssetBalanceChangeEntity[];

    beforeEach(() => {
      changes = [
        // Asset 1: Starts in 2021, has steady growth
        createChange('A1', '2021-12-01', 1000, 1000),
        createChange('A1', '2021-12-31', 1000, 1100), // +10%

        // Asset 2: Starts in 2022, volatile
        createChange('A2', '2022-06-01', 500, 500),
        createChange('A2', '2022-09-01', 500, 450), // -10%
        createChange('A2', '2022-12-01', 600, 540), // capital injection, but value drops further

        // Both assets measured at end of 2022
        createChange('A1', '2022-12-31', 1000, 1210), // +10% from 1100
        createChange('A2', '2022-12-31', 600, 630), // +16.6% from 540
      ];
      service.endDate = '2022-12-31';
      service.setAllChanges(changes);
    });

    describe('prepareCalculationsForPortfolio', () => {
      it('should calculate TWR and changes correctly for various periods', () => {
        const calcs = service.prepareCalculationsForPortfolio();

        // Portfolio TWR is calculated by chaining returns over 5 periods:
        // TWR = (1.1 * 1.0 * 0.96875 * 0.99355 * 1.12195) - 1 = 18.787%
        // This is annualized over 395 days: (1.18787 ^ (365 / 395)) - 1 = 17.24%
        expect(calcs.total?.annualizedTwr).toBeCloseTo(0.1724, 4);
        expect(calcs.total?.profitChange).toBe(240); // (1210-1000) + (630-600)
        expect(calcs.total?.capitalChange).toBe(600); // 1600 (end) - 1000 (start)
        expect(calcs.total?.valueChange).toBe(840); // 1840 (end) - 1000 (start)

        // 1Y period (from 2021-12-31 to 2022-12-31)
        expect(calcs['1Y']?.annualizedTwr).toBeCloseTo(0.0799, 4);
        expect(calcs['1Y']?.profitChange).toBe(140); // 240 (end) - 100 (start of period)
      });
    });

    describe('prepareCalculationsForAssets', () => {
      it('should return calculations for each asset', () => {
        const assetCalcs = service.prepareCalculationsForAssets();

        // Asset 1
        // TWR: ((1100/1000) * (1210/1100)) - 1 = 21%
        // Annualized TWR: (1.21)^(365/395) - 1 = 19.26%
        expect(assetCalcs['A1'].total?.annualizedTwr).toBeCloseTo(0.1926, 4);
        expect(assetCalcs['A1'].total?.profitChange).toBe(210);

        // Asset 2
        // TWR: ((450/500) * ((540-100)/450) * (630/540)) - 1 = 2.667%
        // Annualized TWR: (1.02667)^(365/213) - 1 = 4.61%
        expect(assetCalcs['A2'].total?.annualizedTwr).toBeCloseTo(0.0461, 4);
        expect(assetCalcs['A2'].total?.profitChange).toBe(30);
      });
    });

    describe('prepareHistoryForPortfolio', () => {
      it('should generate correct history for the portfolio', () => {
        const history = service.prepareHistoryForPortfolio();
        expect(history).toHaveLength(6);

        // Check the last entry
        const lastEntry = history[history.length - 1];
        expect(lastEntry.change.date).toBe('2022-12-31');
        expect(lastEntry.change.value).toBe(1840);
        // see calculations above
        expect(lastEntry.periodCalculation.total?.annualizedTwr).toBeCloseTo(
          0.1724, 4
        );
      });
    });

    describe('prepareHistoryForAssets', () => {
      it('should generate correct history for each asset', () => {
        const history = service.prepareHistoryForAssets();
        expect(history['A1']).toHaveLength(3);
        expect(history['A2']).toHaveLength(4);

        // Check last entry for A1
        const lastA1 = history['A1'][history['A1'].length - 1];
        expect(lastA1.change.date).toBe('2022-12-31');
        expect(lastA1.change.value).toBe(1210);
        // see calculations above
        expect(lastA1.periodCalculation.total?.annualizedTwr).toBeCloseTo(
          0.1926, 4
        );
      });
    });
  });
});
