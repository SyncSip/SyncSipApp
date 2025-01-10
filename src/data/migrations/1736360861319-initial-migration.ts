import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1736360861319 implements MigrationInterface {
  name = 'InitialMigration1736360861319';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "machines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandName" character varying NOT NULL, "model" character varying NOT NULL, CONSTRAINT "PK_7b0817c674bb984650c5274e713" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "grinders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "brandName" character varying NOT NULL, "model" character varying NOT NULL, CONSTRAINT "PK_0aa0640a7e304aa9d27aec1da53" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "beans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roastery" character varying NOT NULL, "bean" character varying NOT NULL, CONSTRAINT "PK_0e4bcd7148091c9a4ee44b61e20" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "time" double precision NOT NULL, "weight" double precision NOT NULL, "dose" double precision NOT NULL, "machineId" uuid NOT NULL, "grinderId" uuid NOT NULL, "beansId" uuid NOT NULL, "graphData" jsonb, "group" character varying NOT NULL, "starred" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40b52561334dcee2a4421b371d7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" ADD CONSTRAINT "FK_2039730be3a660940a9570fd6b4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" ADD CONSTRAINT "FK_a9ef51ac17625f8959533697630" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" ADD CONSTRAINT "FK_6e55f28da53dc883858136826c3" FOREIGN KEY ("grinderId") REFERENCES "grinders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" ADD CONSTRAINT "FK_5d065879cacf185333d14b18881" FOREIGN KEY ("beansId") REFERENCES "beans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shots" DROP CONSTRAINT "FK_5d065879cacf185333d14b18881"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" DROP CONSTRAINT "FK_6e55f28da53dc883858136826c3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" DROP CONSTRAINT "FK_a9ef51ac17625f8959533697630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shots" DROP CONSTRAINT "FK_2039730be3a660940a9570fd6b4"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "shots"`);
    await queryRunner.query(`DROP TABLE "beans"`);
    await queryRunner.query(`DROP TABLE "grinders"`);
    await queryRunner.query(`DROP TABLE "machines"`);
  }
}
