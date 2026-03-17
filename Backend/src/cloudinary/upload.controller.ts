import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { memoryStorage } from 'multer';

// Shared multer config — memory storage so buffer is available for Cloudinary
const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
};

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  // ── POST /api/upload/single ──────────────────────────────────────────────
  // Field name: "file"
  // Query param: folder (optional, default: "general")
  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'general',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided. Send it as form-data field "file".');
    }
    const result = await this.cloudinaryService.uploadFile(file, folder);
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  // ── POST /api/upload/multiple ────────────────────────────────────────────
  // Field name: "files" (up to 10 at once)
  // Query param: folder (optional, default: "general")
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder = 'general',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided. Send them as form-data field "files".');
    }

    const results = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadFile(file, folder)),
    );

    return {
      count: results.length,
      images: results.map((r) => ({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
        bytes: r.bytes,
      })),
    };
  }
}
