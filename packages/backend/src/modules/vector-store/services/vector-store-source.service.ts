import {
  BadRequestException,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VectorStoreSource } from '../entities/vector-store-source.entity';
import { Not, Repository } from 'typeorm';
import { CreateVectorStoreSourceDto } from '../dtos/create-vector-store-source.dto';
import { VectorStoreService } from './vector-store.service';
import { FileService } from 'src/modules/file/services/file.service';
import { VectorStoreSourceType } from '../enums/vector-store-source-type.enum';
import { File } from 'src/modules/file/entities/file.entity';
import { WorkerService } from 'nestjs-graphile-worker';
import { FileLoaderService } from './file-loader.service';
import { Document } from '@langchain/core/documents';
import { VectorStoreSourceStatus } from '../enums/vector-store-source-status.enum';
import { VectorStoreStatus } from '../enums/vector-store-status.enum';
import { SettingService } from 'src/modules/settings/services/setting.service';
import { ChatProviderService } from 'src/modules/chat-provider/services/chat-provider.service';
import { SettingKey } from 'src/modules/settings/enums/setting-key.enum';
import { ChatProviderModelService } from 'src/modules/chat-provider/services/chat-provider-model.service';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

@Injectable()
export class VectorStoreSourceService {
  @InjectRepository(VectorStoreSource)
  private readonly vectorStoreSourceRepo: Repository<VectorStoreSource>;

  @Inject()
  private readonly vectorStoreService: VectorStoreService;

  @Inject()
  private readonly fileService: FileService;

  @Inject()
  private readonly graphileWorker: WorkerService;

  @Inject()
  private readonly fileLoaderService: FileLoaderService;

  @Inject()
  private readonly settingService: SettingService;

  @Inject()
  private readonly chatProviderService: ChatProviderService;

  @Inject()
  private readonly chatProviderModelService: ChatProviderModelService;

  async createVectorStoreSource(dto: CreateVectorStoreSourceDto) {
    const vectorStore = await this.vectorStoreService.getVectorStoreById(
      dto.storeId,
    );

    const source = this.vectorStoreSourceRepo.create({
      name: dto.name,
      store: vectorStore,
    });

    let file: File;
    if (dto.fileId && !dto.content) {
      file = await this.fileService.getFileInfoById(dto.fileId);
      this.validateAllowedFileTypes(file);
    } else {
      if (!dto.content) {
        throw new BadRequestException(
          'Content must be provided if fileId is not set',
        );
      }
      // create and save a text file with the content provided
      file = await this.fileService.createAndSaveTxtFile(
        dto.content,
        dto.name || 'text-source',
      );
    }

    source.metadata = {
      fileId: file.id,
      fileName: file.name,
      fileSize: file.size,
      fileExtension: file.extension,
      fileMimeType: file.mimeType,
      fileDriver: file.driver,
      fileLocation: file.location,
    };

    // set all types to file for now
    source.type = VectorStoreSourceType.File;

    const createdSource = await this.vectorStoreSourceRepo.save(source);

    await this.scheduleFileSourceLoading(createdSource);
    createdSource.status = VectorStoreSourceStatus.Processing;
    await this.vectorStoreSourceRepo.save(createdSource);

    await this.vectorStoreService.updateStoreStatus(
      vectorStore.id,
      VectorStoreStatus.InProgress,
    );

    return createdSource;
  }

  async loadSourceDataIntoChunks(sourceId: string) {
    const source = await this.vectorStoreSourceRepo.findOne({
      where: { id: sourceId },
      relations: ['store'],
    });

    if (!source) {
      throw new BadRequestException('Source not found');
    }

    if (source.type === VectorStoreSourceType.File) {
      const fileInfo = await this.fileService.getFileInfoById(
        source.metadata.fileId as string,
      );

      const srcDocs = await this.fileLoaderService.loadFile(
        fileInfo.location,
        fileInfo.mimeType.startsWith('text/')
          ? 'txt'
          : fileInfo.extension.toLowerCase(),
      );

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        separators: source.metadata.fileMimeType.includes('markdown')
          ? RecursiveCharacterTextSplitter.getSeparatorsForLanguage('markdown')
          : undefined,
      });

      const documents = await splitter.splitDocuments(srcDocs);
      // prepare content for summarization
      let startIndex = 0;

      let contentToSummarize = documents[startIndex].pageContent;

      while (
        contentToSummarize.length < 500 &&
        documents.length > startIndex + 1
      ) {
        startIndex++;
        // if the first document is too short, summarize the next one
        contentToSummarize += '\n' + documents[startIndex].pageContent;
      }

      const summaryContext =
        `For context, this document is part of "${source.store.name}"\n` +
        `and it's shortly described as "${source.store.summary}"\n` +
        `this specific file is named: "${source.name}\n"`;

