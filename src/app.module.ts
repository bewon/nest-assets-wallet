import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'assets_wallet',
      password: 'awd9571',
      database: 'assets_wallet',
      entities: ['/**/*.entity{.ts,.js}'],
      synchronize: false,
      migrationsTableName: 'orm_migration',
      migrations: ['dist/migration/*.[tj]s'],
    }),
    PortfolioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
