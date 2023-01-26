import { MigrationInterface, QueryRunner } from 'typeorm';

export class asset1674747849893 implements MigrationInterface {
  name = 'asset1674747849893';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "asset" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying, "group" character varying, "portfolioId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "asset_balance_change" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "assetId" uuid NOT NULL, "capital" numeric(17,2) NOT NULL, "value" numeric(17,2) NOT NULL, "date" date NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_491d06c36b79b5df1a35828a502" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" ADD CONSTRAINT "FK_f6195d52b70007aeb2924a450c9" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_balance_change" ADD CONSTRAINT "FK_455965ad3af508214a637d3e54c" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset_balance_change" DROP CONSTRAINT "FK_455965ad3af508214a637d3e54c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" DROP CONSTRAINT "FK_f6195d52b70007aeb2924a450c9"`,
    );
    await queryRunner.query(`DROP TABLE "asset_balance_change"`);
    await queryRunner.query(`DROP TABLE "asset"`);
  }
}
