import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1703123456798 implements MigrationInterface {
    name = 'AddIndexes1703123456798'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Indexes for orgs and users table
        await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
        await queryRunner.query(`CREATE INDEX "IDX_users_supabase_id" ON "users" ("supabase_id")`);
 
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes for users table
        await queryRunner.query(`DROP INDEX "IDX_users_supabase_id"`);
        await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    }
} 