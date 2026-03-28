import { MigrationInterface, QueryRunner } from 'typeorm';

export class TargetGroupWeight1774730306191 implements MigrationInterface {
  name = 'TargetGroupWeight1774730306191';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset" ADD "targetGroupWeight" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset" DROP COLUMN "targetGroupWeight"`,
    );
  }
}
