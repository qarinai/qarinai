import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumnOptions,
} from 'typeorm';
import * as argon2 from 'argon2';

const defaultColumns: TableColumnOptions[] = [
  {
    name: 'id',
    type: 'uuid',
    isPrimary: true,
    isGenerated: true,
    generationStrategy: 'uuid',
  },
  {
    name: 'created_at',
    type: 'timestamptz',
    default: 'now()',
  },
  {
    name: 'updated_at',
    type: 'timestamptz',
    default: 'now()',
  },
  {
    name: 'deleted_at',
    type: 'timestamptz',
    isNullable: true,
  },
];

export class Init1751328000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ensure the vector extension is created
    // this is necessary for vector operations in PostgreSQL
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // create the user table
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          ...defaultColumns,
          {
            name: 'username',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
          },
        ],
        uniques: [
          {
            name: 'UQ_user_username',
            columnNames: ['username'],
          },
        ],
      }),
    );

    // create the personal access tokens table
    await queryRunner.createTable(
      new Table({
        name: 'personal_access_token',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'hashed_token',
            type: 'varchar',
          },
          {
            name: 'expiration_date',
            type: 'timestamptz',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'user',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_user_personal_access_token',
          },
        ],
      }),
    );

    // create the files table
    await queryRunner.createTable(
      new Table({
        name: 'file',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'size',
            type: 'numeric',
          },
          {
            name: 'extension',
            type: 'varchar',
          },
          {
            name: 'mime_type',
            type: 'varchar',
          },
          {
            name: 'driver',
            type: 'enum',
            enum: ['local'],
            enumName: 'file_driver_enum',
            default: `'local'`,
          },
          {
            name: 'location',
            type: 'varchar',
          },
        ],
      }),
    );

    // create the settings table
    await queryRunner.createTable(
      new Table({
        name: 'setting',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'key',
            type: 'enum',
            enum: [
              'default_chat_provider',
              'default_chat_model',
              'default_embedding_model',
            ],
            enumName: 'setting_key_enum',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
    );

    // create the secure keys table
    await queryRunner.createTable(
      new Table({
        name: 'secure_key',
        columns: [
          ...defaultColumns,
          {
            name: 'value',
            type: 'varchar',
          },
          {
            name: 'mask',
            type: 'varchar',
          },
        ],
      }),
    );

    // create the chat provider table
    await queryRunner.createTable(
      new Table({
        name: 'chat_provider',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'api_base_url',
            type: 'varchar',
          },
          {
            name: 'api_key_id',
            type: 'uuid',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['api_key_id'],
            referencedTableName: 'secure_key',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            name: 'FK_chat_provider_secure_key',
          },
        ],
      }),
    );

    // create the chat provider model table
    await queryRunner.createTable(
      new Table({
        name: 'chat_provider_model',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'provider_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['provider_id'],
            referencedTableName: 'chat_provider',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_chat_provider_model_chat_provider',
          },
        ],
      }),
    );

    // create the mcp adapter server table
    await queryRunner.createTable(
      new Table({
        name: 'mcp_adapter_server',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['swagger', 'mcp_proxy', 'vector_store'],
            enumName: 'mcp_adapter_server_type_enum',
            default: `'swagger'`,
          },
          {
            name: 'security',
            type: 'jsonb',
          },
        ],
      }),
    );

    // create the mcp adapter tool table
    await queryRunner.createTable(
      new Table({
        name: 'mcp_adapter_tool',
        columns: [
          ...defaultColumns,
          {
            name: 'server_id',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['rest_api_call', 'vector_search', 'mcp_call_tool'],
            enumName: 'mcp_tool_types_enum',
            default: `'rest_api_call'`,
          },
          {
            name: 'tool_data',
            type: 'jsonb',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['server_id'],
            referencedTableName: 'mcp_adapter_server',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_mcp_adapter_tool_mcp_adapter_server',
          },
        ],
        uniques: [
          {
            name: 'UQ_mcp_tool_server_id_name',
            columnNames: ['server_id', 'name'],
          },
        ],
      }),
    );

    // create the vector store table
    await queryRunner.createTable(
      new Table({
        name: 'vector_store',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'summary',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['Pending', 'InProgress', 'Completed'],
            enumName: 'vector_store_status_enum',
            default: `'Pending'`,
          },
          {
            name: 'generated_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'mcp_server_id',
            type: 'uuid',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['mcp_server_id'],
            referencedTableName: 'mcp_adapter_server',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            name: 'FK_vector_store_mcp_adapter_server',
          },
        ],
      }),
    );

    // create the vector store source table
    await queryRunner.createTable(
      new Table({
        name: 'vector_store_source',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'file'],
            enumName: 'vector_store_source_type_enum',
            default: `'text'`,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed'],
            enumName: 'vector_store_source_status_enum',
            default: `'pending'`,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'store_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['store_id'],
            referencedTableName: 'vector_store',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_vector_store_source_vector_store',
          },
        ],
      }),
    );

    // create the vector store source chunk table
    await queryRunner.createTable(
      new Table({
        name: 'vector_store_source_chunk',
        columns: [
          ...defaultColumns,
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'embeddings',
            type: 'vector',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'source_id',
            type: 'uuid',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['source_id'],
            referencedTableName: 'vector_store_source',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_vector_store_source_chunk_vector_store_source',
          },
        ],
      }),
    );

    // create the agent table
    await queryRunner.createTable(
      new Table({
        name: 'agent',
        columns: [
          ...defaultColumns,
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'identity_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'system_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'tempreture',
            type: 'numeric',
            default: 0.2,
          },
          {
            name: 'max_completion_tokens',
            type: 'numeric',
            default: -1,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'default_model_id',
            type: 'uuid',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['default_model_id'],
            referencedTableName: 'chat_provider_model',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
            name: 'FK_agent_default_model_chat_provider_model',
          },
        ],
      }),
    );

    // create the many-to-many relationship between agent and allowed models
    await queryRunner.createTable(
      new Table({
        name: 'agent_allowed_models_chat_provider_model',
        columns: [
          {
            name: 'agent_id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'chat_provider_model_id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['agent_id'],
            referencedTableName: 'agent',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_agent_allowed_models_agent',
          },
          {
            columnNames: ['chat_provider_model_id'],
            referencedTableName: 'chat_provider_model',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_agent_allowed_models_chat_provider_model',
          },
        ],
      }),
    );

    // create the many-to-many relationship between agent and linked MCP servers
    await queryRunner.createTable(
      new Table({
        name: 'agent_linked_mcp_servers_mcp_adapter_server',
        columns: [
          {
            name: 'agent_id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: false,
          },
          {
            name: 'mcp_adapter_server_id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['agent_id'],
            referencedTableName: 'agent',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_agent_linked_mcp_servers_agent',
          },
          {
            columnNames: ['mcp_adapter_server_id'],
            referencedTableName: 'mcp_adapter_server',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_agent_linked_mcp_servers_mcp_adapter_server',
          },
        ],
      }),
    );

    // create the conversation table
    await queryRunner.createTable(
      new Table({
        name: 'conversation',
        columns: [
          ...defaultColumns,
          {
            name: 'agent_id',
            type: 'uuid',
          },
          {
            name: 'system_message',
            type: 'text',
          },
          {
            name: 'total_tokens',
            type: 'int',
            default: 0,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['agent_id'],
            referencedTableName: 'agent',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_conversation_agent',
          },
        ],
      }),
    );

    // create the message table
    await queryRunner.createTable(
      new Table({
        name: 'message',
        columns: [
          ...defaultColumns,
          {
            name: 'conversation_id',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'generating', 'completed', 'failed', 'cancelled'],
            enumName: 'message_status_enum',
            default: `'pending'`,
          },
          {
            name: 'original_msg_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'model_id',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'assistant', 'tool'],
            enumName: 'message_role_enum',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'additional_data',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'num_tokens',
            type: 'int',
            default: 0,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['conversation_id'],
            referencedTableName: 'conversation',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_message_conversation',
          },
          {
            columnNames: ['model_id'],
            referencedTableName: 'chat_provider_model',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
            name: 'FK_message_model_chat_provider_model',
          },
        ],
      }),
    );

    // create default admin account
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
    const hashedPassword = await argon2.hash(defaultPassword);
    await queryRunner.query(`
      INSERT INTO "user" (username, password) values ('admin', '${hashedPassword}')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drop the message table
    await queryRunner.dropTable('message');

    // drop the conversation table
    await queryRunner.dropTable('conversation');

    // drop the many-to-many relationship between agent and linked MCP servers
    await queryRunner.dropTable('agent_linked_mcp_servers_mcp_adapter_server');

    // drop the many-to-many relationship between agent and allowed models
    await queryRunner.dropTable('agent_allowed_models_chat_provider_model');

    // drop the agent table
    await queryRunner.dropTable('agent');

    // drop the vector store source chunk table
    await queryRunner.dropTable('vector_store_source_chunk');

    // drop the vector store source table
    await queryRunner.dropTable('vector_store_source');

    // drop the vector store table
    await queryRunner.dropTable('vector_store');

    // drop the mcp adapter tool table
    await queryRunner.dropTable('mcp_adapter_tool');

    // drop the mcp adapter server table
    await queryRunner.dropTable('mcp_adapter_server');

    // drop the chat provider model table
    await queryRunner.dropTable('chat_provider_model');

    // drop the chat provider table
    await queryRunner.dropTable('chat_provider');

    // drop the secure keys table
    await queryRunner.dropTable('secure_key');

    // drop the settings table
    await queryRunner.dropTable('setting');

    // drop the files table
    await queryRunner.dropTable('file');

    // drop the personal access tokens table
    await queryRunner.dropTable('personal_access_token');

    // drop the user table
    await queryRunner.dropTable('user');
  }
}
