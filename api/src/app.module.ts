import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ConfigModule } from '@nestjs/config';
import { dataSourceConfig } from './data-source';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AppAuthGuard } from './auth/app-auth.guard.service';

export const defaultDateFormat = 'YYYY-MM-DD';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceConfig),
    PortfolioModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: AppAuthGuard,
    },
    AppAuthGuard,
  ],
})
export class AppModule {}
