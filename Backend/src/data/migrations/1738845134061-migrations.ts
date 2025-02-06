import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1738845134061 implements MigrationInterface {
    name = 'Migrations1738845134061'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shots" ADD "customFields" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shots" DROP COLUMN "customFields"`);
    }

}
