import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1736444889947 implements MigrationInterface {
    name = 'Migrations1736444889947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shots" DROP CONSTRAINT "FK_a9ef51ac17625f8959533697630"`);
        await queryRunner.query(`ALTER TABLE "shots" DROP CONSTRAINT "FK_6e55f28da53dc883858136826c3"`);
        await queryRunner.query(`ALTER TABLE "shots" DROP CONSTRAINT "FK_5d065879cacf185333d14b18881"`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "machineId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "grinderId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "beansId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "group" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ADD CONSTRAINT "FK_a9ef51ac17625f8959533697630" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shots" ADD CONSTRAINT "FK_6e55f28da53dc883858136826c3" FOREIGN KEY ("grinderId") REFERENCES "grinders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shots" ADD CONSTRAINT "FK_5d065879cacf185333d14b18881" FOREIGN KEY ("beansId") REFERENCES "beans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shots" DROP CONSTRAINT "FK_5d065879cacf185333d14b18881"`);
        await queryRunner.query(`ALTER TABLE "shots" DROP CONSTRAINT "FK_6e55f28da53dc883858136826c3"`);
        await queryRunner.query(`ALTER TABLE "shots" DROP CONSTRAINT "FK_a9ef51ac17625f8959533697630"`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "group" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "beansId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "grinderId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ALTER COLUMN "machineId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "shots" ADD CONSTRAINT "FK_5d065879cacf185333d14b18881" FOREIGN KEY ("beansId") REFERENCES "beans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shots" ADD CONSTRAINT "FK_6e55f28da53dc883858136826c3" FOREIGN KEY ("grinderId") REFERENCES "grinders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shots" ADD CONSTRAINT "FK_a9ef51ac17625f8959533697630" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
