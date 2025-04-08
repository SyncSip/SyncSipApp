import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1736437938150 implements MigrationInterface {
  name = 'Migrations1736437938150';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First add the columns without NOT NULL constraint
    await queryRunner.query(`ALTER TABLE "machines" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "grinders" ADD "userId" uuid`);
    await queryRunner.query(`ALTER TABLE "beans" ADD "userId" uuid`);

    // Update tables with random user IDs
    await queryRunner.query(`
            UPDATE "machines" 
            SET "userId" = (
                SELECT id FROM "users" 
                ORDER BY RANDOM() 
                LIMIT 1
            )
            WHERE "userId" IS NULL
        `);

    await queryRunner.query(`
            UPDATE "grinders" 
            SET "userId" = (
                SELECT id FROM "users" 
                ORDER BY RANDOM() 
                LIMIT 1
            )
            WHERE "userId" IS NULL
        `);

    await queryRunner.query(`
            UPDATE "beans" 
            SET "userId" = (
                SELECT id FROM "users" 
                ORDER BY RANDOM() 
                LIMIT 1
            )
            WHERE "userId" IS NULL
        `);

    // Now alter the columns to be NOT NULL
    await queryRunner.query(
      `ALTER TABLE "machines" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "grinders" ALTER COLUMN "userId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "beans" ALTER COLUMN "userId" SET NOT NULL`,
    );

    // Finally add the foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "machines" ADD CONSTRAINT "FK_45fb0bdf6098ba93f062c869bc3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "grinders" ADD CONSTRAINT "FK_b96d4f27e0f6010a8face53c39c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "beans" ADD CONSTRAINT "FK_2f49ea0bf1b10a679014a631127" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "beans" DROP CONSTRAINT "FK_2f49ea0bf1b10a679014a631127"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grinders" DROP CONSTRAINT "FK_b96d4f27e0f6010a8face53c39c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "machines" DROP CONSTRAINT "FK_45fb0bdf6098ba93f062c869bc3"`,
    );
    await queryRunner.query(`ALTER TABLE "beans" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "grinders" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "machines" DROP COLUMN "userId"`);
  }
}
