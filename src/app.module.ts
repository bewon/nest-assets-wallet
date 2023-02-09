import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ConfigModule } from '@nestjs/config';
import { dataSourceConfig } from './data-source';
import { AuthModule } from './auth/auth.module';

export const defaultDateFormat = 'YYYY-MM-DD';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(dataSourceConfig),
    PortfolioModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}
