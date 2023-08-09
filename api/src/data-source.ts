import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source/DataSourceOptions';
import 'dotenv/config';

const dev = process.env.NODE_ENV === 'development';

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migration/*.[tj]s'],
  synchronize: false,
  logging: dev,
  migrationsTableName: 'orm_migration',
  ssl: { rejectUnauthorized: false },
};

export const AppDataSource = new DataSource(dataSourceConfig);
