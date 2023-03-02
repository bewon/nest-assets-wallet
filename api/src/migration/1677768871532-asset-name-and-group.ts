import { MigrationInterface, QueryRunner } from 'typeorm';

export class assetNameAndGroup1677768871532 implements MigrationInterface {
  name = 'assetNameAndGroup1677768871532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset" ALTER COLUMN "name" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "asset" SET "group" = '?' WHERE "group" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" ALTER COLUMN "group" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset" ALTER COLUMN "group" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset" ALTER COLUMN "name" DROP NOT NULL`,
    );
  }
}
