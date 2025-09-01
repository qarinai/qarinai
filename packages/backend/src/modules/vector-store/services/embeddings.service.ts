import { pipeline, env } from '@huggingface/transformers';
import type { FeatureExtractionPipeline } from '@huggingface/transformers/types/pipelines';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import * as fs from 'fs';
import { OpenAILlmProviderClientService } from 'src/modules/llm-provider/clients/open-ai-llm-provider-client.service';
import { LlmProviderModel } from 'src/modules/llm-provider/entities/llm-provider-model.entity';
import { LlmProviderModelService } from 'src/modules/llm-provider/services/llm-provider-model.service';
import { SettingKey } from 'src/modules/settings/enums/setting-key.enum';
import { SettingService } from 'src/modules/settings/services/setting.service';

@Injectable()
export class EmbeddingsService implements OnApplicationShutdown {
  private logger = new Logger('EmbeddingsService');
  private embeddingsExtractor: FeatureExtractionPipeline;

  @Inject()
  private readonly settingsService: SettingService;

  @Inject()
  private readonly llmProviderModelService: LlmProviderModelService;

  @Inject()
  private readonly providerClientService: OpenAILlmProviderClientService;

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
    const modelSetting = await this.settingsService.getSetting(
      SettingKey.DefaultEmbeddingModel,
    );

    if (!modelSetting) {
      await this.loadEmbeddingsExtractor();
      return this.generateEmbeddingsFromLocalModel(content);
    }

    const model = await this.llmProviderModelService.getModelById(
      modelSetting.value,
      ['provider', 'provider.apiKey'],
    );
    if (!model) {
      this.logger.warn(
        `Default embedding model with id ${modelSetting.value} not found. Falling back to local model.`,
      );
      return this.generateEmbeddingsFromLocalModel(content);
    }

    return this.generateEmbeddingsFromOpenAI(content, model);
  }

  private async generateEmbeddingsFromLocalModel(content: string) {
    if (!this.embeddingsExtractor) {
      await this.loadEmbeddingsExtractor();
    }
    const tensor = await this.embeddingsExtractor(content, {
      pooling: 'mean',
      normalize: true,
    });

    return tensor.tolist()[0] as number[];
  }

  private async generateEmbeddingsFromOpenAI(
    content: string,
    model: LlmProviderModel,
  ) {
    const client = await this.providerClientService.with(model.provider);
    const response = await client.embeddings.create({
      model: model.name,
      input: content,
    });

    return response.data[0].embedding;
  }
}
