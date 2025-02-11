import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1739280377334 implements MigrationInterface {
    name = 'Migrations1739280377334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
    }

}
