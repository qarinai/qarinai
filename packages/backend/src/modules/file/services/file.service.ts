import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from '../entities/file.entity';
import { Repository } from 'typeorm';

import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { fileTypeFromBuffer, fileTypeFromFile } from 'file-type';
import * as mTypes from 'mime-types';

@Injectable()
export class FileService {
  @InjectRepository(File)
  private readonly fileRepo: Repository<File>;

  async createAndSaveTxtFile(content: string, fileName: string) {
    if (!content || !fileName) {
      throw new BadRequestException('Content and fileName must be provided');
    }

    const cwd = process.cwd();
    const path = join(cwd, 'uploads', randomUUID() + '-' + fileName + '.txt');

    await writeFile(path, content);

    const newFile = this.fileRepo.create({
      name: fileName,
      size: Buffer.byteLength(content, 'utf8'),
      extension: 'txt',
      mimeType: 'text/plain',
      driver: 'local', // Assuming 'local' is the only driver for now
      location: path,
    });

    return this.fileRepo.save(newFile);
  }

  async saveFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const cwd = process.cwd();
    const path = join(cwd, 'uploads', randomUUID() + '-' + file.originalname);

    await writeFile(path, file.buffer);
    const typeBuffer = await fileTypeFromBuffer(file.buffer);
    const typePath = await fileTypeFromFile(path);
    const typeExt = mTypes.lookup(path);

    const mimeType =
      typeBuffer?.mime || typePath?.mime || typeExt || file.mimetype;

    const newFile = this.fileRepo.create({
      name: file.originalname,
      size: file.size,
      extension: file.originalname.split('.').pop() || '',
      mimeType,
      driver: 'local', // Assuming 'local' is the only driver for now
      location: path,
    });

    return this.fileRepo.save(newFile);
  }

  async getFileById(id: string, res: Response) {
    const file = await this.fileRepo.findOne({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (!existsSync(file.location)) {
      throw new NotFoundException('File does not exist on disk');
    }

    const fileStream = createReadStream(file.location);

    fileStream.pipe(res);
  }

  async getFileInfoById(id: string) {
    const file = await this.fileRepo.findOne({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }
}
