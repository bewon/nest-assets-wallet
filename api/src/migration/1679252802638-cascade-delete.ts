import { MigrationInterface, QueryRunner } from 'typeorm';

export class cascadeDelete1679252802638 implements MigrationInterface {
  name = 'cascadeDelete1679252802638';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset_balance_change" DROP CONSTRAINT "FK_455965ad3af508214a637d3e54c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_balance_change" ADD CONSTRAINT "FK_455965ad3af508214a637d3e54c" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "asset_balance_change" DROP CONSTRAINT "FK_455965ad3af508214a637d3e54c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "asset_balance_change" ADD CONSTRAINT "FK_455965ad3af508214a637d3e54c" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
