import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1744112935905 implements MigrationInterface {
    name = 'Migrations1744112935905'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beans" ADD "altitudeInMeters" character varying`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "roastDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "process" character varying`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "genetic" character varying`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "variety" character varying`);
        await queryRunner.query(`ALTER TABLE "beans" ADD "customFields" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "customFields"`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "variety"`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "genetic"`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "process"`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "roastDate"`);
        await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "altitudeInMeters"`);
    }

}
