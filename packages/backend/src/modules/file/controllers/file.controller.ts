import {
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileService } from '../services/file.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('files')
export class FileController {
  @Inject()
  private readonly fileService: FileService;

  @Get('download/:id')
  downloadFile(@Param('id') id: string, @Res() res: Response) {
    return this.fileService.getFileById(id, res);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('file'))
  uploadFile(@UploadedFiles() files: Express.Multer.File[]) {
    return Promise.all(files.map((file) => this.fileService.saveFile(file)));
  }
}
