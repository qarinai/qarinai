import { Inject, Injectable } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { VectorStoreSourceStatus } from '../enums/vector-store-source-status.enum';
import { VectorStoreSourceService } from '../services/vector-store-source.service';

@Injectable()
@Task('update-vector-store-source-status')
export class UpdateVectorStoreSourceStatusTask {
  @Inject()
  private readonly vectorStoreSourceService: VectorStoreSourceService;

  @TaskHandler()
  async handler(payload: {
    sourceId: string;
    status: VectorStoreSourceStatus;
  }) {
    await this.vectorStoreSourceService.updateSourceStatus(
      payload.sourceId,
      payload.status,
    );
  }
}