      const summary = await this.summarizeContent(
        contentToSummarize,
        summaryContext,
      );
      if (summary) {
        source.summary = summary;
        await this.vectorStoreSourceRepo.save(source);
      }

      for (const doc of documents) {
        await this.scheduleFileSourceChunkLoading(
          doc,
          source,
          documents.length,
        );
      }
    } else {
      throw new NotImplementedException(
        'Loading source data for this type is not implemented yet',
      );
    }
  }

  async updateSourceStatus(sourceId: string, status: VectorStoreSourceStatus) {
    const source = await this.vectorStoreSourceRepo.findOne({
      where: { id: sourceId },
      relations: ['store'],
    });

    if (!source) {
      throw new BadRequestException('Source not found');
    }

    source.status = status;
    await this.vectorStoreSourceRepo.save(source);

    // check if there are any sources not completed
    const hasIncompleteSources = await this.checkIfStoreHasInCompletedSources(
      source.store.id,
    );

    if (!hasIncompleteSources) {
      // update store generated description
      const storeSummary = await this.getAllCompiledSummariesForStore(
        source.store.id,
      );
      const summarizationContext =
        `For context, this store is named "${source.store.name}"\n` +
        `and it's shortly described as "${source.store.summary}"\n` +
        `it contains multiple sources, each summarized individually.\n`;
      const summarizedStoreDescription = await this.summarizeContent(
        storeSummary,
        summarizationContext,
      );
      // if no incomplete sources, update the store status to completed
      await this.vectorStoreService.updateStore(source.store.id, {
        status: VectorStoreStatus.Completed,
        generatedDescription: summarizedStoreDescription ?? undefined,
      });
    }
  }

  private async scheduleFileSourceChunkLoading(
    doc: Document<Record<string, string>>,
    source: VectorStoreSource,
    totalChunks: number,
  ) {
    await this.graphileWorker.addJob('embed-and-save-source-chunk', {
      doc,
      source,
      totalChunks,
    });
  }

  private async scheduleFileSourceLoading(source: VectorStoreSource) {
    await this.graphileWorker.addJob('load-file-source', {
      sourceId: source.id,
    });
  }

  private async getNonCompletedSourcesCount(storeId: string): Promise<number> {
    return this.vectorStoreSourceRepo.count({
      where: {
        store: { id: storeId },
        status: Not(VectorStoreSourceStatus.Completed),
      },
    });
  }

  private async checkIfStoreHasInCompletedSources(
    storeId: string,
  ): Promise<boolean> {
    const count = await this.getNonCompletedSourcesCount(storeId);
    return count > 0;
  }

  private async summarizeContent(
    content: string,
    context: string = '',
  ): Promise<string | null> {
    const defaultModelSetting = await this.settingService.getSetting(
      SettingKey.DefaultChatModel,
    );
    if (!defaultModelSetting) {
      return null;
    }

    const model = await this.chatProviderModelService.getModelById(
      defaultModelSetting.value,
    );

    if (!model) {
      return null;
    }

    const client =
      await this.chatProviderService.getChatProviderClientByModel(model);

    let requestedContent = content;
    if (requestedContent.length > 4000) {
      requestedContent = requestedContent.substring(0, 4000); // truncate to 4000 characters
    }

    const response = await client.chat.completions.create({
      model: model.name,
      messages: [
        {
          role: 'system',
          content:
            'You are a text summarization assistant.\n' +
            'You must summarize the content provided to you in a maximum of 100 characters',
        },
        {
          role: 'user',
          content:
            context +
            `\n\n` +
            `Please summarize the following content:\n\n${requestedContent}`,
        },
      ],
      temperature: 0.2,
    });

    if (response.choices.length > 0) {
      return response.choices[0].message.content;
    }
    return null;
  }

  private async getAllCompiledSummariesForStore(
    storeId: string,
  ): Promise<string> {
    const sources = await this.vectorStoreSourceRepo.find({
      where: { store: { id: storeId } },
      select: ['summary', 'name'],
    });

    if (sources.length === 0) {
      return '';
    }

    return sources
      .map((source) => {
        return `Source: ${source.name}\nSummary: ${source.summary}`;
      })
      .join('\n\n');
  }

  private validateAllowedFileTypes(file: File) {
    const allowedExtensions = ['txt', 'pdf', 'docx', 'pptx', 'csv', 'json'];

    if (!allowedExtensions.includes(file.extension)) {
      if (file.mimeType.startsWith('text/')) {
        // Allow any text file type
        return;
      }
      throw new BadRequestException(
        `File type ${file.extension} is not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
      );
    }
  }
}
