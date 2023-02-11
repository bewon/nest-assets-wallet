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
    await fixturesService.loadFixtures();
    await app.init();
  });

  it(`/GET /portfolios/default/assets-snapshot`, async () => {
    const assetsSnapshot = JSON.parse(
      fs.readFileSync('src/portfolio/fixtures/assets-snapshot.json', 'utf8'),
    );
    return request(app.getHttpServer())
      .get('/portfolios/default/assets-snapshot')
      .expect(200)
      .expect(assetsSnapshot);
  });
});
