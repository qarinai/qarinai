import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VectorStore } from './entities/vector-store.entity';
import { VectorStoreSource } from './entities/vector-store-source.entity';
import { VectorStoreSourceChunk } from './entities/vector-store-source-chunk.entity';
import { VectorStoreSourceChunkService } from './services/vector-store-source-chunk.service';
import { VectorStoreSourceService } from './services/vector-store-source.service';
import { VectorStoreService } from './services/vector-store.service';
import { FileModule } from '../file/file.module';
import { LoadFileSourceTask } from './tasks/load-file-source.task';
import { EmbedAndSaveSourceChunkTask } from './tasks/embed-and-save-source-chunk.task';
import { EmbeddingsService } from './services/embeddings.service';
import { FileLoaderService } from './services/file-loader.service';
import { UpdateVectorStoreSourceStatusTask } from './tasks/update-vector-store-source-status.task';
import { VectorStoreController } from './controllers/vector-store.controller';
import { VectorStoreSourceController } from './controllers/vector-store-source.controller';
import { ChatProviderModule } from '../chat-provider/chat-provider.module';
import { McpModule } from '../mcp/mcp.module';

@Module({
  controllers: [VectorStoreController, VectorStoreSourceController],
  imports: [
    TypeOrmModule.forFeature([
      VectorStore,
      VectorStoreSource,
      VectorStoreSourceChunk,
    ]),
    FileModule,
    ChatProviderModule,
    forwardRef(() => McpModule),
  ],
  providers: [
    VectorStoreService,
    VectorStoreSourceService,
    VectorStoreSourceChunkService,
    // tasks
    LoadFileSourceTask,
    EmbedAndSaveSourceChunkTask,
    UpdateVectorStoreSourceStatusTask,
    // util services
    EmbeddingsService,
    FileLoaderService,
  ],
  exports: [VectorStoreService],
})
export class VectorStoreModule {}
