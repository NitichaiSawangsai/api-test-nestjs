import {MigrationInterface, QueryRunner} from "typeorm";

export class SetupTable1717234396237 implements MigrationInterface {
    name = 'SetupTable1717234396237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "user-management";`);
        await queryRunner.query(`CREATE TYPE "user-management"."user_status_enum" AS ENUM('inactive', 'active')`);
        await queryRunner.query(`CREATE TABLE "user-management"."user" ("id" SERIAL NOT NULL, "username" character varying, "password" character varying, "refresh_token" character varying, "email" character varying NOT NULL, "status" "user-management"."user_status_enum" NOT NULL, "avatar" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" character varying NOT NULL, "updated_by" character varying, "version" integer NOT NULL, "last_login" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user-management"."user" ("email") `);
        await queryRunner.query(`
            INSERT INTO "user-management"."user" ("id", "username", "password", "email", "status", "created_at", "created_by", "version") VALUES (1, 'test', 'c8db92dee1f74a867042ca72ff24a438a7c235502f0add27715d62b6615a53da', 'test@scg.com', 'active', NOW(), 'test@scg.com', 1);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "user-management"."IDX_e12875dfb3b1d92d7d7c5377e2"`);
        await queryRunner.query(`DROP TABLE "user-management"."user"`);
        await queryRunner.query(`DROP TYPE "user-management"."user_status_enum"`);
        await queryRunner.query(`DROP SCHEMA "user-management" CASCADE;`);
    }

}
