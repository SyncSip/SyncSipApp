import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1744113327434 implements MigrationInterface {
  name = 'Migrations1744113327434';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "beans" ADD "origin" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "origin"`);
  }
}
