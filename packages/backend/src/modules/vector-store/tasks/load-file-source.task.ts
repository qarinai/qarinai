import { Inject, Injectable } from '@nestjs/common';
import { JobHelpers } from 'graphile-worker';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { VectorStoreSourceService } from '../services/vector-store-source.service';

@Injectable()
@Task('load-file-source')
export class LoadFileSourceTask {
  @Inject()
  private readonly vectorStoreSourceService: VectorStoreSourceService;

  @TaskHandler()
  async handler(payload: { sourceId: string }, _helpers: JobHelpers) {
    _helpers.logger.info('executing LoadFileSourceTask', {
      jobId: _helpers.job.id,
    });

    await this.vectorStoreSourceService.loadSourceDataIntoChunks(
      payload.sourceId,
    );
  }
}
