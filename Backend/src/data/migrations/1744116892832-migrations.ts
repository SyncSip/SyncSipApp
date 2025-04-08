import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1744116892832 implements MigrationInterface {
    name = 'Migrations1744116892832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beans" RENAME COLUMN "origin" TO "full"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "beans" RENAME COLUMN "full" TO "origin"`);
    }

}
