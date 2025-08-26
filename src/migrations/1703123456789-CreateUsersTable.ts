import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1703123456789 implements MigrationInterface {
    name = 'CreateUsersTable1703123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Organizations table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organizations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_organizations" PRIMARY KEY ("id")
            )
        `);

        // Users table with org relation
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "supabase_id" character varying NOT NULL,
                "email" character varying NOT NULL,
                "is_paid" boolean NOT NULL DEFAULT false,
                "plan" character varying NOT NULL,
                "next_billing_at" TIMESTAMP,
                "org_id" uuid NOT NULL,
                "org_role" character varying NOT NULL DEFAULT 'owner',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_supabase_id" UNIQUE ("supabase_id"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "FK_users_org_id" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);
    }
} 