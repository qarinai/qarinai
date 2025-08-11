import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpModule } from './modules/mcp/mcp.module';
import { AgentModule } from './modules/agent/agent.module';
import { ChatProviderModule } from './modules/chat-provider/chat-provider.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SettingModule } from './modules/settings/setting.module';
import { VectorStoreModule } from './modules/vector-store/vector-store.module';
import { FileModule } from './modules/file/file.module';
import { GraphileWorkerModule } from 'nestjs-graphile-worker';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/guards/auth.guard';
import { SecureKeyModule } from './modules/secure-keys/secure-key.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { validateConfig } from './common/config/config.validator';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the configuration available globally
      validate: validateConfig,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: parseInt(configService.get('DB_PORT', '5432')),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASS', 'postgres'),
        database: configService.get('DB_NAME', 'qarin'),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        migrationsRun: true,
        synchronize: false,
        migrationsTableName: '__migrations',
        migrations: [__dirname + '/migrations/**/*.{js,ts}'],
      }),
      inject: [ConfigService],
    }),
    GraphileWorkerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        connectionString: `postgres://${configService.get(
          'DB_USER',
          'postgres',
        )}:${configService.get('DB_PASS', 'postgres')}@${configService.get(
          'DB_HOST',
          'localhost',
        )}:${configService.get('DB_PORT', '5432')}/${configService.get('DB_NAME', 'qarin')}`,
        parsedCronItems: [],
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: {
        index: false,
      },
      renderPath: '*path',

      exclude: ['/api*subpath'], // Exclude API routes from static serving
    }),
    McpModule,
    AgentModule,
    ChatProviderModule,
    ConversationModule,
    SettingModule,
    VectorStoreModule,
    FileModule,
    UserModule,
    AuthModule,
    SecureKeyModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
