import { MigrationInterface, QueryRunner } from 'typeorm';

export class userInPortfolio1675963521101 implements MigrationInterface {
  name = 'userInPortfolio1675963521101';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "portfolio" ADD "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "portfolio" ADD CONSTRAINT "UQ_9d041c43c782a9135df1388ae16" UNIQUE ("userId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio" ADD CONSTRAINT "FK_9d041c43c782a9135df1388ae16" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portfolio" DROP CONSTRAINT "FK_9d041c43c782a9135df1388ae16"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portfolio" DROP CONSTRAINT "UQ_9d041c43c782a9135df1388ae16"`,
    );
    await queryRunner.query(`ALTER TABLE "portfolio" DROP COLUMN "userId"`);
  }
}
