import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VectorStoreSourceChunk } from '../entities/vector-store-source-chunk.entity';
import { Repository } from 'typeorm';
import { EmbeddingsService } from './embeddings.service';
import * as pgvector from 'pgvector';
import { Document } from '@langchain/core/documents';
import { VectorStoreSource } from '../entities/vector-store-source.entity';
import { WorkerService } from 'nestjs-graphile-worker';
import { VectorStoreSourceStatus } from '../enums/vector-store-source-status.enum';
@Injectable()
export class VectorStoreSourceChunkService {
  @InjectRepository(VectorStoreSourceChunk)
  private readonly vectorStoreSourceChunkRepo: Repository<VectorStoreSourceChunk>;

  @Inject()
  private readonly embeddingsService: EmbeddingsService;

  @Inject()
  private readonly graphileWorker: WorkerService;

  async embedAndSaveChunk(
    doc: Document<Record<string, string>>,
    source: VectorStoreSource,
    totalChunks: number,
  ) {
    // prepare
    const chunkText = doc.pageContent;
    const metadata = doc.metadata || {};
    const sourceId = source.id;

    // embed
    const embeddingsTensor =
      await this.embeddingsService.generateEmbeddings(chunkText);

    console.log('Embeddings generated:', embeddingsTensor);

    // save
    const chunk = await this.vectorStoreSourceChunkRepo.save({
      content: chunkText,
      embeddings: pgvector.toSql(embeddingsTensor) as string,
      metadata,
      source: { id: sourceId }, // Assuming source is a foreign key reference
    });

    // check if this is the last chunk
    const isLastChunk = await this.checkIfLastChunk(sourceId, totalChunks);
    if (isLastChunk) {
      // update source status to completed
      await this.graphileWorker.addJob('update-vector-store-source-status', {
        sourceId,
        status: VectorStoreSourceStatus.Completed,
      });
    }

    return chunk;
  }

  async getChunksCountBySourceId(sourceId: string): Promise<number> {
    const count = await this.vectorStoreSourceChunkRepo.count({
      where: { source: { id: sourceId } },
    });
    return count;
  }

  async searchChunks(
    storeId: string,
    queryEmbeddings: number[],
    limit: number,
    operator: string,
  ) {
    const foundChunks = await this.vectorStoreSourceChunkRepo
      .createQueryBuilder('chunk')
      .leftJoin('chunk.source', 'source')
      .leftJoin('source.store', 'store')
      .select(['source.id', 'source.name', 'chunk.content', 'chunk.metadata'])
      .addSelect(
        '1 - (chunk.embeddings::vector ' +
          operator +
          ' :queryEmbeddings::vector)',
        'similarity',
      )
      .where('store.id = :storeId', { storeId })
      .orderBy('similarity', 'DESC')
      .setParameter('queryEmbeddings', pgvector.toSql(queryEmbeddings))
      .limit(limit)
      .getRawMany();

    return foundChunks.map((chunk) => ({
      content: chunk.chunk_content,
      source: {
        id: chunk.source_id,
        name: chunk.source_name,
        metadata: {
          ...chunk.chunk_metadata,
          source: undefined,
        },
      },
      score: parseFloat(chunk.similarity),
    }));
  }

  private async checkIfLastChunk(sourceId: string, totalChunks: number) {
    const chunksCount = await this.getChunksCountBySourceId(sourceId);
    return chunksCount === totalChunks;
  }
}
