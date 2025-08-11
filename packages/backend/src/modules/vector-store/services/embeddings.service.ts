/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { pipeline, env } from '@huggingface/transformers';
import type { FeatureExtractionPipeline } from '@huggingface/transformers/types/pipelines';
import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class EmbeddingsService implements OnModuleInit, OnApplicationShutdown {
  private logger = new Logger('EmbeddingsService');
  private embeddingsExtractor: FeatureExtractionPipeline;

  async onModuleInit() {
    await this.loadEmbeddingsExtractor();
  }

  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Application shutdown signal received: ${signal}`);
    if (this.embeddingsExtractor) {
      await this.embeddingsExtractor.dispose();
      this.logger.log('Embeddings extractor disposed successfully');
    }
  }

  private async loadEmbeddingsExtractor() {
    try {
      // @ts-expect-error expect pipeline to have a too complex union error
      this.embeddingsExtractor = await pipeline(
        'embeddings',
        'Xenova/all-MiniLM-L6-v2',
        {
          dtype: 'fp32',
          progress_callback: (info) => {
            this.logger.debug(
              `Loading embeddings extractor: ${JSON.stringify(info)}`,
            );
          },
        },
      );
    } catch (error) {
      this.logger.error('Failed to initialize embeddings extractor', error);
      fs.rmdirSync(env.cacheDir, { recursive: true });
      process.exit(0); // for now, exit the process if the extractor fails to load
    }
  }

  async generateEmbeddings(content: string) {
    const tensor = await this.embeddingsExtractor(content, {
      pooling: 'mean',
      normalize: true,
    });

    return tensor.tolist()[0] as number[];
  }
}
