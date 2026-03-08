import { Injectable, Logger, InternalServerErrorException, BadRequestException, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import 'multer';

// Define a local interface to replace Express.Multer.File which often has namespace issues in newer NestJS/Express setups
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

@Injectable()
export class CloudinaryService {
    private readonly logger = new Logger(CloudinaryService.name);

    constructor(private configService: ConfigService) {
        const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
        const apiKey = this.configService.get('CLOUDINARY_API_KEY');
        const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

        if (!cloudName || !apiKey || !apiSecret) {
            this.logger.error('Cloudinary configuration credentials (NAME, KEY, or SECRET) are missing');
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }

    // ─── UPLOAD OPERATIONS ───

    async uploadImage(
        file: MulterFile,
        folder: string,
    ): Promise<UploadApiResponse> {
        try {
            if (!file || !file.buffer) {
                throw new BadRequestException('No file buffer provided for upload');
            }

            return await new Promise((resolve, reject) => {
                const upload = cloudinary.uploader.upload_stream(
                    { folder },
                    (error, result) => {
                        if (error || !result) {
                            this.logger.error(`Cloudinary upload stream error: ${error?.message || 'Unknown upload failure'}`);
                            return reject(new InternalServerErrorException('Cloudinary image upload failed'));
                        }
                        this.logger.log(`Image successfully uploaded to Cloudinary folder: ${folder}`);
                        resolve(result);
                    },
                );
                upload.end(file.buffer);
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Cloudinary service upload exception: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Image upload service encountered an error');
        }
    }

    // ─── DELETE OPERATIONS ───

    async deleteImage(publicId: string): Promise<any> {
        try {
            if (!publicId) {
                throw new BadRequestException('Cloudinary Public ID is required for deletion');
            }

            return await new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(publicId, (error, result) => {
                    if (error) {
                        this.logger.error(`Cloudinary deletion error for ${publicId}: ${error.message}`);
                        return reject(new InternalServerErrorException('Cloudinary image deletion failed'));
                    }
                    this.logger.log(`Image successfully deleted from Cloudinary: ${publicId}`);
                    resolve(result);
                });
            });
        } catch (error) {
            if (error instanceof HttpException) throw error;
            this.logger.error(`Cloudinary service deletion exception: ${error.message}`, error.stack);
            throw new InternalServerErrorException('Image deletion service encountered an error');
        }
    }
}
