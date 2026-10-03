import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { put } from '@vercel/blob';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxBytes = 5 * 1024 * 1024;

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MANAGER')
export class MediaController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: maxBytes } }))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn ảnh.');
    if (!allowed.has(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ JPG, PNG hoặc WebP.');
    }

    const ext =
      file.mimetype === 'image/png'
        ? 'png'
        : file.mimetype === 'image/webp'
          ? 'webp'
          : 'jpg';
    const pathname = `content/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

    try {
      const blob = await put(pathname, file.buffer, {
        access: 'public',
        contentType: file.mimetype,
        addRandomSuffix: true,
      });

      return {
        url: blob.url,
        width: null,
        height: null,
        bytes: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Vercel Blob error';
      const isProduction = process.env.NODE_ENV === 'production';

      // Safe diagnostics: report presence only, never credential values.
      console.error('[Vercel Blob upload failed]', {
        oidcTokenPresent: Boolean(process.env.VERCEL_OIDC_TOKEN),
        blobStoreIdPresent: Boolean(process.env.BLOB_STORE_ID),
        error: message,
      });

      throw new BadRequestException(
        isProduction
          ? 'Không thể lưu ảnh. Vui lòng thử lại sau.'
          : `Không thể lưu ảnh: ${message} (OIDC: ${process.env.VERCEL_OIDC_TOKEN ? 'present' : 'missing'}, Blob store: ${process.env.BLOB_STORE_ID ? 'present' : 'missing'})`,
      );
    }
  }
}
