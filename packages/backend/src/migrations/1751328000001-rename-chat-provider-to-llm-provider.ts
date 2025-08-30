import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameChatProviderToLlmProvider1751328000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints that reference the tables we're renaming
    await queryRunner.query(
      `ALTER TABLE "agent" DROP CONSTRAINT "FK_agent_default_model_chat_provider_model"`,
    );

    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_chat_provider_model" DROP CONSTRAINT "FK_agent_allowed_models_chat_provider_model"`,
    );

    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_message_model_chat_provider_model"`,
    );

    await queryRunner.query(
      `ALTER TABLE "chat_provider_model" DROP CONSTRAINT "FK_chat_provider_model_chat_provider"`,
    );

    // Rename the many-to-many junction table first
    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_chat_provider_model" RENAME TO "agent_allowed_models_llm_provider_model"`,
    );

    // Rename column in the junction table
    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_llm_provider_model" RENAME COLUMN "chat_provider_model_id" TO "llm_provider_model_id"`,
    );

    // Rename the chat_provider_model table
    await queryRunner.query(
      `ALTER TABLE "chat_provider_model" RENAME TO "llm_provider_model"`,
    );

    // Rename the chat_provider table
    await queryRunner.query(
      `ALTER TABLE "chat_provider" RENAME TO "llm_provider"`,
    );

    // Recreate foreign key constraints with new names
    await queryRunner.query(
      `ALTER TABLE "llm_provider_model" ADD CONSTRAINT "FK_llm_provider_model_llm_provider" FOREIGN KEY ("provider_id") REFERENCES "llm_provider"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "agent" ADD CONSTRAINT "FK_agent_default_model_llm_provider_model" FOREIGN KEY ("default_model_id") REFERENCES "llm_provider_model"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_llm_provider_model" ADD CONSTRAINT "FK_agent_allowed_models_llm_provider_model" FOREIGN KEY ("llm_provider_model_id") REFERENCES "llm_provider_model"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_model_llm_provider_model" FOREIGN KEY ("model_id") REFERENCES "llm_provider_model"("id") ON DELETE CASCADE`,
    );

    // update enum setting_key_enum to include new keys
    await queryRunner.query(
      `ALTER TYPE "public"."setting_key_enum" RENAME TO "setting_key_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."setting_key_enum" AS ENUM('default_llm_provider', 'default_llm_model', 'default_embedding_model')`,
    );

    // set column to use text type temporarily
    await queryRunner.query(
      `ALTER TABLE "setting" ALTER COLUMN "key" TYPE text`,
    );
    // Update setting keys to use new naming
    await queryRunner.query(
      `UPDATE "setting" SET "key" = 'default_llm_provider' WHERE "key" = 'default_chat_provider'`,
    );

    await queryRunner.query(
      `UPDATE "setting" SET "key" = 'default_llm_model' WHERE "key" = 'default_chat_model'`,
    );
    // set column to use new enum type
    await queryRunner.query(
      `ALTER TABLE "setting" ALTER COLUMN "key" TYPE "setting_key_enum" USING "key"::text::"setting_key_enum"`,
    );

    // drop old enum type
    await queryRunner.query(`DROP TYPE "setting_key_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert setting keys
    await queryRunner.query(
      `UPDATE "setting" SET "key" = 'default_chat_provider' WHERE "key" = 'default_llm_provider'`,
    );

    await queryRunner.query(
      `UPDATE "setting" SET "key" = 'default_chat_model' WHERE "key" = 'default_llm_model'`,
    );

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "agent" DROP CONSTRAINT "FK_agent_default_model_llm_provider_model"`,
    );

    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_llm_provider_model" DROP CONSTRAINT "FK_agent_allowed_models_llm_provider_model"`,
    );

    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_message_model_llm_provider_model"`,
    );

    await queryRunner.query(
      `ALTER TABLE "llm_provider_model" DROP CONSTRAINT "FK_llm_provider_model_llm_provider"`,
    );

    // Rename tables back to original names
    await queryRunner.query(
      `ALTER TABLE "llm_provider" RENAME TO "chat_provider"`,
    );

    await queryRunner.query(
      `ALTER TABLE "llm_provider_model" RENAME TO "chat_provider_model"`,
    );

    // Rename column back in the junction table
    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_llm_provider_model" RENAME COLUMN "llm_provider_model_id" TO "chat_provider_model_id"`,
    );

    // Rename the junction table back
    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_llm_provider_model" RENAME TO "agent_allowed_models_chat_provider_model"`,
    );

    // Recreate original foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chat_provider_model" ADD CONSTRAINT "FK_chat_provider_model_chat_provider" FOREIGN KEY ("provider_id") REFERENCES "chat_provider"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "agent" ADD CONSTRAINT "FK_agent_default_model_chat_provider_model" FOREIGN KEY ("default_model_id") REFERENCES "chat_provider_model"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "agent_allowed_models_chat_provider_model" ADD CONSTRAINT "FK_agent_allowed_models_chat_provider_model" FOREIGN KEY ("chat_provider_model_id") REFERENCES "chat_provider_model"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_model_chat_provider_model" FOREIGN KEY ("model_id") REFERENCES "chat_provider_model"("id") ON DELETE CASCADE`,
    );
  }
}
