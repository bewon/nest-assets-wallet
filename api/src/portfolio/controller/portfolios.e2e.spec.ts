import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { PortfolioModule } from '../portfolio.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  entities,
  FixturesService,
  testDataSourceConfig,
} from '../fixtures/fixtures-service';
import { AppAuthGuard } from '../../auth/app-auth.guard.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../../auth/auth.module';
import * as fs from 'fs';

describe('Portfolios', () => {
  let app: INestApplication;
  let fixturesService: FixturesService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDataSourceConfig),
        TypeOrmModule.forFeature(entities),
        PortfolioModule,
        AuthModule,
      ],
      providers: [
        FixturesService,
        {
          provide: APP_GUARD,
          useExisting: AppAuthGuard,
        },
        AppAuthGuard,
      ],
    })
      .overrideProvider(AppAuthGuard)
      .useValue({
        canActivate: async (context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          const user = await fixturesService.getUser();
          request.user = {
            id: user.id,
            email: user.email,
          } as Express.User;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    fixturesService = moduleRef.get<FixturesService>(FixturesService);
    await app.init();
  });

  it(`/GET /portfolios/default`, async () => {
    await fixturesService.loadFixtures();
    const portfolio = await fixturesService.getPortfolio();
    // has portfolio id key
    const response = await request(app.getHttpServer())
      .get('/portfolios/default')
      .expect(200);
    expect(response.body.id).toBe(portfolio.id);
  });

  describe(`/GET /portfolios/:id/assets-snapshot`, () => {
    beforeEach(async () => {
      await fixturesService.loadFixtures();
    });

    it(`return json with sample assets-snapshot result for sample portfolio`, async () => {
      const assetsSnapshot = JSON.parse(
        fs.readFileSync('src/portfolio/fixtures/assets-snapshot.json', 'utf8'),
      );
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/assets-snapshot')
        .expect(200);
      expect(response.body).toEqual(assetsSnapshot);
    });

    it('return json with sample assets-snapshot result for sample portfolio for given date', async () => {
      const assetsSnapshot = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/assets-snapshot-for-2015-01-01.json',
          'utf8',
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/assets-snapshot')
        .query({ date: '2015-01-01' })
        .expect(200);
      expect(response.body).toEqual(assetsSnapshot);
    });
  });

  describe(`/GET /portfolios/:id/performance-statistics`, () => {
    beforeEach(async () => {
      await fixturesService.loadFixtures();
    });

    it('return json with newest performance-statistics result for sample portfolio', async () => {
      const performanceStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics.json',
          'utf8',
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/performance-statistics')
        .query({ date: '2016-03-31' })
        .expect(200);
      expect(response.body).toEqual(performanceStatistics);
    });

    it('return json with performance-statistics result for sample portfolio for given date', async () => {
      const performanceStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics-for-2015-01-01.json',
          'utf8',
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/performance-statistics')
        .query({ date: '2015-01-01' })
        .expect(200);
      expect(response.body.portfolio.total).toEqual(
        performanceStatistics.portfolio.total,
      );
    });
  });

  describe('/GET /portfolios/:id/group-performance', () => {
    it('return json with performance_statistics result for sample portfolio and group', async () => {
      const groupPerformance = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/performance-statistics-for-risky-group.json',
          'utf8',
        ),
      );
      delete groupPerformance.assets;
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/group-performance')
        .query({ date: '2016-03-31', group: 'Risky' })
        .expect(200);
      expect(response.body).toEqual(groupPerformance);
    });
  });

  describe('/GET /portfolios/:id/history-statistics', () => {
    it('return json with newest history-statistics result for sample portfolio', async () => {
      const historyStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/history-statistics.json',
          'utf8',
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/history-statistics')
        .query({ date: '2016-03-31', withAssets: true })
        .expect(200);
      expect(response.body).toEqual(historyStatistics);
    });

    it('return json with newest history-statistics result for risky group', async () => {
      const historyStatistics = JSON.parse(
        fs.readFileSync(
          'src/portfolio/fixtures/history-statistics-for-risky-group.json',
          'utf8',
        ),
      );
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/history-statistics')
        .query({ date: '2016-03-31', group: 'Risky', withAssets: true })
        .expect(200);
      expect(response.body).toEqual(historyStatistics);
    });

    it('return json with history_statistics only for portfolio by default', async () => {
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/history-statistics')
        .expect(200);
      expect(Object.keys(response.body)).toEqual(['portfolio']);
    });
  });

  describe('/GET /portfolios/:id/groups', () => {
    it('return proper groups for portfolio', async () => {
      const response = await request(app.getHttpServer())
        .get('/portfolios/default/groups')
        .expect(200);
      expect(response.body).toEqual(['Safe', 'Risky', 'Other']);
    });
  });
});
