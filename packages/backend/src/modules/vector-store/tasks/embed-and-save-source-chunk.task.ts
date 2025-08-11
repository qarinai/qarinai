import { Inject, Injectable } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { VectorStoreSourceChunkService } from '../services/vector-store-source-chunk.service';
import { Document } from '@langchain/core/documents';
import { VectorStoreSource } from '../entities/vector-store-source.entity';
import { JobHelpers } from 'graphile-worker';

@Injectable()
@Task('embed-and-save-source-chunk')
export class EmbedAndSaveSourceChunkTask {
  @Inject()
  private readonly vectorStoreSourceChunkService: VectorStoreSourceChunkService;

  @TaskHandler()
  async handler(
    payload: {
      doc: Document<Record<string, string>>;
      source: VectorStoreSource;
      totalChunks: number;
    },
    _helpers: JobHelpers,
  ) {
    _helpers.logger.info('executing EmbedAndSaveSourceChunkTask', {
      jobId: _helpers.job.id,
    });
    await this.vectorStoreSourceChunkService.embedAndSaveChunk(
      payload.doc,
      payload.source,
      payload.totalChunks,
    );
  }
}
