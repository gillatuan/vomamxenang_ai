import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const allowed = new Set(['image/jpeg','image/png','image/webp']);
const maxBytes = 5 * 1024 * 1024;

@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_MANAGER')
export class MediaController {
  @Post('image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: maxBytes } }))
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn ảnh.');
    if (!allowed.has(file.mimetype)) throw new BadRequestException('Chỉ hỗ trợ JPG, PNG hoặc WebP.');
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) throw new BadRequestException('Image storage chưa được cấu hình.');

    const ext = file.mimetype === 'image/png' ? 'png' : file.mimetype === 'image/webp' ? 'webp' : 'jpg';
    const pathname = `content/${Date.now()}-${Math.random().toString(36).slice(2,10)}.${ext}`;
    const response = await fetch(`https://blob.vercel-storage.com/${pathname}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.mimetype, 'x-content-type': file.mimetype },
      body: file.buffer,
    });
    if (!response.ok) throw new BadRequestException('Không thể lưu ảnh.');
    const data = await response.json() as { url?: string };
    if (!data.url) throw new BadRequestException('Storage không trả về URL ảnh.');
    return { url: data.url, width: null, height: null, bytes: file.size, mimeType: file.mimetype };
  }
}
