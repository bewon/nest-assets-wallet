import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';

const dev = process.env.NODE_ENV === 'development';

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'assets_wallet',
  password: 'awd9571',
  database: 'assets_wallet',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migration/*.[tj]s'],
  synchronize: false,
  logging: dev,
  migrationsTableName: 'orm_migration',
};

export const AppDataSource = new DataSource(dataSourceConfig);
