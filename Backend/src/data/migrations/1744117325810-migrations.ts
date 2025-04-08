import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1744117325810 implements MigrationInterface {
    name = 'Migrations1744117325810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beans" ADD "origin" character varying`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "full"`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "full" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "full"`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "full" character varying`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "origin"`);
    }

}
