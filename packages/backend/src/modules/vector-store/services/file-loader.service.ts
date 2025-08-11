import { Injectable } from '@nestjs/common';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx';
import { DocumentLoader } from '@langchain/core/document_loaders/base';

interface Constructor<T> {
  new (...args: any[]): T;
}

@Injectable()
export class FileLoaderService {
  private readonly loaders = {
    json: JSONLoader,
    txt: TextLoader,
    docx: DocxLoader,
    pdf: PDFLoader,
    csv: CSVLoader,
    pptx: PPTXLoader,
  } as const;

  async loadFile(filePath: string, fileExtension: string) {
    const Loader: Constructor<DocumentLoader> =
      this.loaders[fileExtension.toLowerCase() as keyof typeof this.loaders];

    if (!Loader) {
      throw new Error(`Unsupported file type: ${fileExtension}`);
    }
    const loader = new Loader(filePath);
    return await loader.load();
  }
}
